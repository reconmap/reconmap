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

LABEL org.opencontainers.image.source=https://github.com/reconmap/reconmap
LABEL org.opencontainers.image.description="reconmap/runner"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY --from=builder /build/reconmapd /app/reconmapd

EXPOSE 10000

CMD ["/app/reconmapd"]

