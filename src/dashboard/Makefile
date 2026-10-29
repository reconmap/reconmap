include ../../mk/common.mk

ENV_FILE_NAME ?= config.local.json
DOCKER_IMAGE_NAME := ghcr.io/reconmap/dashboard
DOCKER_CONTAINER_NAME := reconmap-dashboard
DOCKER_DEV_TAG := reconmap/dashboard:dev

# macOS is using different IDs than linux
ifeq ($(shell uname),Darwin)
	HOST_UID := 1000
	HOST_GID := 1000
else
	HOST_UID := $(shell id -u)
	HOST_GID := $(shell id -g)
endif

GIT_BRANCH_NAME = $(shell git rev-parse --abbrev-ref HEAD)
GIT_COMMIT_HASH = $(shell git rev-parse --short HEAD)

# NODE_RUN mounts the app; NODE_RUN_CFG also mounts the config (the file must exist).
NODE_RUN := docker run -u $(HOST_UID):$(HOST_GID) --rm \
	-v $(CURDIR):/home/node/app \
	-w /home/node/app
NODE_RUN_CFG := $(NODE_RUN) -v $(CURDIR)/$(ENV_FILE_NAME):/home/node/app/public/config.json

.PHONY: prepare
prepare:
	docker build -f docker/node.Dockerfile --build-arg HOST_UID=$(HOST_UID) --build-arg HOST_GID=$(HOST_GID) -t $(DOCKER_DEV_TAG) .
	$(NODE_RUN) -t --entrypoint npm $(DOCKER_DEV_TAG) install

.PHONY: start
start:
	$(NODE_RUN_CFG) -it -p 5500:5500 \
		-e VITE_GIT_COMMIT_HASH=$(GIT_COMMIT_HASH) \
		--name $(DOCKER_CONTAINER_NAME) \
		--entrypoint npm $(DOCKER_DEV_TAG) run start

.PHONY: stop
stop:
	docker stop $(DOCKER_CONTAINER_NAME) || true

.PHONY: lint
lint:
	$(NODE_RUN_CFG) --entrypoint npm $(DOCKER_DEV_TAG) run lint
	$(NODE_RUN_CFG) --entrypoint npx $(DOCKER_DEV_TAG) stylelint "**/*.css"

.PHONY: tests
tests: lint
	$(NODE_RUN_CFG) -it --entrypoint npm $(DOCKER_DEV_TAG) run test

.PHONY: tests-ci
tests-ci:
	$(NODE_RUN_CFG) -t --entrypoint npm $(DOCKER_DEV_TAG) run test:coverage

# Removes untracked and ignored files, except the local config.
.PHONY: clean
clean: stop
	git clean -fdx -e $(ENV_FILE_NAME)

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
