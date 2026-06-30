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
* `reconmap://findings`
* `reconmap://documents`
* `reconmap://agents`

## Requirements

The MCP server is a standard .NET 10 Console application located in the `apps/api/McpServer` directory.

## How to use it

The MCP Server has been configured to use the **Streamable HTTP (SSE)** transport instead of `stdio` to completely bypass any MSBuild or console output issues. It runs as a standalone ASP.NET Core web application.

### Running locally for Development

1. Ensure you have the .NET 10 SDK installed.
2. Build and run the project: 

```bash
cd apps/api
dotnet run --project McpServer/McpServer.csproj
```

By default, the server will start on port `5000` (e.g. `http://localhost:5000`).

### Using the MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is an official interactive developer tool that allows you to test and debug your MCP server locally without needing to connect it to a full AI client. 

To launch the MCP Inspector and connect it to your running Reconmap MCP Server, execute this command from a separate terminal:

```bash
npx @modelcontextprotocol/inspector sse http://localhost:5000/mcp
```

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
