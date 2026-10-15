OPENAPI_GENERATOR_IMAGE?=openapitools/openapi-generator-cli:v7.26.0
OPENAPI_GENERATOR?=docker run --rm -u $(shell id -u):$(shell id -g) -v $(CURDIR):/local $(OPENAPI_GENERATOR_IMAGE)

OUTPUT_DIR?=output
OPENAPI_SPEC=openapi.yaml
GO_TEMPLATE_DIR=templates/go
TS_TEMPLATE_DIR=templates/typescript

.PHONY: clean
clean:
	rm -rf $(OUTPUT_DIR)/golang $(OUTPUT_DIR)/typescript

.PHONY: all
all: clean ts-files go-files

.PHONY: ts-files
ts-files:
	$(OPENAPI_GENERATOR) generate -i /local/$(OPENAPI_SPEC) -g typescript -t /local/$(TS_TEMPLATE_DIR) -o /local/$(OUTPUT_DIR)/typescript --global-property models,modelDocs=false,modelTests=false
	$(info => Typescript models generated from OpenAPI)

.PHONY: go-files
go-files:
	$(OPENAPI_GENERATOR) generate -i /local/$(OPENAPI_SPEC) -g go -t /local/$(GO_TEMPLATE_DIR) -o /local/$(OUTPUT_DIR)/golang --global-property models,modelDocs=false,modelTests=false --additional-properties=packageName=models
	$(info => Golang models generated from OpenAPI)
