FROM node:24-bookworm-slim

LABEL org.opencontainers.image.vendor="Netfoe" \
    org.opencontainers.image.authors="Santiago Lizardo" \
    org.opencontainers.image.title="Reconmap Dashboard Dev Image" \
    org.opencontainers.image.description="Node.js development image for building the Reconmap dashboard" \
    org.opencontainers.image.licenses="MIT" \
    org.opencontainers.image.url="https://reconmap.com" \
    org.opencontainers.image.source="https://github.com/reconmap/reconmap/tree/main/src/dashboard" \
    org.opencontainers.image.documentation="https://reconmap.com"

ARG DEBIAN_FRONTEND=noninteractive

ARG HOST_UID=1000
ARG HOST_GID=1000

RUN groupmod -g ${HOST_GID} node && \
    usermod -u ${HOST_UID} -g ${HOST_GID} node

WORKDIR /home/node
USER node

ENV NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    DISABLE_OPENCOLLECTIVE=true

ENV PATH=/home/node/app/node_modules/.bin:$PATH
