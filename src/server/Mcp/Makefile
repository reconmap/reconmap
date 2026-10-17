PROJECT := mcp
DC := docker compose -f ../../../compose.yaml -p $(PROJECT)

.PHONY: start
start:
	$(DC) start mcp

.PHONY: stop
stop:
	$(DC) stop mcp

.PHONY: build
build:
	$(DC) build mcp

.PHONY: push
push:
	$(DC) push mcp
