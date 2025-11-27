# Reconmap on Kubernetes

## Requirements

- Kubernetes 1.31 or greater

## Local dev requirements

- Make
- Minikube (https://minikube.sigs.k8s.io/docs/start/)
- Minikube ingress controller addon (https://kubernetes.github.io/ingress-nginx/deploy/)

## Provisioning

```shell
kubectl create secret generic redis-password --from-literal=value=REconDIS
make
```

## Tear down

```shell
make clean
```

## Troubleshooting

```shell
minikube start
minikube tunnel # Make an external IP available to load balancer services
minikube dashboard
```

Use `kubectl proxy` to create a proxy to access K8s API

DNS 

10.111.234.195 keycloak.nonprod.svc.cluster.local
10.108.112.100 web-client.nonprod.svc.cluster.local

