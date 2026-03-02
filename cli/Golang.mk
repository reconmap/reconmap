
.PHONY: get-deps
get-deps:
	go get -v -t ./...

.PHONY: update-deps
update-deps:
	go get -u ./...
	go mod tidy

.PHONY: lint
lint: GOLANGCI_LINT_VERSION ?= 2.0.2
lint:
	docker run \
	-v $(CURDIR):/reconmap \
	-w /reconmap \
	golangci/golangci-lint:v$(GOLANGCI_LINT_VERSION)-alpine \
	golangci-lint run -c .golangci.yml --timeout 10m --fix agent

