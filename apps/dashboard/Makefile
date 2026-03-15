SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.ONESHELL:
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

ENV_FILE_NAME ?= config.local.json
DOCKER_IMAGE_NAME = ghcr.io/reconmap/web-client
DOCKER_CONTAINER_NAME = reconmap-web-client
DOCKER_DEV_TAG = reconmap/web-client:dev

# macOS is using different IDs than linux
UNAME=$(shell uname)
ifeq ($(UNAME),Darwin)
	HOST_UID=1000
	HOST_GID=1000
else
	HOST_UID=$(shell id -u)
	HOST_GID=$(shell id -g)
endif
CONTAINER_UID_GID=$(HOST_UID):$(HOST_GID)

GIT_BRANCH_NAME = $(shell git rev-parse --abbrev-ref HEAD)
GIT_COMMIT_HASH = $(shell git rev-parse --short HEAD)

.PHONY: prepare
prepare:
	docker build -f docker/node.Dockerfile --build-arg HOST_UID=$(HOST_UID) --build-arg HOST_GID=$(HOST_GID) -t $(DOCKER_DEV_TAG) .
	docker run -u $(CONTAINER_UID_GID) --rm -t -v $(PWD):/home/node/app -w /home/node/app  --entrypoint npm $(DOCKER_DEV_TAG) install

.PHONY: start
start:
	docker run -u $(CONTAINER_UID_GID) --rm -it \
		-v $(PWD):/home/node/app \
		-v $(PWD)/$(ENV_FILE_NAME):/home/node/app/public/config.json \
		-w /home/node/app \
		-p 5500:5500 \
		-e VITE_GIT_COMMIT_HASH=$(GIT_COMMIT_HASH) \
		--entrypoint npm \
		--name $(DOCKER_CONTAINER_NAME) \
		$(DOCKER_DEV_TAG) run start

.PHONY: stop
stop:
	docker stop $(DOCKER_CONTAINER_NAME) || true

.PHONE: lint
lint:
	docker run -u $(CONTAINER_UID_GID) --rm \
		-v $(PWD):/home/node/app \
		-v $(PWD)/$(ENV_FILE_NAME):/home/node/app/public/config.json \
		-w /home/node/app \
		--entrypoint npm $(DOCKER_DEV_TAG) run lint
	docker run -u $(CONTAINER_UID_GID) --rm \
		-v $(PWD):/home/node/app \
		-v $(PWD)/$(ENV_FILE_NAME):/home/node/app/public/config.json \
		-w /home/node/app \
		--entrypoint npx $(DOCKER_DEV_TAG) stylelint "**/*.css"

.PHONY: tests
tests: lint
	docker run -u $(CONTAINER_UID_GID) --rm -it \
		-v $(PWD):/home/node/app \
		-v $(PWD)/$(ENV_FILE_NAME):/home/node/app/public/config.json \
		-w /home/node/app \
		--entrypoint npm $(DOCKER_DEV_TAG) run test

.PHONY: tests-ci
tests-ci:
	docker run -u $(CONTAINER_UID_GID) --rm -t \
		-v $(PWD):/home/node/app \
		-v $(PWD)/$(ENV_FILE_NAME):/home/node/app/public/config.json \
		-w /home/node/app \
		--entrypoint npm $(DOCKER_DEV_TAG) run test:coverage

.PHONY: clean
clean: stop
	git clean -fdx

.PHONY: build
build:
	docker build -f docker/app.Dockerfile \
		--build-arg RECONMAP_APP_GIT_COMMIT_HASH=$(GIT_COMMIT_HASH) \
		-t $(DOCKER_IMAGE_NAME):$(GIT_BRANCH_NAME) -t $(DOCKER_IMAGE_NAME):latest .

.PHONY: push
push:
	docker push $(DOCKER_IMAGE_NAME):$(GIT_BRANCH_NAME)
	docker push $(DOCKER_IMAGE_NAME):latest

.PHONY: shell
shell:
	docker exec -it $(DOCKER_CONTAINER_NAME) bash

