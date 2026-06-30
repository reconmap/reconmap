# Reconmap on Kubernetes

## Requirements

- Kubernetes 1.34 or greater

## Local dev requirements

- Make
- Minikube (https://minikube.sigs.k8s.io/docs/start/)
- Minikube ingress controller addon (https://kubernetes.github.io/ingress-nginx/deploy/)

## Provisioning

The Kubernetes resources include deployments for Keycloak, MySQL, Redis, dashboard, the C# REST API (`ngapi`), and the **RabbitMQ** message queue.

To deploy using the raw manifests:

```shell
kubectl create secret generic redis-password --from-literal=value=REconDIS
make
```

## Deploying with Helm (Recommended)

Alternatively, you can deploy the entire stack using the unified Helm chart, which supports easy configuration overrides via values:

```shell
# 1. Move to the helm-charts directory
cd helm-charts/reconmap

# 2. Deploy using Helm
helm install reconmap .
```

To configure custom options, secrets, or external databases, modify `values.yaml` or provide your overrides using `--set` or a custom values file.

## Tear down

To tear down the raw manifests:

```shell
make clean
```

To uninstall the Helm release:

```shell
helm uninstall reconmap
```

## Troubleshooting

```shell
minikube delete
minikube start
minikube tunnel # Make an external IP available to load balancer services
minikube dashboard
```

Use `kubectl proxy` to create a proxy to access K8s API

DNS 

10.111.234.195 keycloak.nonprod.svc.cluster.local
10.108.112.100 dashboard.nonprod.svc.cluster.local

