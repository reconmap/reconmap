package internal

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"reconmap/agent/internal/configuration"
	"syscall"
	"unsafe"

	"github.com/creack/pty"
	"github.com/gorilla/websocket"
	sharedconfig "github.com/reconmap/shared-lib/pkg/configuration"
	"go.uber.org/zap"
)

const (
	bufferSizeBytes = 1024
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  bufferSizeBytes,
	WriteBufferSize: bufferSizeBytes,
}

type windowSize struct {
	Rows uint16 `json:"rows"`
	Cols uint16 `json:"cols"`
	X    uint16
	Y    uint16
}

func tryWriteMessage(conn *websocket.Conn, messageType int, data []byte) {
	if err := conn.WriteMessage(messageType, data); err != nil {
		logger.Error("Unable to write message", zap.Error(err))
	}
}

func tryWriteTextMessage(conn *websocket.Conn, str string) {
	tryWriteMessage(conn, websocket.TextMessage, []byte(str))
}

func tryWriteBinaryMessage(conn *websocket.Conn, data []byte) {
	tryWriteMessage(conn, websocket.BinaryMessage, data)
}

func handleWebsocket(w http.ResponseWriter, r *http.Request) {
	config, _ := sharedconfig.ReadConfig[configuration.Config]("config-reconmapd.json")

	err := CheckRequestToken(r)
	if err != nil {
		logger.Error(err)
		return
	}

	conn, err := UpgradeRequest(w, r)
	if err != nil {
		logger.Error(err)
		return
	}

	l := logger.With("remoteaddr", r.RemoteAddr)

	params := r.URL.Query()

	cmd := exec.Command("/bin/bash", "-l")
	cmd.Dir = config.AgentDirectory
	cmd.Env = append(os.Environ(),
		"LANG=en_GB.UTF-8",
		"TERM=xterm-256colors",
		"RMAP_SESSION_TOKEN="+params.Get("token"))

	ttyFile, err := pty.Start(cmd)
	if err != nil {
		l.Error("Unable to start pty/cmd", zap.Error(err))
		tryWriteTextMessage(conn, err.Error())
		return
	}
	defer func() {
		var err error
		if err = cmd.Process.Kill(); err != nil {
			l.Error("Couldn't kill process", zap.Error(err))
		}
		if _, err = cmd.Process.Wait(); err != nil {
			l.Error("Couldn't wait for process", zap.Error(err))
		}
		if err = ttyFile.Close(); err != nil {
			l.Error("Couldn't close tty", zap.Error(err))
		}
		if err = conn.Close(); err != nil {
			l.Error("Couldn't close connection", zap.Error(err))
		}
	}()

	go sendTtyBuffer(l, ttyFile, conn)

	for {
		err := receiveWsBuffer(l, conn, ttyFile)
		if err != nil {
			l.Error("unable to read from conn (%w)", err)
			break
		}
	}
}

func sendTtyBuffer(l *zap.SugaredLogger, ttyFile *os.File, conn *websocket.Conn) {
	for {
		buf := make([]byte, bufferSizeBytes)
		read, err := ttyFile.Read(buf)
		if err != nil {
			l.Errorf("unable to read from tty (%w)", err)
			return
		}
		tryWriteBinaryMessage(conn, buf[:read])
	}
}

func receiveWsBuffer(l *zap.SugaredLogger, conn *websocket.Conn, ttyFile *os.File) error {
	messageType, reader, err := conn.NextReader()
	if err != nil {
		if websocket.IsCloseError(err,
			websocket.CloseNormalClosure,   // Normal.
			websocket.CloseAbnormalClosure, // OpenSSH killed proxy client.
		) {
			return fmt.Errorf("received closed error (%w)", err)
		}

		return fmt.Errorf("Unable to grab next reader (%w)", err)
	}

	if messageType == websocket.CloseMessage {
		return errors.New("close message received")
	}

	if messageType == websocket.TextMessage {
		tryWriteTextMessage(conn, "Unexpected text message")
		return errors.New("unexpected text message")
	}

	dataTypeBuf := make([]byte, 1)
	read, err := reader.Read(dataTypeBuf)
	if err != nil {
		tryWriteTextMessage(conn, "Unable to read message type from reader")
		return fmt.Errorf("unable to read message type from reader (%w)", err)
	}

	if read != 1 {
		return fmt.Errorf("unexpected number of bytes read (%d)", read)
	}

	switch dataTypeBuf[0] {
	case 0:
		bytesWritten, err := io.Copy(ttyFile, reader)
		if err != nil {
			l.Errorf("Error after copying %d bytes", bytesWritten)
		}
	case 1:
		winSize, err := tryDecodeWindowSize(reader)
		if err != nil {
			tryWriteTextMessage(conn, "Error decoding resize message: "+err.Error())
			return err
		}
		resizeTerminal(l, winSize, ttyFile)
	default:
		l.Error("Unknown data type", zap.Uint8("dataType", dataTypeBuf[0]))
	}

	return nil
}

func tryDecodeWindowSize(reader io.Reader) (windowSize, error) {
	winSize := windowSize{}
	decoder := json.NewDecoder(reader)
	err := decoder.Decode(&winSize)
	return winSize, err
}

// #nosec G103
// getString converts byte slice to a string without memory allocation.
// See https://groups.google.com/forum/#!msg/Golang-Nuts/ENgbUzYvCuU/90yGx7GUAgAJ
func resizeTerminal(l *zap.SugaredLogger, winSize windowSize, ttyFile *os.File) {
	l.Info("Resizing terminal", zap.Uint16("rows", winSize.Rows), zap.Uint16("cols", winSize.Cols))
	_, _, errno := syscall.Syscall(
		syscall.SYS_IOCTL,
		ttyFile.Fd(),
		syscall.TIOCSWINSZ,
		uintptr(unsafe.Pointer(&winSize)),
	)
	if errno != 0 {
		l.Error("unable to resize terminal", zap.Error(errno))
	}
}
