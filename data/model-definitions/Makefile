OPENAPI_GENERATOR_IMAGE?=openapitools/openapi-generator-cli:v7.13.0
OPENAPI_GENERATOR?=docker run --rm -u $(shell id -u):$(shell id -g) -v $(CURDIR):/local $(OPENAPI_GENERATOR_IMAGE)

PYTHON?=python3
OUTPUT_DIR?=output
DEFINITIONS_DIR?=definitions
MODEL_FILES=$(wildcard $(DEFINITIONS_DIR)/*.yaml)
GENERATED_OPENAPI=$(OUTPUT_DIR)/openapi-models.yaml
GO_TEMPLATE_DIR=templates/go
TS_TEMPLATE_DIR=templates/typescript

.PHONY: clean
clean:
	rm -rf $(OUTPUT_DIR)/golang $(OUTPUT_DIR)/typescript
	rm -f $(GENERATED_OPENAPI)

.PHONY: all
all: clean openapi-spec ts-files go-files

.PHONY: openapi-spec
openapi-spec: $(GENERATED_OPENAPI)

$(GENERATED_OPENAPI): $(MODEL_FILES) scripts/definitions_to_openapi.py
	mkdir -p $(OUTPUT_DIR)
	$(PYTHON) scripts/definitions_to_openapi.py --input-dir $(DEFINITIONS_DIR) --output $(GENERATED_OPENAPI)

.PHONY: ts-files
ts-files: openapi-spec
	$(OPENAPI_GENERATOR) generate -i /local/$(GENERATED_OPENAPI) -g typescript -t /local/$(TS_TEMPLATE_DIR) -o /local/$(OUTPUT_DIR)/typescript --global-property models,modelDocs=false,modelTests=false
	$(info => Typescript models generated from OpenAPI)

.PHONY: go-files
go-files: openapi-spec
	$(OPENAPI_GENERATOR) generate -i /local/$(GENERATED_OPENAPI) -g go -t /local/$(GO_TEMPLATE_DIR) -o /local/$(OUTPUT_DIR)/golang --global-property models,modelDocs=false,modelTests=false --additional-properties=packageName=models
	$(info => Golang models generated from OpenAPI)


