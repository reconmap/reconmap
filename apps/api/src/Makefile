PROJECT := rest-api
DC := docker compose -f ../compose.yaml -p $(PROJECT)

.PHONY: start
start:
	$(DC) start ngapi

.PHONY: stop
stop:
	$(DC) stop ngapi

.PHONY: build
build:
	$(DC) build ngapi

.PHONY: push
push:
	$(DC) push ngapi
