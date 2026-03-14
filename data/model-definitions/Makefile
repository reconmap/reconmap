POCOGLOT=pocoglot

LOGGING?=INFO

YAML=$(wildcard definitions/*.yaml)

.PHONY: clean
clean:
	rm -f output/*

.PHONY: all
all: clean php-files ts-files go-files

.PHONY: php-files
php-files: $(subst .yaml,.php,$(YAML))
	$(info => PHP files generated)

%.php: %.yaml
	$(POCOGLOT) -from $< -override overrides.yaml -to output/$(notdir $@) -lang php8 -logging $(LOGGING)

.PHONY: ts-files
ts-files: $(subst .yaml,.ts,$(YAML))
	$(info => Typescript files generated)

%.ts: %.yaml
	$(POCOGLOT) -from $< -override overrides.yaml -to output/$(notdir $@) -lang typescript -logging $(LOGGING)

.PHONY: go-files
go-files: $(subst .yaml,.go,$(YAML))
	$(info => Golang files generated)

%.go: %.yaml
	$(POCOGLOT) -from $< -override overrides.yaml -to output/$(notdir $@) -lang golang -logging $(LOGGING)


