FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /build

COPY . ./
RUN dotnet restore
RUN dotnet list package --vulnerable --include-transitive
RUN dotnet publish -o /build/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0

LABEL org.opencontainers.image.vendor="Netfoe" \
    org.opencontainers.image.authors="Santiago Lizardo" \
    org.opencontainers.image.title="Reconmap API" \
    org.opencontainers.image.description="REST API for Reconmap" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.url="https://reconmap.com" \
    org.opencontainers.image.source="https://github.com/reconmap/reconmap/tree/main/src/server/Api" \
    org.opencontainers.image.documentation="https://reconmap.com"

EXPOSE 5510

WORKDIR /app
RUN mkdir -p /seed/attachments
COPY data/attachments /seed/attachments
COPY --from=build /build/publish .
ENTRYPOINT ["/app/App"]
