FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /build

COPY . ./
RUN dotnet restore
RUN dotnet list package --vulnerable --include-transitive
RUN dotnet publish -o /build/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0

EXPOSE 5510

LABEL org.opencontainers.image.vendor="Netfoe" \
    org.opencontainers.image.authors="Santiago Lizardo" \
    org.opencontainers.image.title="Reconmap NextGen API" \
    org.opencontainers.image.description="Rest API for Reconmap" \
    org.opencontainers.image.licenses="Apache-2.0" \
    org.opencontainers.image.url="https://github.com/reconmap/reconmap" \
    org.opencontainers.image.source="https://github.com/reconmap/rest-api" \
    org.opencontainers.image.documentation="https://github.com/reconmap/documentation"

WORKDIR /app
RUN mkdir -p /seed/attachments
COPY data/attachments /seeds/attachments
COPY --from=build /build/publish .
ENTRYPOINT ["/app/App"]
