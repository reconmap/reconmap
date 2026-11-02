NAMESPACE ?= reconmap
RELEASE ?= reconmap

.PHONY: validate
validate:
	helm lint --strict .
	helm template $(RELEASE) . | kubeconform -strict -summary -ignore-missing-schemas

.PHONY: install
install: validate
	helm upgrade --install $(RELEASE) . --namespace $(NAMESPACE) --create-namespace
	kubectl label namespace $(NAMESPACE) pod-security.kubernetes.io/enforce=restricted --overwrite

.PHONY: uninstall
uninstall:
	helm uninstall $(RELEASE) --namespace $(NAMESPACE)

.PHONY: get-values
get-values:
	helm get values $(RELEASE) --namespace $(NAMESPACE)

.PHONY: get-manifest
get-manifest:
	helm get manifest $(RELEASE) --namespace $(NAMESPACE)
