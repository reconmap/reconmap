# Use bash or file wildcards won't work
SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.ONESHELL:
.DELETE_ON_ERROR:
.DEFAULT_GOAL := prepare
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

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

.PHONY:
logs:
	$(DC) logs -f

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
	cat ../../infra/docker/postgres/initdb/sql/{01,02}*.sql | docker container exec -i $(DB_CONTAINER) psql -U postgres -d reconmap

.PHONY: db-import
db-import:
	cat ../../infra/docker/postgres/initdb/sql/{01,02}*.sql | docker container exec -i $(DB_CONTAINER) psql -U postgres -d reconmap

.PHONY: redis-shell
redis-shell:
	$(DC) exec redis redis-cli
