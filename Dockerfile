FROM myrotvorets/node:latest@sha256:ef78972c0853f704b2e25bbe70affbe0e9103685cf22c14450c86aaa89833946 AS build
USER root
WORKDIR /srv/service
RUN chown nobody:nobody /srv/service
USER nobody:nobody
COPY --chown=nobody:nobody ./package.json ./package-lock.json ./tsconfig.json .npmrc* ./
RUN \
    npm ci --ignore-scripts --userconfig .npmrc.local && \
    rm -f .npmrc.local && \
    npm rebuild && \
    npm run prepare --if-present
COPY --chown=nobody:nobody ./src ./src
RUN npm run build -- --declaration false --removeComments true --sourceMap false
RUN npm prune --omit=dev

FROM myrotvorets/node-min@sha256:ba43159e8aa08257ae8574542a2bba98158c0e3cccaf4cc4d4aa2e81c9495775
USER root
WORKDIR /srv/service
RUN chown nobody:nobody /srv/service
USER nobody:nobody
ENTRYPOINT ["/usr/bin/node", "index.mjs"]
COPY --chown=nobody:nobody --from=build /srv/service/node_modules ./node_modules
COPY --chown=nobody:nobody ./src/specs ./specs
COPY --chown=nobody:nobody --from=build /srv/service/dist/ ./
COPY --chown=nobody:nobody ./package.json ./
