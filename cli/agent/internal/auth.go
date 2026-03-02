package internal

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"net/http"
	"os"
	"reconmap/agent/internal/configuration"

	"github.com/Nerzal/gocloak/v13"
	sharedconfig "github.com/reconmap/shared-lib/pkg/configuration"

	"github.com/golang-jwt/jwt"
)

const realm = "reconmap"

func NewGocloakClient() *gocloak.GoCloak {
	config, _ := sharedconfig.ReadConfig[configuration.Config]("config-reconmapd.json")
	keycloakHostname := config.KeycloakConfig.BaseUri
	keycloakDebug, _ := os.LookupEnv("RMAP_KEYCLOAK_DEBUG")
	keycloakSkipVerify, _ := os.LookupEnv("RMAP_KEYCLOAK_SKIP_TLS_VERIFY")

	client := gocloak.NewClient(keycloakHostname, gocloak.SetAuthAdminRealms("admin/realms"), gocloak.SetAuthRealms("realms"))

	restyClient := client.RestyClient()
	restyClient.SetDebug(keycloakDebug == "true")
	restyClient.SetTLSClientConfig(&tls.Config{InsecureSkipVerify: keycloakSkipVerify == "true"})

	return client
}

func GetAccessToken(app *App) (string, error) {
	config, _ := sharedconfig.ReadConfig[configuration.Config]("config-reconmapd.json")

	clientID := config.KeycloakConfig.ClientID
	clientSecret := config.KeycloakConfig.ClientSecret

	client := NewGocloakClient()

	ctx := context.Background()
	token, err := client.LoginClient(ctx, clientID, clientSecret, realm)
	if err != nil {
		return "", err
	}

	tokenInfo, err := client.RetrospectToken(ctx, token.AccessToken, clientID, clientSecret, realm)
	if err != nil {
		return "", fmt.Errorf("unable to retrospect token (%w)", err)
	}

	if !*tokenInfo.Active {
		return "", errors.New("token is not active")
	}

	return token.AccessToken, nil
}

func GetPublicKeys() string {
	client := NewGocloakClient()

	// this goes to host:port/realms/name
	issuerResponse, err := client.GetIssuer(context.Background(), realm)
	if err != nil {
		logger.Error("error retrieving issuer", err)
	}

	return *issuerResponse.PublicKey
}

func CheckRequestToken(r *http.Request) error {
	params := r.URL.Query()

	if !params.Has("token") {
		return errors.New("missing \"token\" parameter")
	} else {
		tokenParam := params.Get("token")
		pubkey := "-----BEGIN PUBLIC KEY-----\n" + GetPublicKeys() + "\n-----END PUBLIC KEY-----"
		key, err := jwt.ParseRSAPublicKeyFromPEM([]byte(pubkey))
		if err != nil {
			err := fmt.Errorf("validate: parse key: %w", err)
			return err
		}

		token, err := jwt.Parse(tokenParam, func(jwtToken *jwt.Token) (interface{}, error) {
			if _, ok := jwtToken.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("unexpected method: %s", jwtToken.Header["alg"])
			}

			return key, nil
		})
		if !token.Valid {
			return err
		}

		if _, ok := token.Claims.(jwt.MapClaims); !ok {
			return errors.New("unable to parse claims")
		}
	}

	return nil
}
