---
title: Deployment options
parent: Admin manual
---

Reconmap is made of many microservices and clients, and its deployment can be done in many different ways.

### Docker compose and swarm

This is a great option if you don't want to install dependencies manually, and are familiar with Docker containers.

### Kubernetes

Ideal if you want to scale Reconmap to large teams or to public communities accessible by anyone on the internet.

More information on how to deploy Reconmap to K8s can be found on this [Github repository](https://github.com/reconmap/k8s-deployment).

### Manually

Manually refers to the option of installing all dependencies (eg .NET, MySQL, Nginx, ...) and the application on an operating system and server of your choice.

This option gives you complete flexibility but also adds a lot of maintenance overhead.

### SaaS

If you prefer to use a Software-as-a-Service solution, [Reconmap.com](https://reconmap.com) is the place for you. Hosted Reconmap from the lead developers of the project.
