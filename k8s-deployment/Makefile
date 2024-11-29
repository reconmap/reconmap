SHELL:=bash
deploy:
	kubectl apply -f resources/namespaces.yaml
	kubens nonprod
	@for file in resources/*.yaml; do \
		echo Applying $$file...; \
		kubectl apply -f $$file; \
	done

portforward:
	@kubectl port-forward service/api 5510:5510 & \
	kubectl port-forward service/web-client 5500:5500 & \
	kubectl port-forward service/keycloak 8080:8080 &

clean:
	kubens nonprod
	@for file in resources/*.yaml; do \
		echo Deleting $$file...; \
		kubectl delete -f $$file; \
	done

convert:
	kompose convert -f ../reconmap/docker-compose.yml --namespace=nonprod --with-kompose-annotation=false -o resources

