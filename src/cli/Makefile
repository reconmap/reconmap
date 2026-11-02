PROGRAM := rmap
CMD_PKG := ./cmd/rmap
BUILD_PKG := github.com/reconmap/reconmap/src/cli/internal/build

include ../../mk/golang.mk

.PHONY: sbom
sbom:
	docker run -it --rm \
		-v $(CURDIR):/reconmap/cli \
		-w /reconmap/cli \
		spdx/spdx-sbom-generator --path /reconmap/cli
