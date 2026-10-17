# Reconmap MCP Server

This is the Model Context Protocol (MCP) server for Reconmap. It exposes Reconmap's core features (Projects, Tasks, Findings, Documents, Runners) as tools and resources that AI assistants and LLMs can interact with directly.

## Overview

Unlike traditional console-based MCP servers, this server runs as an **ASP.NET Core Web Application** and communicates using **Streamable HTTP (Server-Sent Events / SSE)**. This approach eliminates issues with MSBuild output polluting the JSON-RPC stream and allows the MCP server to run seamlessly alongside your other Reconmap API services.

## Usage

### Running Locally

To start the MCP server locally:

```bash
cd src/api
dotnet run --project McpServer/McpServer.csproj
```

The server will start and listen on port `5000` by default (e.g., `http://localhost:5000`).

### Connecting with MCP Inspector

You can interactively test and debug the MCP server using the official MCP Inspector. Run the following command in a new terminal window while the server is running:

```bash
npx @modelcontextprotocol/inspector http://localhost:5000/mcp
```

### Connecting AI Clients

Configure your AI assistant (e.g., Claude Desktop, Cursor, or VS Code Copilot) to connect to the MCP server via the SSE endpoint: `http://localhost:5000/mcp`. Note that if your client only supports `stdio` commands, you may need a small node.js proxy script to convert `stdio` JSON-RPC into an SSE connection.

## Authentication and authorization

Every request to `/mcp` must carry `Authorization: Bearer <token>`. Two kinds of token are accepted, the same ones as the REST API:

- A **Reconmap API token** . Tokens with the `read-only` scope are fine here because the server only exposes read operations.
- A **Keycloak access token** (JWT) for the Reconmap realm, normally obtained through the OAuth flow described below.

Requests without a valid token get `401 Unauthorized`.

### OAuth login for MCP clients

The server implements the OAuth discovery part of the [MCP authorization specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization), with Keycloak as the authorization server:

1. A client calls `/mcp` without a token and gets `401` with `WWW-Authenticate: Bearer resource_metadata="…/.well-known/oauth-protected-resource/mcp"`.
2. The client reads that document (served by the MCP server), which lists the Keycloak realm (`Keycloak:ValidIssuer`) as the authorization server.
3. The client reads the Keycloak metadata, uses its client ID (`mcp-client`, see below), sends the user to the Keycloak login page (authorization code with PKCE), and receives an access token.
4. The client calls `/mcp` again with `Authorization: Bearer <access token>`.

The MCP Inspector and other OAuth-capable clients do all of this by themselves: just connect without any header and sign in when the browser opens. Users sign in with their normal Reconmap account and get that account's permissions.

Configuration:

- `Keycloak:ValidIssuer` must be an issuer URL the client can reach, for example `http://localhost:8080/realms/reconmap`.
- `Mcp:PublicUrl` (optional) is the public URL of the MCP endpoint, for example `https://mcp.example.com/mcp`. By default it is derived from the request, which is wrong behind a reverse proxy that changes the host or scheme.
- `Mcp:AllowedOrigins` lists the browser origins allowed to call the MCP server (CORS). Browser-based clients run the OAuth discovery from the browser, so their origin must be listed. `Cors:AllowedOrigins` and the MCP Inspector defaults (`http://localhost:6274`, `http://127.0.0.1:6274`) are always included.
- Keycloak rejects anonymous dynamic client registration by default (the *Trusted Hosts* policy answers `Host not trusted`), so clients cannot register themselves. Use the pre-registered public client **`mcp-client`** instead: in the MCP Inspector open the OAuth settings and set **Client ID** to `mcp-client` (no secret). It requires PKCE and allows the redirect URIs of the MCP Inspector (`http://localhost:6274` and `http://127.0.0.1:6274`) VS Code and OpenCode. Add the redirect URI of any other client to it in Keycloak (Clients → `mcp-client`). The client is part of `infra/keycloak/realm.json`, which is only imported into a new realm: on an existing installation, create an equivalent public client by hand (standard flow on, PKCE method `S256`, the redirect URIs above, default client scopes `roles`, `profile` and `email`; some clients such as OpenCode also request `offline_access`, so keep that scope on the client and give users the `offline_access` realm role, otherwise the login fails with `Offline tokens not allowed for the user or client`).

Access follows the same rules as the REST API:

- Administrators and superusers can read everything.
- Users and clients only see data in projects they are a member of. Lists of projects, tasks and vulnerabilities are filtered accordingly, and reading a single project is checked against the OPA policy (`policy/authz.rego`).
- Runners are infrastructure data and are only available to administrators and superusers.
- A denied call fails with `Access denied.`

The server needs the same configuration as the API (`Keycloak`, `Opa`, `Redis` and database settings in `appsettings.json`), and browser access is limited to the origins in `Cors:AllowedOrigins`.

For OpenCode, add to `opencode.json`, then run `opencode mcp auth reconmap` (or just start OpenCode and use the server; it opens the browser for the Keycloak login):

```json
{
  "mcp": {
    "reconmap": {
      "type": "remote",
      "url": "http://localhost:5000/mcp",
      "oauth": { "clientId": "mcp-client" }
    }
  }
}
```

If your client does not support OAuth, send an API token instead. With the MCP Inspector, add a custom `Authorization` header with the value `Bearer <your-api-token>`. AI clients usually accept a header, for example:

```json
{
  "mcpServers": {
    "reconmap": {
      "url": "http://localhost:5000/mcp",
      "headers": { "Authorization": "Bearer <your-api-token>" }
    }
  }
}
```

## Development

The MCP server shares the same `AppDbContext` and Entity Framework schema as the main Reconmap API project. 

- **Resources**: Configured in `Resources/ReconmapResources.cs`. Exposes entity endpoints like `reconmap://projects`.
- **Tools**: Configured in `Tools/ReconmapTools.cs`. Exposes executable functions.
- **Database**: Database configurations are automatically loaded from `src/api/src/appsettings.json` and `appsettings.Development.json` during build. Ensure your `launchSettings.json` or `ASPNETCORE_ENVIRONMENT` environment variable is set to `Development` for local testing.
