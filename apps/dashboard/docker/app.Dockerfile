FROM reconmap/web-client:dev AS builder

WORKDIR /home/node
USER node

ARG RECONMAP_APP_GIT_COMMIT_HASH
ENV VITE_GIT_COMMIT_HASH=${RECONMAP_APP_GIT_COMMIT_HASH}
# ENV NODE_ENV=production

COPY --chown=node:node package.json package-lock.json tsconfig.json vite.config.js index.html ./app/
COPY --chown=node:node src ./app/src
COPY --chown=node:node public ./app/public

WORKDIR /home/node/app
RUN npm ci && \
    npm run build

FROM nginx:stable

LABEL org.opencontainers.image.licenses="Apache-2.0"
LABEL org.opencontainers.image.vendor="Netfoe" \
    org.opencontainers.image.authors="Santiago Lizardo" \
    org.opencontainers.image.title="Reconmap UI" \
    org.opencontainers.image.description="Reconmap Web Clien" \
    org.opencontainers.image.licenses="Apache-2.0" \
    org.opencontainers.image.url="https://github.com/reconmap/reconmap" \
    org.opencontainers.image.source="https://github.com/reconmap/web-client" \
    org.opencontainers.image.documentation="https://github.com/reconmap/documentation"

RUN sed -i '/^user\s\+/d' /etc/nginx/nginx.conf

RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx
RUN touch /run/nginx.pid && \
    chown nginx:nginx /run/nginx.pid

COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/

COPY --from=builder --chown=nginx:nginx /home/node/app/build /usr/share/nginx/html

EXPOSE 5500

USER nginx
CMD ["nginx", "-g", "daemon off;"]