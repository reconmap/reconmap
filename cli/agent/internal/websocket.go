package internal

import (
	"net/http"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

// UpgradeRequest converts http connection to a websocket one.
func UpgradeRequest(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error("Unable to upgrade connection", zap.Error(err))
		return nil, err
	}
	return conn, nil
}
