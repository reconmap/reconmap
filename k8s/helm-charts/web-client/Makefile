
validate:
	helm lint . --values nonprod-values.yaml

install: validate
	helm install reconmap-webclient . --values nonprod-values.yaml

uninstall:
	helm uninstall reconmap-webclient

get-values:
	helm get values reconmap-webclient

get-manifest:
	helm get manifest reconmap-webclient


