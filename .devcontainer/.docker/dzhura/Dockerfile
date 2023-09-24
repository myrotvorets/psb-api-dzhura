FROM ghcr.io/sjinks/codespaces/alpine-base:latest@sha256:76467407c0021602244c5d8b97469d13828b91f77bf05536aa6aa41e3cfed6ee

RUN \
    apk add --no-cache nodejs npm python3 make g++ nginx

COPY rootfs /
WORKDIR /usr/src/service

RUN chown -R vscode:vscode /usr/src/service
