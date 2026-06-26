PROJECT := rest-api
DC := docker compose -p $(PROJECT)

.PHONY: start
start:
	$(DC) start ngapi

.PHONY: stop
stop:
	$(DC) stop ngapi

.PHONY: build
build:
	$(DC) build

.PHONY: push
push:
	$(DC) push
