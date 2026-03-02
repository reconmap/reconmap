
include ../Golang.mk

SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.ONESHELL:
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules
LATEST_TAG = $(shell git describe --tags)

CONTAINER_NAME=ghcr.io/reconmap/agent:latest

PROGRAM=reconmapd

$(PROGRAM):
	go build -v -ldflags="-X 'github.com/reconmap/agent/internal/build.BuildVersion=$(LATEST_TAG)'" -o $(PROGRAM) ./cmd/reconmapd

.PHONY: tests
tests:
	go test ./...

.PHONY: clean
clean:
	rm -f $(PROGRAM)

.PHONY: docker-build
docker-build:
	docker build -t $(CONTAINER_NAME) .

.PHONY: docker-push
docker-push:
	docker push $(CONTAINER_NAME)

