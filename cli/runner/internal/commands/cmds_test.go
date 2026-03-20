package commands

import (
	"os"
	"testing"

	"github.com/reconmap/shared-lib/pkg/models"
	sharedio "github.com/reconmap/shared-lib/pkg/io"
)

type MockExecutor struct {
	ExecuteFunc func(name string, args ...string) ([]byte, []byte, error)
}

func (m *MockExecutor) Execute(name string, args ...string) ([]byte, []byte, error) {
	return m.ExecuteFunc(name, args...)
}

func TestRunCommand(t *testing.T) {
	var originalExecutor sharedio.Executor = CurrentExecutor
	defer func() { CurrentExecutor = originalExecutor }()

	mockUsage := &models.CommandUsage{
		ID:             1,
		ExecutablePath: "echo",
		Arguments:      "hello",
	}

	mockExecutor := &MockExecutor{
		ExecuteFunc: func(name string, args ...string) ([]byte, []byte, error) {
			return []byte("hello world"), nil, nil
		},
	}
	CurrentExecutor = mockExecutor

	err := RunCommand(1, mockUsage, nil)
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	// Clean up the output file
	defer os.Remove("1.out")

	output, err := os.ReadFile("1.out")
	if err != nil {
		t.Fatalf("Expected output file to exist, got error %v", err)
	}

	if string(output) != "hello world" {
		t.Errorf("Expected output 'hello world', got '%s'", string(output))
	}
}
