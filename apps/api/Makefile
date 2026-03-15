# Use bash or file wildcards won't work
SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.ONESHELL:
.DELETE_ON_ERROR:
.DEFAULT_GOAL := prepare
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

PROJECT := rest-api
DC := docker compose -p $(PROJECT)
DB_CONTAINER=rmap-mysql

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
	$(DC) --profile testing up -d

.PHONY: stop
stop:
	$(DC) stop

.PHONY: clean
clean: stop
	$(DC) down -v --remove-orphans
	$(DC) rm

.PHONY: cache-clear
cache-clear:
	git clean -fdx data/cache

# Database targets

.PHONY: db-shell
db-shell:
	$(DC) exec mysql mysql --silent -uroot -preconmuppet reconmap

.PHONY: db-reset
db-reset:
	cat docker/mysql/initdb/{01,02}*.sql | docker container exec -i $(DB_CONTAINER) mysql -uroot -preconmuppet reconmap

.PHONY: db-import
db-import:
	cat docker/mysql/initdb/{01,02,03}*.sql | docker container exec -i $(DB_CONTAINER) mysql -uroot -preconmuppet reconmap

.PHONY: redis-shell
redis-shell:
	$(DC) exec redis redis-cli
