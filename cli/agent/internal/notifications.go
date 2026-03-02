package internal

import (
	"context"
	"time"
)

const (
	redisTimeout = 2 * time.Second
)

func broadcastNotifications(app *App) {
	for {
		app.Logger.Debug("searching for notifications...")
		ctx := context.Background()
		result, err := app.redisConn.BRPop(ctx, redisTimeout, "notifications:queue").Result()
		if err != nil {
			app.Logger.Debug("no items retrieved from notifications queue: ", err)
		} else if result != nil {
			broadcast(result[1])
		}
	}
}
