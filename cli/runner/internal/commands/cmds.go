package commands

import (
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"

	"github.com/reconmap/shared-lib/pkg/logging"
	"github.com/reconmap/shared-lib/pkg/models"

	"github.com/reconmap/cli/internal/terminal"
	"github.com/reconmap/shared-lib/pkg/io"
)

func RunCommand(projectId int, usage *models.CommandUsage, vars []string) error {
	logger := logging.GetLoggerInstance()

	var err error
	argsRendered := terminal.ReplaceArgs(usage, vars)

	logger.Infof("running command '%s' with arguments '%s'", usage.ExecutablePath, argsRendered)

	cmd := exec.Command(usage.ExecutablePath, strings.Fields(argsRendered)...) // #nosec G204
	var stdout, stderr []byte
	var errStdout, errStderr error
	stdoutIn, _ := cmd.StdoutPipe()
	stderrIn, _ := cmd.StderrPipe()
	err = cmd.Start()
	if err != nil {
		logger.Fatalf("command execution failed with '%s'", err)
	}
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		stdout, errStdout = io.CopyAndCapture(os.Stdout, stdoutIn)
		wg.Done()
	}()

	stderr, errStderr = io.CopyAndCapture(os.Stderr, stderrIn)

	wg.Wait()

	err = cmd.Wait()
	if err != nil {
		logger.Fatalf("error waiting for command to finish: %s", err)
	}
	if errStdout != nil || errStderr != nil {
		logger.Fatal("failed to capture stdout or stderr")
	}
	outStr, errStr := string(stdout), string(stderr)

	stdoutFilename := filepath.Clean(strconv.Itoa(usage.ID) + ".out")
	f, err := os.Create(stdoutFilename)
	if err != nil {
		logger.Error(err)
		return err
	}

	defer func() {
		if err := f.Close(); err != nil {
			logger.Warn("Error closing file: %s", err)
		}
	}()
	_, err = f.WriteString(outStr)
	if err != nil {
		logger.Error(err)
	}

	if usage.OutputCapturingMode == "stdout" {
		usage.OutputFilename = stdoutFilename
	}
	logger.Infof("command output written to '%s'", usage.OutputFilename)

	if len(errStr) > 0 {
		logger.Error(errStr)
	}

	return err
}
