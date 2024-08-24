#!/bin/sh

# shellcheck disable=SC2016
(timeout 300 sh -c 'while [ "$(curl -s -o /dev/null -w ''%{http_code}'' http://dzhura:3000/monitoring/health)" != "200" ]; do sleep 5; done' || false) && \
    /usr/local/bin/gauntlt
