FROM golang:1.27-alpine AS builder

WORKDIR /build

RUN mkdir -p runner/{cmd,internal}
COPY runner/go.mod runner/go.sum ./runner/
COPY runner/cmd/ ./runner/cmd
COPY runner/internal/ ./runner/internal
COPY shared-lib/ ./shared-lib

WORKDIR /build/runner
ENV CGO_ENABLED=0
RUN go build -o /build/reconmapd ./cmd/reconmapd

FROM kalilinux/kali-rolling

LABEL org.opencontainers.image.vendor="Netfoe" \
    org.opencontainers.image.authors="Santiago Lizardo" \
    org.opencontainers.image.title="Reconmap Runner" \
    org.opencontainers.image.description="Reconmap runner (reconmapd): receives tasks from the API and executes security tools" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.url="https://reconmap.com" \
    org.opencontainers.image.source="https://github.com/reconmap/reconmap/tree/main/src/runner" \
    org.opencontainers.image.documentation="https://reconmap.com"

WORKDIR /app

COPY --from=builder /build/reconmapd /app/reconmapd

EXPOSE 10000

CMD ["/app/reconmapd"]

