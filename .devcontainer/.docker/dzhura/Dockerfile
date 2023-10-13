FROM ghcr.io/sjinks/codespaces/nodejs:latest@sha256:aaa065a0c80c3fb4a11fe38f3a4f16a883d5f36bf5fd5ec2fe51de665f7ca3f1

ENV SERVICE_NAME dzhura

RUN \
    apk add --no-cache nginx && \
    sed -i "s/user nginx;/user ${CONTAINER_USER};/" /etc/nginx/nginx.conf && \
    chown -R "${CONTAINER_USER}:${CONTAINER_USER}" /run/nginx /var/log/nginx /var/lib/nginx

COPY rootfs /
WORKDIR /usr/src/service

RUN chown -R "${CONTAINER_USER}:${CONTAINER_USER}" /usr/src/service
