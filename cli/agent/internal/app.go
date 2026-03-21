package internal

import (
	"net/http"
	"os"
	"reconmap/agent/internal/build"
	"reconmap/agent/internal/configuration"
	"runtime"
	"strings"
	"time"

	"fmt"
	"log"
	"net"

	"github.com/go-co-op/gocron/v2"
	"github.com/go-redis/redis/v8"
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

// App contains properties needed for agent
// to connect to redis and http router.
type App struct {
	redisConn *redis.Client
	muxRouter *mux.Router
	Logger    *zap.SugaredLogger
	Executor  sharedio.Executor
}

var logger = logging.GetLoggerInstance()

// NewApp returns a App struct that has intialized a redis client and http router.
func NewApp() App {
	muxRouter := mux.NewRouter()
	muxRouter.HandleFunc("/term", handleWebsocket)

	return App{
		muxRouter: muxRouter,
		Logger:    logging.GetLoggerInstance(),
		Executor:  &sharedio.DefaultExecutor{},
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

func (app *App) setupSchedules(schedules *models.CommandSchedules) error {
	app.Logger.Info("creating cron jobs")
	s, err := gocron.NewScheduler()
	if err != nil {
		return fmt.Errorf("unable to create scheduler (%w)", err)
	}

	for _, commandSchedule := range *schedules {
		s.NewJob(gocron.CronJob(commandSchedule.CronExpression, false), gocron.NewTask(func() {
			app.Logger.Infof("running command on schedule: %s (%s)", commandSchedule.CronExpression, commandSchedule.ArgumentValues)
			parts := strings.Split(commandSchedule.ArgumentValues, " ")
			stdout, stderr, err := app.Executor.Execute(parts[0], strings.Fields(strings.Join(parts[1:], " "))...)
			if err != nil {
				app.Logger.Errorf("command execution failed with '%s'", err)
				return
			}
			outStr, errStr := string(stdout), string(stderr)
			app.Logger.Debug(outStr)
			app.Logger.Debug(errStr)
		}))
	}
	s.Start()
	return nil
}

// Run starts the agent.
func (app *App) Run(listenAddress string) error {
	app.Logger.Info("Reconmap agent starting...")

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
		app.setupSchedules(schedules)
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
		_, err = api.AgentBoot(restApiUrl, config.ClientID, accessToken, &systemInfo)
		if err != nil {
			app.Logger.Error("unable to send boot notification", zap.Error(err))
		}
	}()
	go func() {
		for range ticker.C {
			app.Logger.Info("sending ping event to API")
			_, err = api.AgentPing(restApiUrl, config.ClientID, accessToken)
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
