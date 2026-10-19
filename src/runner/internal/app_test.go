package internal

import (
	"errors"
	"fmt"
	"github.com/reconmap/shared-lib/pkg/models"
	"net/http"
	"net/http/httptest"
	"strings"
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

	err := app.setupSchedules(schedules, "http://localhost:5510", "token")
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
}

func TestSplitCommandLine(t *testing.T) {
	tests := map[string][]string{
		"nmap -oX - example.com":        {"nmap", "-oX", "-", "example.com"},
		"  echo   hello  ":              {"echo", "hello"},
		`echo "hello world" 'a b' c`:    {"echo", "hello world", "a b", "c"},
		"":                              nil,
		`tool --name="two words" --x=1`: {"tool", "--name=two words", "--x=1"},
	}
	for input, expected := range tests {
		got := splitCommandLine(input)
		if len(got) != len(expected) {
			t.Errorf("splitCommandLine(%q) = %q, want %q", input, got, expected)
			continue
		}
		for i := range got {
			if got[i] != expected[i] {
				t.Errorf("splitCommandLine(%q) = %q, want %q", input, got, expected)
			}
		}
	}
}

type scanTestRecorder struct {
	executed []string
	statuses []string
	uploads  []string
}

func newScanTestApp(t *testing.T, rec *scanTestRecorder, execErr error) *App {
	newApp := NewApp()
	app := &newApp
	app.Executor = &MockExecutor{ExecuteFunc: func(name string, args ...string) ([]byte, []byte, error) {
		rec.executed = append(rec.executed, name+" "+strings.Join(args, "|"))
		return []byte("<nmaprun/>"), nil, execErr
	}}
	app.reportTaskStatus = func(_, _ string, taskId int, status, errorMessage string) error {
		rec.statuses = append(rec.statuses, fmt.Sprintf("%d:%s:%s", taskId, status, errorMessage))
		return nil
	}
	app.getUsage = func(_, id string) (*models.CommandUsage, error) {
		return &models.CommandUsage{ID: id, OutputCapturingMode: "stdout"}, nil
	}
	app.uploadOutput = func(_, _, usageId string, projectId int, fileName string, content []byte) error {
		rec.uploads = append(rec.uploads, fmt.Sprintf("%s:%d:%s", usageId, projectId, content))
		return nil
	}
	return app
}

func newDeleteServer(t *testing.T) *httptest.Server {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))
	t.Cleanup(server.Close)
	return server
}

func TestRunScheduleExecutesResolvedCommandAndUploadsOutput(t *testing.T) {
	rec := &scanTestRecorder{}
	app := newScanTestApp(t, rec, nil)
	server := newDeleteServer(t)

	app.runSchedule(models.CommandSchedule{
		ID: 1, CommandId: "nmap", CommandUsageId: "nmap-tcp-syn", ProjectId: 7, ScanRunTaskId: 42,
		CronExpression: "once", ArgumentValues: "nmap -oX - example.com",
	}, server.URL, "token")

	if len(rec.executed) != 1 || rec.executed[0] != "nmap -oX|-|example.com" {
		t.Errorf("unexpected executions: %v", rec.executed)
	}
	if len(rec.statuses) != 2 || rec.statuses[0] != "42:running:" || rec.statuses[1] != "42:succeeded:" {
		t.Errorf("unexpected statuses: %v", rec.statuses)
	}
	if len(rec.uploads) != 1 || rec.uploads[0] != "nmap-tcp-syn:7:<nmaprun/>" {
		t.Errorf("unexpected uploads: %v", rec.uploads)
	}
}

func TestRunScheduleRefusesUnresolvedPlaceholders(t *testing.T) {
	rec := &scanTestRecorder{}
	app := newScanTestApp(t, rec, nil)
	server := newDeleteServer(t)

	app.runSchedule(models.CommandSchedule{
		ID: 2, CommandId: "nmap", ScanRunTaskId: 43, CronExpression: "once",
		ArgumentValues: "nmap -oX - {{{Host|||localhost}}}",
	}, server.URL, "token")

	if len(rec.executed) != 0 {
		t.Errorf("command must not run, got %v", rec.executed)
	}
	if len(rec.statuses) != 1 || !strings.HasPrefix(rec.statuses[0], "43:failed:") {
		t.Errorf("expected a failed status, got %v", rec.statuses)
	}
}

func TestRunScheduleReportsExecutionFailure(t *testing.T) {
	rec := &scanTestRecorder{}
	app := newScanTestApp(t, rec, errors.New("boom"))
	server := newDeleteServer(t)

	app.runSchedule(models.CommandSchedule{
		ID: 3, CommandId: "nmap", CommandUsageId: "nmap-tcp-syn", ProjectId: 7, ScanRunTaskId: 44,
		CronExpression: "once", ArgumentValues: "nmap example.com",
	}, server.URL, "token")

	if len(rec.statuses) != 2 || rec.statuses[1] != "44:failed:boom" {
		t.Errorf("unexpected statuses: %v", rec.statuses)
	}
	if len(rec.uploads) != 0 {
		t.Errorf("nothing should be uploaded after a failure, got %v", rec.uploads)
	}
}
