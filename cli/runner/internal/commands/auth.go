package commands

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/reconmap/shared-lib/pkg/logging"

	"github.com/coreos/go-oidc"
	"github.com/reconmap/cli/internal/configuration"
	"github.com/reconmap/cli/internal/terminal"
	"github.com/reconmap/shared-lib/pkg/api"
	sharedconfig "github.com/reconmap/shared-lib/pkg/configuration"
	"golang.org/x/oauth2"
)

type IDTokenClaim struct {
	Email string `json:"email"`
}

func Login() error {
	logger := logging.GetLoggerInstance()

	config, err := sharedconfig.ReadConfig[configuration.Config](configuration.ConfigFileName)
	if err != nil {
		return err
	}

	provider, err := oidc.NewProvider(context.Background(), config.KeycloakConfig.BaseUri)
	if err != nil {
		return err
	}

	clientId := config.KeycloakConfig.ClientID
	oauthConfig := oauth2.Config{
		ClientID:    clientId,
		RedirectURL: "urn:ietf:wg:oauth:2.0:oob",
		Endpoint: oauth2.Endpoint{
			DeviceAuthURL: provider.Endpoint().AuthURL + "/device",
			AuthURL:       provider.Endpoint().AuthURL,
			TokenURL:      provider.Endpoint().TokenURL,
		},
		Scopes: []string{oidc.ScopeOpenID, "email"},
	}

	ctx := context.Background()

	deviceCode, err := oauthConfig.DeviceAuth(ctx)
	if err != nil {
		logger.Error(err)
		return err
	}
	fmt.Printf("Go to %v and enter code %v\n", deviceCode.VerificationURI, deviceCode.UserCode)
	fmt.Println()

	token, err := oauthConfig.DeviceAccessToken(ctx, deviceCode)
	if err != nil {
		panic(err)
	}

	err = api.SaveSessionToken(token.AccessToken)
	if err != nil {
		return err
	}

	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok {
		panic("id_token is missing")
	}

	verifier := provider.Verifier(&oidc.Config{ClientID: oauthConfig.ClientID})
	idToken, err := verifier.Verify(ctx, rawIDToken)
	if err != nil {
		panic(err)
	}

	idTokenClaim := IDTokenClaim{}
	if err := idToken.Claims(&idTokenClaim); err != nil {
		panic(err)
	}

	var apiUrl string = config.ReconmapApiConfig.BaseUri + "/sessions"

	formData := map[string]string{}
	jsonData, err := json.Marshal(formData)
	if err != nil {
		return err
	}

	httpClient := &http.Client{}
	req, err := api.NewRmapRequest("POST", apiUrl, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Add("Content-Type", "application/json")
	api.AddBearerToken(req)
	response, err := httpClient.Do(req)
	if err != nil {
		return err
	}

	if response.StatusCode != http.StatusOK {

		if response.StatusCode == http.StatusForbidden || response.StatusCode == http.StatusUnauthorized {
			return errors.New("invalid credentials")
		}

		if response.StatusCode == http.StatusMethodNotAllowed {
			return fmt.Errorf("method POST not allowed for %s. Please make sure you are pointing to the API url and not the frontend one", apiUrl)
		}

		return fmt.Errorf("server returned code %d", response.StatusCode)
	}

	defer response.Body.Close()
	body, err := io.ReadAll(response.Body)

	if err != nil {
		return errors.New("unable to read response from server")
	}

	var loginResponse api.LoginResponse

	if err = json.Unmarshal([]byte(body), &loginResponse); err != nil {
		return err
	}

	terminal.PrintGreenTick()
	fmt.Printf(" Successfully logged in as '%s'\n", idTokenClaim.Email)

	return err
}

func Logout() error {
	if _, err := api.ReadSessionToken(); err != nil {
		return errors.New("there is no active user session")
	}

	config, err := sharedconfig.ReadConfig[configuration.Config](configuration.ConfigFileName)
	if err != nil {
		return err
	}
	var apiUrl string = config.ReconmapApiConfig.BaseUri + "/users/logout"

	client := &http.Client{}
	req, err := api.NewRmapRequest("POST", apiUrl, nil)
	if err != nil {
		return err
	}

	if err = api.AddBearerToken(req); err != nil {
		return err
	}

	response, err := client.Do(req)
	if err != nil {
		return err
	}

	if response.StatusCode != http.StatusOK {
		return errors.New("response error received from the server")
	}

	defer response.Body.Close()

	configPath, err := api.GetSessionTokenPath()
	if _, err := os.Stat(configPath); err == nil {
		err = os.Remove(configPath)
		if err != nil {
			log.Println("Unable to remove file")
		}
	} else if errors.Is(err, os.ErrNotExist) {
		log.Println("warning: Session file does not exist")
	}

	terminal.PrintGreenTick()
	fmt.Printf(" Successfully logged out from the server\n")

	return err
}
