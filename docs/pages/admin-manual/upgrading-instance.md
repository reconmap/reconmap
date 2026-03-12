---
title: Upgrading a Reconmap instance
parent: Admin manual
---

### Incremental upgrade

This is the upgrade path on instances where you have data and you want to preserve it (99% of the cases).

Run the following commands on the directory where you have your `docker-compose.yml`.

```shell
docker-compose pull # Download latest version of the docker images
docker-compose down # Stop and remove any containers
docker-compose up -d # Build containers and start them
```

### Destructive upgrade

**CAUTION:** This method will destroy all existing data. Do not proceed with these instructions unless you don't mind losing everything that exists in the Reconmap database.

```shell
docker-compose pull # Download latest version of the docker images
docker-compose down -v # Stop and remove any containers and volumes
rm -rf data-mysql # Remove MySQL data directory
docker-compose up -d # Build containers and start them
```
