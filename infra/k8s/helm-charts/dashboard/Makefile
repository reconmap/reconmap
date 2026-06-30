
validate:
	helm lint . --values nonprod-values.yaml

install: validate
	helm install reconmap-dashboard . --values nonprod-values.yaml

uninstall:
	helm uninstall reconmap-dashboard

get-values:
	helm get values reconmap-dashboard

get-manifest:
	helm get manifest reconmap-dashboard


