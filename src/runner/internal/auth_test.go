package internal

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"testing"
	"time"

	"github.com/golang-jwt/jwt"
)

func terminalTestKey(t *testing.T) (*rsa.PrivateKey, string) {
	t.Helper()
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatal(err)
	}
	publicKey, err := x509.MarshalPKIXPublicKey(&key.PublicKey)
	if err != nil {
		t.Fatal(err)
	}
	pemBytes := pem.EncodeToMemory(&pem.Block{Type: "PUBLIC KEY", Bytes: publicKey})
	return key, string(pemBytes[len("-----BEGIN PUBLIC KEY-----\n") : len(pemBytes)-len("-----END PUBLIC KEY-----\n")])
}

func signedTerminalToken(t *testing.T, key *rsa.PrivateKey, mutate func(jwt.MapClaims)) string {
	t.Helper()
	claims := jwt.MapClaims{
		"iss": "https://keycloak.example/realms/reconmap",
		"aud": []string{"dashboard"},
		"azp": "dashboard",
		"exp": time.Now().Add(time.Hour).Unix(),
		"resource_access": map[string]any{
			"dashboard": map[string]any{"roles": []string{"administrator"}},
		},
	}
	if mutate != nil {
		mutate(claims)
	}
	token, err := jwt.NewWithClaims(jwt.SigningMethodRS256, claims).SignedString(key)
	if err != nil {
		t.Fatal(err)
	}
	return token
}

func TestValidateTerminalToken(t *testing.T) {
	key, publicKey := terminalTestKey(t)
	valid := signedTerminalToken(t, key, nil)
	if err := validateTerminalToken(valid, publicKey, "https://keycloak.example"); err != nil {
		t.Fatalf("expected valid administrator token, got %v", err)
	}

	tests := []struct {
		name   string
		mutate func(jwt.MapClaims)
	}{
		{"expired", func(c jwt.MapClaims) { c["exp"] = time.Now().Add(-time.Hour).Unix() }},
		{"wrong issuer", func(c jwt.MapClaims) { c["iss"] = "https://other.example/realms/reconmap" }},
		{"wrong audience", func(c jwt.MapClaims) { c["aud"] = []string{"api-client"} }},
		{"wrong azp", func(c jwt.MapClaims) { c["azp"] = "api-client" }},
		{"low privilege role", func(c jwt.MapClaims) {
			c["resource_access"] = map[string]any{"dashboard": map[string]any{"roles": []string{"user"}}}
		}},
		{"service account", func(c jwt.MapClaims) { c["preferred_username"] = "service-account-dashboard" }},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			token := signedTerminalToken(t, key, test.mutate)
			if err := validateTerminalToken(token, publicKey, "https://keycloak.example"); err == nil {
				t.Fatal("expected token validation to fail")
			}
		})
	}
}

func TestValidateTerminalTokenAllowsSuperuser(t *testing.T) {
	key, publicKey := terminalTestKey(t)
	token := signedTerminalToken(t, key, func(c jwt.MapClaims) {
		c["resource_access"] = map[string]any{"dashboard": map[string]any{"roles": []string{"superuser"}}}
	})
	if err := validateTerminalToken(token, publicKey, "https://keycloak.example"); err != nil {
		t.Fatalf("expected superuser token to be accepted, got %v", err)
	}
}

func TestValidateTerminalTokenRejectsInvalidSignature(t *testing.T) {
	_, publicKey := terminalTestKey(t)
	otherKey, _ := terminalTestKey(t)
	token := signedTerminalToken(t, otherKey, nil)
	if err := validateTerminalToken(token, publicKey, "https://keycloak.example"); err == nil {
		t.Fatal("expected token signed by another key to be rejected")
	}
}

func TestTerminalTokenFromProtocols(t *testing.T) {
	token, err := terminalTokenFromProtocols([]string{"reconmap-terminal, bearer.test-token"})
	if err != nil || token != "test-token" {
		t.Fatalf("expected terminal token, got %q, %v", token, err)
	}
	if _, err := terminalTokenFromProtocols([]string{"bearer.test-token"}); err == nil {
		t.Fatal("expected missing terminal protocol to be rejected")
	}
}
