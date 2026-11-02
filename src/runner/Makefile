PROGRAM := reconmapd
CMD_PKG := ./cmd/reconmapd
BUILD_PKG := reconmap/runner/internal/build

include ../../mk/golang.mk

CONTAINER_NAME := ghcr.io/reconmap/runner:latest

.PHONY: docker-build
docker-build:
	docker build -t $(CONTAINER_NAME) -f Dockerfile ..

.PHONY: docker-push
docker-push:
	docker push $(CONTAINER_NAME)
