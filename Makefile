include mk/common.mk

GO_MODULES := src/cli src/runner src/shared-lib

.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo "build       build the Go programs (rmap, reconmapd)"
	@echo "tests       run Go, .NET and dashboard tests"
	@echo "lint        lint Go modules and the dashboard"
	@echo "up / down   start / stop the local Docker Compose stack"
	@echo "docs-serve  serve the documentation locally"
	@echo "docs-build  build the documentation"
	@echo "clean       remove built Go binaries"

.PHONY: build
build:
	for m in $(GO_MODULES); do $(MAKE) -C $$m; done

.PHONY: tests
tests:
	for m in $(GO_MODULES); do $(MAKE) -C $$m tests; done
	cd src/server && dotnet test
	$(MAKE) -C src/dashboard tests

.PHONY: lint
lint:
	for m in $(GO_MODULES); do $(MAKE) -C $$m lint; done
	$(MAKE) -C src/dashboard lint

.PHONY: clean
clean:
	for m in $(GO_MODULES); do $(MAKE) -C $$m clean 2>/dev/null || true; done

.PHONY: up
up:
	$(MAKE) -C src/server start

.PHONY: down
down:
	$(MAKE) -C src/server stop

.PHONY: docs-serve docs-build
docs-serve docs-build:
	$(MAKE) -C docs $@
