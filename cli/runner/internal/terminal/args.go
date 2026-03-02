package terminal

import (
	"regexp"
	"strings"

	"github.com/reconmap/shared-lib/pkg/models"
)

func ReplaceArgs(command *models.CommandUsage, vars []string) string {
	var updatedArgs = command.Arguments
	for _, v := range vars {
		var tokens = strings.Split(v, "=")
		var validID = regexp.MustCompile("{{{" + tokens[0] + ".*?}}}")
		updatedArgs = validID.ReplaceAllString(updatedArgs, tokens[1])
	}

	return updatedArgs
}
