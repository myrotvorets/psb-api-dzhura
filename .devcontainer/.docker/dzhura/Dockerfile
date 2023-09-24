FROM ghcr.io/sjinks/codespaces/alpine-base:latest

RUN \
    apk add --no-cache nodejs npm python3 make g++ nginx

COPY rootfs /
WORKDIR /usr/src/service

RUN chown -R vscode:vscode /usr/src/service
