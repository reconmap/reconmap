package internal

import (
	"context"
	"fmt"
	"reconmap/agent/internal/configuration"

	"github.com/go-redis/redis/v8"
	sharedconfig "github.com/reconmap/shared-lib/pkg/configuration"
)

func (app *App) connectRedis() *error {
	config, _ := sharedconfig.ReadConfig[configuration.Config]("config-reconmapd.json")

	redisHost := config.RedisConfig.Host
	redisPort := config.RedisConfig.Port
	ctx := context.Background()

	redisConn := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", redisHost, redisPort),
		Username: config.RedisConfig.Username, // no username set
		Password: config.RedisConfig.Password, // no password set
		DB:       0,
	})

	if _, err := redisConn.Ping(ctx).Result(); err != nil {
		return &err
	}

	app.redisConn = redisConn

	return nil
}
