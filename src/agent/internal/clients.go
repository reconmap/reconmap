package internal

import (
	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

var clients []*websocket.Conn

func broadcast(message string) {
	logger.Debug("broadcasting message")

	for _, client := range clients {
		logger.Debug("-> " + client.RemoteAddr().String())
		err := client.WriteMessage(websocket.TextMessage, []byte(message))
		if err != nil {
			logger.Error("unable to write message to websocket", zap.Error(err))
		}
	}
}

func registerClient(client *websocket.Conn) {
	logger.Debug("registering client connection")
	clients = append(clients, client)
}
