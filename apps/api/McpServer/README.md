# Reconmap MCP Server

This is the Model Context Protocol (MCP) server for Reconmap. It exposes Reconmap's core features (Projects, Tasks, Findings, Documents, Agents) as tools and resources that AI assistants and LLMs can interact with directly.

## Overview

Unlike traditional console-based MCP servers, this server runs as an **ASP.NET Core Web Application** and communicates using **Streamable HTTP (Server-Sent Events / SSE)**. This approach eliminates issues with MSBuild output polluting the JSON-RPC stream and allows the MCP server to run seamlessly alongside your other Reconmap API services.

## Usage

### Running Locally

To start the MCP server locally:

```bash
cd apps/api
dotnet run --project McpServer/McpServer.csproj
```

The server will start and listen on port `5000` by default (e.g., `http://localhost:5000`).

### Connecting with MCP Inspector

You can interactively test and debug the MCP server using the official MCP Inspector. Run the following command in a new terminal window while the server is running:

```bash
npx @modelcontextprotocol/inspector sse http://localhost:5000/mcp
```

### Connecting AI Clients

Configure your AI assistant (e.g., Claude Desktop, Cursor, or VS Code Copilot) to connect to the MCP server via the SSE endpoint: `http://localhost:5000/mcp`. Note that if your client only supports `stdio` commands, you may need a small node.js proxy script to convert `stdio` JSON-RPC into an SSE connection.

## Development

The MCP server shares the same `AppDbContext` and Entity Framework schema as the main Reconmap API project. 

- **Resources**: Configured in `Resources/ReconmapResources.cs`. Exposes entity endpoints like `reconmap://projects`.
- **Tools**: Configured in `Tools/ReconmapTools.cs`. Exposes executable functions.
- **Database**: Database configurations are automatically loaded from `apps/api/src/appsettings.json` and `appsettings.Development.json` during build. Ensure your `launchSettings.json` or `ASPNETCORE_ENVIRONMENT` environment variable is set to `Development` for local testing.
