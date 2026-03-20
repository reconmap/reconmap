package commands

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/reconmap/shared-lib/pkg/logging"
	"github.com/reconmap/shared-lib/pkg/models"

	"github.com/reconmap/cli/internal/terminal"
	sharedio "github.com/reconmap/shared-lib/pkg/io"
)

var CurrentExecutor sharedio.Executor = &sharedio.DefaultExecutor{}

func RunCommand(projectId int, usage *models.CommandUsage, vars []string) error {
	logger := logging.GetLoggerInstance()

	argsRendered := terminal.ReplaceArgs(usage, vars)

	logger.Infof("running command '%s' with arguments '%s'", usage.ExecutablePath, argsRendered)

	stdout, stderr, err := CurrentExecutor.Execute(usage.ExecutablePath, strings.Fields(argsRendered)...)
	if err != nil {
		logger.Errorf("command execution failed with '%s'", err)
		return err
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
