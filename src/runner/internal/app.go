package internal

import (
	"net/http"
	"os"
	"reconmap/runner/internal/build"
	"reconmap/runner/internal/configuration"
	"runtime"
	"strings"
	"time"
	"unicode"

	"fmt"
	"log"
	"net"

	"github.com/go-co-op/gocron/v2"
	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/reconmap/shared-lib/pkg/api"
	sharedconfig "github.com/reconmap/shared-lib/pkg/configuration"
	sharedio "github.com/reconmap/shared-lib/pkg/io"
	"github.com/reconmap/shared-lib/pkg/logging"
	"github.com/reconmap/shared-lib/pkg/models"
	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/mem"
	"go.uber.org/zap"
)

// App contains properties needed for runner
// to connect to redis and http router.
type App struct {
	redisConn         *redis.Client
	muxRouter         *mux.Router
	Logger            *zap.SugaredLogger
	Executor          sharedio.Executor
	activeScheduleIds map[int]uuid.UUID

	// API calls made while running a schedule; replaceable in tests.
	reportTaskStatus func(apiBaseUri, accessToken string, taskId int, status, errorMessage string) error
	getUsage         func(apiBaseUri, usageId string) (*models.CommandUsage, error)
	uploadOutput     func(apiBaseUri, accessToken, usageId string, projectId int, fileName string, content []byte) error
}

var logger = logging.GetLoggerInstance()

// NewApp returns a App struct that has intialized a redis client and http router.
func NewApp() App {
	muxRouter := mux.NewRouter()
	muxRouter.HandleFunc("/term", handleWebsocket)

	return App{
		muxRouter:         muxRouter,
		Logger:            logging.GetLoggerInstance(),
		Executor:          &sharedio.DefaultExecutor{},
		activeScheduleIds: make(map[int]uuid.UUID),
		reportTaskStatus:  api.ReportScanTaskStatus,
		getUsage:          api.GetCommandUsageById,
		uploadOutput:      api.UploadCommandOutput,
	}
}

func GetLocalIP() net.IP {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	localAddress := conn.LocalAddr().(*net.UDPAddr)

	return localAddress.IP
}

func (app *App) getSystemInfo(listenAddress string) api.SystemInfo {
	hostname, err := os.Hostname()
	if err != nil {
		hostname = "unknown"
	}
	cpuInfo, err := cpu.Counts(true)
	cpuStr := "unknown"

	if err == nil {
		cpuStr = fmt.Sprintf("%d cores", cpuInfo)
	}

	vmStat, err := mem.VirtualMemory()
	memStr := "unknown"
	if err == nil {
		memStr = fmt.Sprintf("%.2fGB", float64(vmStat.Total)/(1024*1024*1024))
	}

	return api.SystemInfo{
		Version:       build.BuildVersion,
		Hostname:      hostname,
		Arch:          runtime.GOARCH,
		Os:            runtime.GOOS,
		CPU:           cpuStr,
		Memory:        memStr,
		IpAddress:     GetLocalIP().String(),
		ListenAddress: listenAddress,
	}
}

func (app *App) deleteSchedule(apiBaseUri string, accessToken string, commandId string, scheduleId int) error {
	apiUrl := fmt.Sprintf("%s/commands/%s/schedules/%d", apiBaseUri, commandId, scheduleId)
	req, err := http.NewRequest("DELETE", apiUrl, nil)
	if err != nil {
		return err
	}
	req.Header.Add("Authorization", "Bearer "+accessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}
	return nil
}

// splitCommandLine splits a command line into arguments, honouring single and double quotes.
func splitCommandLine(commandLine string) []string {
	var args []string
	var current strings.Builder
	var quote rune
	inArg := false

	for _, r := range commandLine {
		switch {
		case quote != 0:
			if r == quote {
				quote = 0
			} else {
				current.WriteRune(r)
			}
		case r == '"' || r == '\'':
			quote = r
			inArg = true
		case unicode.IsSpace(r):
			if inArg {
				args = append(args, current.String())
				current.Reset()
				inArg = false
			}
		default:
			current.WriteRune(r)
			inArg = true
		}
	}
	if inArg {
		args = append(args, current.String())
	}

	return args
}

