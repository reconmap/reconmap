package internal

import (
	"net/http/httptest"
	"testing"
)

func TestValidOrigin(t *testing.T) {
	checkOrigin := validOrigin("https://dashboard.example")
	allowed := httptest.NewRequest("GET", "http://agent.example/term", nil)
	allowed.Header.Set("Origin", "https://dashboard.example")
	if !checkOrigin(allowed) {
		t.Fatal("expected configured origin to be allowed")
	}

	for _, origin := range []string{"", "https://attacker.example", "http://dashboard.example", "https://dashboard.example/path"} {
		rejected := httptest.NewRequest("GET", "http://agent.example/term", nil)
		rejected.Header.Set("Origin", origin)
		if checkOrigin(rejected) {
			t.Fatalf("expected origin %q to be rejected", origin)
		}
	}
}
