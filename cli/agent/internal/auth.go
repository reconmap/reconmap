package internal

import (
	"context"
	"crypto/tls"
	"errors"
	"fmt"
	"net/http"
	"os"
	"reconmap/agent/internal/configuration"
	"strings"

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

	return token.AccessToken, nil
}

func GetPublicKeys() (string, error) {
	client := NewGocloakClient()

	// this goes to host:port/realms/name
	issuerResponse, err := client.GetIssuer(context.Background(), realm)
	if err != nil {
		logger.Error("error retrieving issuer", err)
		return "", fmt.Errorf("get realm issuer: %w", err)
	}
	if issuerResponse == nil || issuerResponse.PublicKey == nil {
		return "", errors.New("realm issuer did not provide a public key")
	}

	return *issuerResponse.PublicKey, nil
}

const dashboardClientID = "dashboard"

var terminalRoles = map[string]bool{
	"administrator": true,
	"superuser":     true,
}

type terminalAccessDeniedError struct{ reason string }

func (e *terminalAccessDeniedError) Error() string { return e.reason }

func terminalAccessDenied(reason string) error { return &terminalAccessDeniedError{reason: reason} }

// CheckRequestToken validates that the access token was issued for the
// dashboard and grants an interactive terminal role. Authentication alone is
// deliberately insufficient because /term starts a shell on the agent host.
func CheckRequestToken(r *http.Request) error {
	tokenParam, err := terminalTokenFromProtocols(r.Header.Values("Sec-WebSocket-Protocol"))
	if err != nil {
		return err
	}

	config, err := sharedconfig.ReadConfig[configuration.Config](configuration.ConfigFileName)
	if err != nil {
		return fmt.Errorf("read agent configuration: %w", err)
	}
	publicKey, err := GetPublicKeys()
	if err != nil {
		return err
	}

	return validateTerminalToken(tokenParam, publicKey, config.KeycloakConfig.BaseUri)
}

func terminalTokenFromProtocols(headerValues []string) (string, error) {
	terminalProtocolRequested := false
	var bearerToken string
	for _, headerValue := range headerValues {
		for _, protocol := range strings.Split(headerValue, ",") {
			protocol = strings.TrimSpace(protocol)
			if protocol == "reconmap-terminal" {
				terminalProtocolRequested = true
			}
			if strings.HasPrefix(protocol, "bearer.") {
				token := strings.TrimPrefix(protocol, "bearer.")
				if token != "" {
					bearerToken = token
				}
			}
		}
	}
	if !terminalProtocolRequested {
		return "", errors.New("missing reconmap-terminal protocol")
	}
	if bearerToken != "" {
		return bearerToken, nil
	}
	return "", errors.New("missing terminal bearer credential")
}

func validateTerminalToken(tokenParam, publicKey, keycloakBaseURI string) error {
	pem := "-----BEGIN PUBLIC KEY-----\n" + publicKey + "\n-----END PUBLIC KEY-----"
	key, err := jwt.ParseRSAPublicKeyFromPEM([]byte(pem))
	if err != nil {
		return fmt.Errorf("parse realm public key: %w", err)
	}

	token, err := jwt.Parse(tokenParam, func(jwtToken *jwt.Token) (any, error) {
		if jwtToken.Method.Alg() != jwt.SigningMethodRS256.Alg() {
			return nil, fmt.Errorf("unexpected signing method: %s", jwtToken.Header["alg"])
		}
		return key, nil
	})
	if err != nil || token == nil || !token.Valid {
		if err != nil {
			return fmt.Errorf("validate token: %w", err)
		}
		return errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return errors.New("unable to parse token claims")
	}
	expectedIssuer := strings.TrimRight(keycloakBaseURI, "/") + "/realms/" + realm
	if issuer, _ := claims["iss"].(string); issuer != expectedIssuer {
		return terminalAccessDenied("unexpected token issuer")
	}
	if !claimContains(claims["aud"], dashboardClientID) {
		return terminalAccessDenied("token is not intended for dashboard")
	}
	if azp, _ := claims["azp"].(string); azp != dashboardClientID {
		return terminalAccessDenied("unexpected authorized party")
	}
	if username, _ := claims["preferred_username"].(string); strings.HasPrefix(username, "service-account-") {
		return terminalAccessDenied("service accounts cannot open terminals")
	}
	if !hasTerminalRole(claims) {
		return terminalAccessDenied("token lacks terminal role")
	}
	return nil
}

func claimContains(value any, expected string) bool {
	switch values := value.(type) {
	case string:
		return values == expected
	case []any:
		for _, value := range values {
			if candidate, ok := value.(string); ok && candidate == expected {
				return true
			}
		}
	}
	return false
}

func hasTerminalRole(claims jwt.MapClaims) bool {
	resourceAccess, ok := claims["resource_access"].(map[string]any)
	if !ok {
		return false
	}
	dashboard, ok := resourceAccess[dashboardClientID].(map[string]any)
	if !ok {
		return false
	}
	roles, ok := dashboard["roles"].([]any)
	if !ok {
		return false
	}
	for _, role := range roles {
		if roleName, ok := role.(string); ok && terminalRoles[roleName] {
			return true
		}
	}

	return false
}
