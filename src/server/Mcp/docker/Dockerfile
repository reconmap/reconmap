# Build context is src/server: Mcp references the Api project.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /build

# Restore first so the package layer is cached until a project file changes.
COPY Api/Api.csproj Api/
COPY Mcp/Mcp.csproj Mcp/
RUN dotnet restore Mcp/Mcp.csproj
RUN dotnet list Mcp/Mcp.csproj package --vulnerable --include-transitive

COPY Api/ Api/
COPY Mcp/ Mcp/
RUN dotnet publish Mcp/Mcp.csproj --no-restore -c Release -p:UseAppHost=false -o /build/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0

LABEL org.opencontainers.image.vendor="Netfoe" \
    org.opencontainers.image.authors="Santiago Lizardo" \
    org.opencontainers.image.title="Reconmap MCP Server" \
    org.opencontainers.image.description="Model Context Protocol server for Reconmap" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.url="https://github.com/reconmap/reconmap" \
    org.opencontainers.image.source="https://github.com/reconmap/reconmap" \
    org.opencontainers.image.documentation="https://docs.reconmap.com"

ENV ASPNETCORE_HTTP_PORTS=5520
EXPOSE 5520

WORKDIR /app
COPY --from=build /build/publish .

# Run unprivileged (user shipped with the aspnet image).
USER $APP_UID
ENTRYPOINT ["dotnet", "Mcp.dll"]
