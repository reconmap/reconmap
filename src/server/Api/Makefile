PROJECT := rest-api
DC := docker compose -f ../../../compose.yaml -p $(PROJECT)

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

# Transition: keep publishing the legacy ng-api name for one release.
.PHONY: push-legacy
push-legacy:
	docker tag ghcr.io/reconmap/api:latest ghcr.io/reconmap/ng-api:latest
	docker push ghcr.io/reconmap/ng-api:latest