// runSchedule executes a scheduled command, reports progress for scan tasks,
// uploads the command output to the API and removes "once" schedules afterwards.
func (app *App) runSchedule(cSchedule models.CommandSchedule, restApiUrl string, accessToken string) {
	app.Logger.Infof("running command on schedule: %s (%s)", cSchedule.CronExpression, cSchedule.ArgumentValues)

	if err := app.executeSchedule(cSchedule, restApiUrl, accessToken); err != nil {
		app.Logger.Errorf("command execution failed with '%s'", err)
		app.reportStatus(cSchedule, restApiUrl, accessToken, api.ScanTaskFailed, err.Error())
	} else {
		app.reportStatus(cSchedule, restApiUrl, accessToken, api.ScanTaskSucceeded, "")
	}

	if cSchedule.CronExpression == "once" {
		err := app.deleteSchedule(restApiUrl, accessToken, cSchedule.CommandId, cSchedule.ID)
		if err != nil {
			app.Logger.Errorf("unable to delete once schedule %d from API: %v", cSchedule.ID, err)
		} else {
			app.Logger.Infof("successfully deleted once schedule %d from API", cSchedule.ID)
		}
	}
}

func (app *App) reportStatus(cSchedule models.CommandSchedule, restApiUrl string, accessToken string, status string, errorMessage string) {
	if cSchedule.ScanRunTaskId == 0 {
		return
	}
	if err := app.reportTaskStatus(restApiUrl, accessToken, cSchedule.ScanRunTaskId, status, errorMessage); err != nil {
		app.Logger.Errorf("unable to report status of scan task %d: %v", cSchedule.ScanRunTaskId, err)
	}
}

func (app *App) executeSchedule(cSchedule models.CommandSchedule, restApiUrl string, accessToken string) error {
	// A command line with unreplaced placeholders (e.g. "{{{Host}}}") or no executable must never be run.
	if strings.Contains(cSchedule.ArgumentValues, "{{{") {
		return fmt.Errorf("command line has unresolved placeholders: %s", cSchedule.ArgumentValues)
	}
	parts := splitCommandLine(cSchedule.ArgumentValues)
	if len(parts) == 0 {
		return fmt.Errorf("schedule %d has no command to run", cSchedule.ID)
	}

	app.reportStatus(cSchedule, restApiUrl, accessToken, api.ScanTaskRunning, "")

	stdout, stderr, err := app.Executor.Execute(parts[0], parts[1:]...)
	if err != nil {
		return err
	}
	app.Logger.Debug(string(stdout))
	app.Logger.Debug(string(stderr))

	return app.uploadScheduleOutput(cSchedule, restApiUrl, accessToken, stdout)
}

func (app *App) uploadScheduleOutput(cSchedule models.CommandSchedule, restApiUrl string, accessToken string, stdout []byte) error {
	if cSchedule.CommandUsageId == "" || cSchedule.ProjectId == 0 {
		return nil
	}

	usage, err := app.getUsage(restApiUrl, cSchedule.CommandUsageId)
	if err != nil {
		return fmt.Errorf("unable to look up command usage %s: %w", cSchedule.CommandUsageId, err)
	}

	var content []byte
	fileName := usage.OutputFilename
	switch usage.OutputCapturingMode {
	case "stdout":
		content = stdout
		if fileName == "" {
			fileName = usage.ID + ".out"
		}
	case "file":
		content, err = os.ReadFile(usage.OutputFilename)
		if err != nil {
			return fmt.Errorf("unable to read command output file: %w", err)
		}
	default:
		return nil
	}

	if err := app.uploadOutput(restApiUrl, accessToken, usage.ID, cSchedule.ProjectId, fileName, content); err != nil {
		return fmt.Errorf("unable to upload command output: %w", err)
	}

	return nil
}

