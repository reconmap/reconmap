package api

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"

	"github.com/reconmap/shared-lib/pkg/configuration"
)

type LoginResponse struct {
	AccessToken string `json:"access_token"`
}

func NewRmapRequestWithUserAgent(method, url string, body io.Reader, userAgent string) (*http.Request, error) {
	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", userAgent)
	return req, nil
}

func NewRmapRequest(method, url string, body io.Reader) (*http.Request, error) {
	return NewRmapRequestWithUserAgent(method, url, body, "Rmap ("+runtime.GOOS+")")
}

func AddBearerToken(req *http.Request) error {
	jwtToken, err := ReadSessionToken()
	if err != nil {
		return err
	}

	req.Header.Add("Authorization", "Bearer "+jwtToken)

	return nil
}

func ReadSessionToken() (string, error) {
	sessionTokenEnv, envVariableFound := os.LookupEnv("RMAP_SESSION_TOKEN")
	if envVariableFound {
		return sessionTokenEnv, nil
	}

	reconmapConfigDir, err := configuration.GetReconmapConfigDirectory()
	if err != nil {
		return "", err
	}

	var configPath = filepath.Join(reconmapConfigDir, "session-token")

	b, err := os.ReadFile(filepath.Clean(configPath))
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func SaveSessionToken(accessToken string) error {
	reconmapConfigDir, err := configuration.GetReconmapConfigDirectory()
	if err != nil {
		return err
	}

	var configPath = filepath.Join(reconmapConfigDir, "session-token")

	err = os.WriteFile(configPath, []byte(accessToken), 0600)
	return err
}

func GetSessionTokenPath() (string, error) {
	reconmapConfigDir, err := configuration.GetReconmapConfigDirectory()
	if err != nil {
		return "", err
	}

	var configPath = filepath.Join(reconmapConfigDir, "session-token")
	return configPath, nil
}
