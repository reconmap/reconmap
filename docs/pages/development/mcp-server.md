# Reconmap MCP Server

Reconmap includes an experimental Model Context Protocol (MCP) server. The MCP server allows AI agents, LLMs, and development environments that support MCP to natively interact with Reconmap using tools and resources.

## Purpose

The MCP server acts as an extension (or subset) of the core Reconmap API, providing standard MCP tooling that exposes Reconmap's features to language models. 

Currently, the server exposes limited tools such as:

* `ListProjects`: Retrieves a list of active Reconmap projects.
* `GetProjectDetails`: Gets the detailed metadata and description of a specific project by its ID.

In addition, the server exposes the following Resources (data sources):

* `reconmap://projects`
* `reconmap://tasks`
* `reconmap://vulnerabilities`
* `reconmap://runners`

## Requirements

The MCP server is a standard .NET 10 Console application located in the `src/api/McpServer` directory.

## Authentication and authorization

Every request to `/mcp` must carry `Authorization: Bearer <token>`. Two kinds of token are accepted, the same ones as the REST API:

- A **Reconmap API token** (created from the user's profile). Tokens with the `read-only` scope are fine here because the server only exposes read operations.
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

## How to use it

The MCP Server has been configured to use the **Streamable HTTP (SSE)** transport instead of `stdio` to completely bypass any MSBuild or console output issues. It runs as a standalone ASP.NET Core web application.

### Running locally for Development

1. Ensure you have the .NET 10 SDK installed.
2. Build and run the project: 

```bash
cd src/api
dotnet run --project McpServer/McpServer.csproj
```

By default, the server will start on port `5000` (e.g. `http://localhost:5000`).

### Using the MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is an official interactive developer tool that allows you to test and debug your MCP server locally without needing to connect it to a full AI client. 

To launch the MCP Inspector and connect it to your running Reconmap MCP Server, execute this command from a separate terminal:

```bash
npx @modelcontextprotocol/inspector http://localhost:5000/mcp
```

The Inspector detects the transport from the URL (`/mcp` means Streamable HTTP). Do not put a transport name such as `sse` before the URL: the Inspector treats it as a command to spawn, which fails with `spawn sse ENOENT`. If you prefer the web UI, run `npx @modelcontextprotocol/inspector` with no arguments, choose **Streamable HTTP** as the transport, and enter `http://localhost:5000/mcp`.

This will start a local web interface where you can:
- View all available Resources (like `reconmap://projects`).
- See all registered Tools (like `ListProjects`).
- Execute tools interactively and see their JSON responses.

### Connecting an AI Client

To connect an AI assistant (such as Claude Desktop or VS Code Copilot) to the Reconmap MCP Server, you need to configure it to connect via Server-Sent Events (SSE) to the HTTP endpoint.

Example `mcp.json` (or `claude_desktop_config.json`) configuration:

```json
{
  "mcpServers": {
    "ReconmapMCP": {
      "command": "node",
      "args": [
        "path/to/some-sse-proxy.js", 
        "http://localhost:5000/mcp"
      ]
    }
  }
}
```

*Note: Some clients natively support SSE URLs directly. If your client requires a command, you might need a simple proxy script. Please check your specific AI client's documentation on how to configure SSE endpoints.*
