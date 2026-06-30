validate:
	helm lint .

install: validate
	helm install reconmap .

uninstall:
	helm uninstall reconmap

get-values:
	helm get values reconmap

get-manifest:
	helm get manifest reconmap
