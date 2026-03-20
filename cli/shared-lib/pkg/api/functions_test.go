package api

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"testing"

	"github.com/reconmap/shared-lib/pkg/models"
)

type MockHTTPClient struct {
	DoFunc func(req *http.Request) (*http.Response, error)
}

func (m *MockHTTPClient) Do(req *http.Request) (*http.Response, error) {
	return m.DoFunc(req)
}

func TestGetCommandUsageById(t *testing.T) {
	originalClient := DefaultHTTPClient
	defer func() { DefaultHTTPClient = originalClient }()

	t.Setenv("RMAP_SESSION_TOKEN", "mock-token")

	mockCommand := &models.CommandUsage{
		ID:   1,
		Name: "test-command",
	}
	mockResponse, _ := json.Marshal(mockCommand)

	mockClient := &MockHTTPClient{
		DoFunc: func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(bytes.NewBuffer(mockResponse)),
			}, nil
		},
	}
	DefaultHTTPClient = mockClient

	command, err := GetCommandUsageById("http://api.example.com", 1)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if command.ID != 1 || command.Name != "test-command" {
		t.Errorf("Expected command ID 1 and Name test-command, got ID %v and Name %v", command.ID, command.Name)
	}
}
