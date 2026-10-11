package internal

import (
	"fmt"
	"net/http"
	"net/url"
	"reconmap/agent/internal/configuration"
	"strings"

	"github.com/gorilla/websocket"
	sharedconfig "github.com/reconmap/shared-lib/pkg/configuration"
	"go.uber.org/zap"
)

// UpgradeRequest converts http connection to a websocket one.
func UpgradeRequest(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {
	config, err := sharedconfig.ReadConfig[configuration.Config](configuration.ConfigFileName)
	if err != nil {
		return nil, fmt.Errorf("read agent configuration: %w", err)
	}
	requestUpgrader := upgrader
	requestUpgrader.CheckOrigin = validOrigin(config.ValidOrigins)
	requestUpgrader.Subprotocols = []string{"reconmap-terminal"}
	conn, err := requestUpgrader.Upgrade(w, r, nil)
	if err != nil {
		logger.Error("Unable to upgrade connection", zap.Error(err))
		return nil, err
	}
	return conn, nil
}

func validOrigin(configuredOrigin string) func(*http.Request) bool {
	return func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		configured, configuredErr := url.Parse(configuredOrigin)
		requestOrigin, requestErr := url.Parse(origin)
		if configuredErr != nil || requestErr != nil || origin == "" ||
			configured.Scheme == "" || configured.Host == "" ||
			configured.Path != "" || configured.RawQuery != "" || configured.Fragment != "" || configured.User != nil ||
			requestOrigin.Path != "" || requestOrigin.RawQuery != "" || requestOrigin.Fragment != "" || requestOrigin.User != nil {
			return false
		}
		return strings.EqualFold(configured.Scheme, requestOrigin.Scheme) &&
			strings.EqualFold(configured.Host, requestOrigin.Host)
	}
}
