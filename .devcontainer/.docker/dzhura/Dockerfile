FROM ghcr.io/sjinks/codespaces/alpine-base:latest@sha256:31cf3a267c59a9887acd0d68c62c46bc808c53e78debe87492f56ef84a019632

RUN \
    apk add --no-cache nodejs npm python3 make g++ nginx

COPY rootfs /
WORKDIR /usr/src/service

RUN chown -R vscode:vscode /usr/src/service
