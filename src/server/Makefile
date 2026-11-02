.DEFAULT_GOAL := start

include ../../mk/common.mk

ifneq (,$(wildcard ../../.env))
    include ../../.env
    export
endif

POSTGRES_PASSWORD ?= reconmuppet
POSTGRES_RECONMAP_USER ?= reconmapper

PROJECT := reconmap
DC := COMPOSE_PROFILES=default docker compose -p $(PROJECT) -f ../../compose.yaml -f ../../compose.dev.yaml
DB_CONTAINER=reconmap-postgres-1

HOST_UID=$(shell id -u)
HOST_GID=$(shell id -g)

ifndef GIT_BRANCH_NAME
GIT_BRANCH_NAME = $(shell git rev-parse --abbrev-ref HEAD)
endif

.PHONY: build
build:
	$(DC) build --no-cache --build-arg HOST_UID=$(HOST_UID) --build-arg HOST_GID=$(HOST_GID)

.PHONY: start
start:
	$(DC) up -d

.PHONY: logs
logs:
	$(DC) logs -f

# Hot-reload dev servers. They run on the host against the dependencies from `make start`
# (settings come from Api/appsettings.Development.json).
.PHONY: api-start
api-start:
	ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS=http://localhost:5510 \
		dotnet watch run --project Api --no-launch-profile

.PHONY: mcp-start
mcp-start:
	ASPNETCORE_ENVIRONMENT=Development ASPNETCORE_URLS=http://localhost:5520 \
		dotnet watch run --project Mcp --no-launch-profile

# Production images (no dev overlay): make build-api push-api build-mcp push-mcp
DC_IMAGES := docker compose -f ../../compose.yaml
SERVICE_api := ngapi
SERVICE_mcp := mcp

.PHONY: build-api build-mcp
build-api build-mcp: build-%:
	$(DC_IMAGES) build $(SERVICE_$*)

.PHONY: push-api push-mcp
push-api push-mcp: push-%:
	$(DC_IMAGES) push $(SERVICE_$*)

.PHONY: stop
stop:
	$(DC) stop

.PHONY: destroy
destroy: stop
	$(DC) down -v --remove-orphans
	$(DC) rm

.PHONY: cache-clear
cache-clear:
	git clean -fdx data/cache

# Database targets

.PHONY: db-shell
db-shell:
	$(DC) exec postgres psql -U $(POSTGRES_RECONMAP_USER) -d reconmap

.PHONY: db-reset
db-reset:
	cat ../../infra/postgres/initdb/sql/{01,02}*.sql | docker container exec -i $(DB_CONTAINER) psql -U postgres -d reconmap

.PHONY: redis-shell
redis-shell:
	$(DC) exec redis redis-cli
