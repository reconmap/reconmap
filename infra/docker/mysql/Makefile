IMAGE_NAME=ghcr.io/reconmap/rest-api-db
IMAGE_REVISION=$(shell git rev-parse HEAD)
IMAGE_BUILD_DATE=$(shell date -u +%Y-%m-%dT%H:%M:%SZ)

HOST_UID=$(shell id -u)
HOST_GID=$(shell id -g)

.PHONY: image-build
image-build:
	docker build \
		--build-arg HOST_UID=$(HOST_UID) \
		--build-arg HOST_GID=$(HOST_GID) \
		--label org.opencontainers.image.revision=$(IMAGE_REVISION) \
		--label org.opencontainers.image.created=$(IMAGE_BUILD_DATE) \
		-t $(IMAGE_NAME) .
	docker tag $(IMAGE_NAME) $(IMAGE_NAME):latest

.PHONY: image-push
image-push:
	docker push $(IMAGE_NAME)
