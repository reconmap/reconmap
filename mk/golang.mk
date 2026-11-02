# Shared by the Go modules (cli, runner, shared-lib).
#
# Set before including:
#   PROGRAM      name of the binary (omit for libraries)
#   CMD_PKG      main package to build, e.g. ./cmd/rmap (with PROGRAM)
#   BUILD_PKG    import path of the package holding BuildVersion (with PROGRAM)
include $(dir $(lastword $(MAKEFILE_LIST)))common.mk

LATEST_TAG = $(shell git describe --tags)
GOLANGCI_LINT_VERSION ?= 2.0.2

ifdef PROGRAM
.DEFAULT_GOAL := $(PROGRAM)

.PHONY: $(PROGRAM)
$(PROGRAM):
	go build -v -ldflags="-X '$(BUILD_PKG).BuildVersion=$(LATEST_TAG)'" -o $(PROGRAM) $(CMD_PKG)

.PHONY: clean
clean:
	rm -f $(PROGRAM)
else
.DEFAULT_GOAL := build

.PHONY: build
build:
	go build ./...
endif

.PHONY: tests
tests:
	go test ./...

.PHONY: get-deps
get-deps:
	go get -v -t ./...

.PHONY: update-deps
update-deps:
	go get -u ./...
	go mod tidy

.PHONY: fix
fix:
	go fix ./...

# The shared golangci config lives in src/, so mount the parent and run from the module.
.PHONY: lint
lint:
	docker run --rm \
		-v $(abspath $(CURDIR)/..):/reconmap \
		-w /reconmap/$(notdir $(CURDIR)) \
		golangci/golangci-lint:v$(GOLANGCI_LINT_VERSION)-alpine \
		golangci-lint run -c ../.golangci.yml --timeout 10m --fix ./...
