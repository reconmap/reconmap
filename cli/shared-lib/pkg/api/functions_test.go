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
		ID:          "1",
		Description: "test-command",
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

	command, err := GetCommandUsageById("http://api.example.com", "1")

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if command.ID != "1" || command.Description != "test-command" {
		t.Errorf("Expected command ID 1 and Description test-command, got ID %v and Description %v", command.ID, command.Description)
	}
}

func TestAgentBoot_ErrorOnNonSuccess(t *testing.T) {
	originalClient := DefaultHTTPClient
	defer func() { DefaultHTTPClient = originalClient }()

	mockClient := &MockHTTPClient{
		DoFunc: func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusInternalServerError,
				Status:     "500 Internal Server Error",
				Body:       io.NopCloser(bytes.NewBufferString("Error message")),
			}, nil
		},
	}
	DefaultHTTPClient = mockClient

	systemInfo := &SystemInfo{
		Version: "1.0.0",
	}
	_, err := AgentBoot("http://api.example.com", "agent-client", "token", systemInfo)

	if err == nil {
		t.Fatal("Expected error on non-success status code, got nil")
	}
	expectedErrMsg := "unexpected status code from API: 500 Internal Server Error"
	if err.Error() != expectedErrMsg {
		t.Errorf("Expected error message %q, got %q", expectedErrMsg, err.Error())
	}
}

func TestAgentPing_ErrorOnNonSuccess(t *testing.T) {
	originalClient := DefaultHTTPClient
	defer func() { DefaultHTTPClient = originalClient }()

	mockClient := &MockHTTPClient{
		DoFunc: func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: http.StatusUnauthorized,
				Status:     "401 Unauthorized",
				Body:       io.NopCloser(bytes.NewBufferString("Unauthorized")),
			}, nil
		},
	}
	DefaultHTTPClient = mockClient

	_, err := AgentPing("http://api.example.com", "agent-client", "token")

	if err == nil {
		t.Fatal("Expected error on non-success status code, got nil")
	}
	expectedErrMsg := "unexpected status code from API: 401 Unauthorized"
	if err.Error() != expectedErrMsg {
		t.Errorf("Expected error message %q, got %q", expectedErrMsg, err.Error())
	}
}
