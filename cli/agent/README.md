
# Reconmap agent

The Reconmap agent allows clients (such as the Web client) to launch commands remotely, open interactive browser terminals, and receive push notifications. 

This is a component of many in the [Reconmap's architecture](https://reconmap.org/development/architecture.html).

## Runtime requirements 

- Docker
- Make
- Linux/Macos operating system due to dependency on OS dependent syscalls

## Terminal security

The `/term` endpoint creates an interactive shell and is restricted to Keycloak
`dashboard` users with the `administrator` or `superuser` role. Configure
`validOrigins` to the exact dashboard origin (for example,
`https://reconmap.example.com`). The agent rejects missing or mismatched Origin
headers. Deploy the endpoint behind TLS in production and ensure the proxy
forwards `Sec-WebSocket-Protocol` unchanged.

Browser clients authenticate with the `reconmap-terminal` WebSocket protocol
and a `bearer.<access-token>` protocol value. Query-string tokens are not
supported.

The dashboard access token must contain `dashboard` in `aud` and `azp`. For an
existing Keycloak realm, add an Audience protocol mapper to the `dashboard`
client with **Included Client Audience** set to `dashboard`, enable **Add to
access token**, then have users sign in again.

## How to run

```shell
RMAP_KEYCLOAK_HOSTNAME=http://localhost:8080 RMAP_AGENT_CLIENT_ID=admin-cli RMAP_AGENT_CLIENT_SECRET=******************** RMAP_REST_API_URL=http://localhost:5510/api VALID_ORIGINS=http://localhost:5500 REDIS_HOST=127.0.0.1 REDIS_PORT=6379 REDIS_PASSWORD=REconDIS ./reconmapd
```

## Logging & Error Handling

During background boot and ping processes, the agent tracks the HTTP response status. If the REST API returns any non-2xx response (e.g., `401 Unauthorized` or `500 Internal Server Error`), the agent will capture the unexpected status code and log it under an Error severity.
