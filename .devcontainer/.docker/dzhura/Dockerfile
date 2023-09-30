FROM ghcr.io/sjinks/codespaces/nodejs:latest@sha256:04805972fe280ba8a0e7951e101f5139316f123b79542d0e38073d861cda3a8a

ENV SERVICE_NAME dzhura

RUN \
    apk add --no-cache nginx && \
    sed -i "s/user nginx;/user ${CONTAINER_USER};/" /etc/nginx/nginx.conf && \
    chown -R "${CONTAINER_USER}:${CONTAINER_USER}" /run/nginx /var/log/nginx /var/lib/nginx

COPY rootfs /
WORKDIR /usr/src/service

RUN chown -R "${CONTAINER_USER}:${CONTAINER_USER}" /usr/src/service
