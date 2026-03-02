FROM golang:1.25-alpine AS builder

WORKDIR /build

RUN mkdir -p agent/{cmd,internal}
COPY agent/go.mod agent/go.sum ./agent/
COPY agent/cmd/ ./agent/cmd
COPY agent/internal/ ./agent/internal
COPY shared-lib/ ./shared-lib

WORKDIR /build/agent
ENV CGO_ENABLED=0
RUN go build -o /build/reconmapd ./cmd/reconmapd

FROM kalilinux/kali-rolling

LABEL org.opencontainers.image.source=https://github.com/reconmap/reconmap
LABEL org.opencontainers.image.description="reconmap/agent"
LABEL org.opencontainers.image.licenses="Apache-2.0"

WORKDIR /app

COPY --from=builder /build/reconmapd /app/reconmapd

EXPOSE 10000

CMD ["/app/reconmapd"]

