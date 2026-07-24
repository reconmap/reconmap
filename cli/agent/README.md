
# Reconmap agent

The Reconmap agent allows clients (such as the Web client) to launch commands remotely, open interactive browser terminals, and receive push notifications. 

This is a component of many in the [Reconmap's architecture](https://reconmap.org/development/architecture.html).

## Runtime requirements 

- Docker
- Make
- Linux/Macos operating system due to dependency on OS dependent syscalls

## How to run

```shell
RMAP_KEYCLOAK_HOSTNAME=http://localhost:8080 RMAP_AGENT_CLIENT_ID=admin-cli RMAP_AGENT_CLIENT_SECRET=******************** RMAP_REST_API_URL=http://localhost:5510/api VALID_ORIGINS=http://localhost:5500 REDIS_HOST=127.0.0.1 REDIS_PORT=6379 REDIS_PASSWORD=REconDIS ./reconmapd
```

## Logging & Error Handling

During background boot and ping processes, the agent tracks the HTTP response status. If the REST API returns any non-2xx response (e.g., `401 Unauthorized` or `500 Internal Server Error`), the agent will capture the unexpected status code and log it under an Error severity.