func (app *App) reconcileSchedules(s gocron.Scheduler, schedules *models.CommandSchedules, restApiUrl string, accessToken string) {
	seenIds := make(map[int]bool)

	for _, commandSchedule := range *schedules {
		seenIds[commandSchedule.ID] = true

		if _, exists := app.activeScheduleIds[commandSchedule.ID]; exists {
			continue
		}

		var jobDef gocron.JobDefinition
		if commandSchedule.CronExpression == "once" {
			jobDef = gocron.OneTimeJob(gocron.OneTimeJobStartImmediately())
		} else {
			jobDef = gocron.CronJob(commandSchedule.CronExpression, false)
		}

		cSchedule := commandSchedule
		j, err := s.NewJob(jobDef, gocron.NewTask(func() {
			app.runSchedule(cSchedule, restApiUrl, accessToken)
		}))

		if err != nil {
			app.Logger.Errorf("unable to schedule command %d: %v", cSchedule.ID, err)
			continue
		}

		app.activeScheduleIds[commandSchedule.ID] = j.ID()
	}

	for id, jobUuid := range app.activeScheduleIds {
		if !seenIds[id] {
			err := s.RemoveJob(jobUuid)
			if err != nil {
				app.Logger.Warnf("unable to remove job for schedule %d: %v", id, err)
			}
			delete(app.activeScheduleIds, id)
		}
	}
}

func (app *App) setupSchedules(schedules *models.CommandSchedules, restApiUrl string, accessToken string) error {
	app.Logger.Info("creating cron jobs")
	s, err := gocron.NewScheduler()
	if err != nil {
		return fmt.Errorf("unable to create scheduler (%w)", err)
	}
	s.Start()

	if schedules != nil {
		app.reconcileSchedules(s, schedules, restApiUrl, accessToken)
	}

	go func() {
		pollTicker := time.NewTicker(10 * time.Second)
		defer pollTicker.Stop()
		for range pollTicker.C {
			freshSchedules, err := api.GetCommandsSchedules(restApiUrl, accessToken)
			if err != nil {
				app.Logger.Error("unable to get command schedules during poll", zap.Error(err))
				continue
			}
			app.reconcileSchedules(s, freshSchedules, restApiUrl, accessToken)
		}
	}()

	return nil
}

// Run starts the runner.
func (app *App) Run(listenAddress string) error {
	app.Logger.Info("Reconmap runner starting...")

	config, err := sharedconfig.ReadConfig[configuration.Config]("config-reconmapd.json")
	if err != nil {
		app.Logger.Error("unable to read reconmapd config", zap.Error(err))
		return err
	}

	accessToken, err := GetAccessToken(app)
	if err != nil {
		return fmt.Errorf("unable to login to keycloak (%w)", err)
	}

	restApiUrl := config.ReconmapApiConfig.BaseUri

	schedules, err := api.GetCommandsSchedules(restApiUrl, accessToken)
	if err != nil {
		app.Logger.Error("unable to get command schedules", zap.Error(err))
	} else {
		os.Setenv("RMAP_SESSION_TOKEN", accessToken)
		app.setupSchedules(schedules, restApiUrl, accessToken)
	}

	redisErr := app.connectRedis()
	if redisErr != nil {
		errorFormatted := fmt.Errorf("unable to connect to redis (%w)", *redisErr)
		return errorFormatted
	}

	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	go func() {
		systemInfo := app.getSystemInfo(listenAddress)
		app.Logger.Info("sending boot event to API")
		_, err = api.RunnerBoot(restApiUrl, config.ClientID, accessToken, &systemInfo)
		if err != nil {
			app.Logger.Error("unable to send boot notification", zap.Error(err))
		}
	}()
	go func() {
		for range ticker.C {
			app.Logger.Info("sending ping event to API")
			_, err = api.RunnerPing(restApiUrl, config.ClientID, accessToken)
			if err != nil {
				app.Logger.Error("unable to send ping notification", zap.Error(err))
			}
		}
	}()

	go broadcastNotifications(app)

	if err := http.ListenAndServe(listenAddress, app.muxRouter); err != nil {
		app.Logger.Fatal("Something went wrong with the webserver", zap.Error(err))
	}

	return nil
}
