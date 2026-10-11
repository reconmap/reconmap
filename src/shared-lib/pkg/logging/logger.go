package logging

import (
	"os"
	"sync"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var logger *zap.SugaredLogger
var once sync.Once

func GetLoggerInstance() *zap.SugaredLogger {
	once.Do(func() {
		logger = initLogger()
	})
	return logger
}

func OnlyTimeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(t.Format("15:04:05"))
}

func initLogger() *zap.SugaredLogger {

	encoderConfig := zap.NewProductionEncoderConfig()

	fileEncoder := zapcore.NewJSONEncoder(encoderConfig)

	encoderConfig.EncodeTime = OnlyTimeEncoder
	consoleEncoder := zapcore.NewConsoleEncoder(encoderConfig)

	fd, err := os.OpenFile("rmap.log", os.O_WRONLY|os.O_APPEND|os.O_CREATE, os.FileMode(0644))
	if err != nil {
		panic(err)
	}

	level := zap.InfoLevel

	core := zapcore.NewTee(
		zapcore.NewCore(fileEncoder, zapcore.AddSync(fd), level),
		zapcore.NewCore(consoleEncoder, zapcore.AddSync(os.Stdout), level),
	)

	logger := zap.New(core)

	return logger.Sugar()
}
