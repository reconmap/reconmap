# Agent terminal security

Reconmap's browser terminal starts an interactive shell on the selected agent. Treat access to it as privileged host access.

Only users with the `administrator` or `superuser` role on the Keycloak `dashboard` client can open a terminal. The agent verifies the access-token signature, expiry, issuer, `aud`, `azp`, and `resource_access.dashboard.roles` before upgrading the WebSocket connection. Tokens for `user`, `client`, service accounts, or other OIDC clients are rejected.

## Configure the dashboard token audience

The dashboard access token must include `dashboard` in its `aud` claim and use `dashboard` as its `azp` claim. New deployments receive this from the realm import. For an existing realm, add an **Audience** protocol mapper to the `dashboard` client (or its `dashboard-dedicated` client scope) in the Keycloak Admin Console:

1. Set **Included Client Audience** to `dashboard`.
2. Enable **Add to access token** and disable **Add to ID token**.
3. Save the mapper, then have terminal users sign out and sign in again to obtain a new access token.

The expected claim is `"aud": ["…", "dashboard"]`. A terminal log rejection stating `token is not intended for dashboard` indicates that this mapper has not yet been applied or the browser is still using an old token.

## Configure the allowed dashboard origin

Set the agent `validOrigins` setting to the exact origin of the dashboard, including scheme and port and without a path. For example:

```json
{
  "validOrigins": "https://reconmap.example.com"
}
```

The agent rejects upgrades with a missing or different `Origin` header. Configure one agent per dashboard origin when separate dashboard deployments are required.

## Deploy over TLS

Expose an agent terminal through a TLS-terminating reverse proxy in production and access it with `wss://`. Do not expose the agent's plain HTTP listener to untrusted networks. The dashboard passes the access token in the `Sec-WebSocket-Protocol` handshake header, not in the URL; reverse proxies must forward that header unchanged.

The terminal protocol is `reconmap-terminal` plus a `bearer.<access-token>` protocol value. Integrations using the former `?token=` URL parameter must migrate before upgrading.
