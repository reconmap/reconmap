package internal

import (
	"github.com/reconmap/shared-lib/pkg/models"
	"testing"
)

type MockExecutor struct {
	ExecuteFunc func(name string, args ...string) ([]byte, []byte, error)
}

func (m *MockExecutor) Execute(name string, args ...string) ([]byte, []byte, error) {
	return m.ExecuteFunc(name, args...)
}

func TestNewApp(t *testing.T) {
	app := NewApp()
	if app.muxRouter == nil {
		t.Error("Expected muxRouter to be initialized")
	}
	if app.Logger == nil {
		t.Error("Expected Logger to be initialized")
	}
}

func TestGetSystemInfo(t *testing.T) {
	app := NewApp()
	info := app.getSystemInfo("localhost:8080")

	if info.Hostname == "" {
		t.Error("Expected Hostname to be populated")
	}
	if info.Os == "" {
		t.Error("Expected Os to be populated")
	}
	if info.ListenAddress != "localhost:8080" {
		t.Errorf("Expected ListenAddress to be localhost:8080, got %s", info.ListenAddress)
	}
}

func TestSetupSchedules(t *testing.T) {
	app := NewApp()
	mockExecutor := &MockExecutor{
		ExecuteFunc: func(name string, args ...string) ([]byte, []byte, error) {
			return []byte("done"), nil, nil
		},
	}
	app.Executor = mockExecutor

	schedules := &models.CommandSchedules{
		{
			CronExpression: "@every 1s",
			ArgumentValues: "echo hello",
		},
	}

	c := app.setupSchedules("token", schedules)
	if c == nil {
		t.Error("Expected cron to be returned")
	}
	c.Stop()
}
