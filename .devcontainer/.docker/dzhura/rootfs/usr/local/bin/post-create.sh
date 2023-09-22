#!/bin/sh

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

cd /usr/src/service || exit 1

if [ ! -f .npmrc.local ] || ! grep -q '//npm.pkg.github.com/:_authToken=' .npmrc.local; then
    if [ -n "${GITHUB_TOKEN}" ]; then
        echo "Using GITHUB_TOKEN to authenticate to npm.pkg.github.com"
        echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc.local
    elif [ -n "${READ_PACKAGES_TOKEN}" ]; then
        echo "Using READ_PACKAGES_TOKEN to authenticate to npm.pkg.github.com"
        echo "//npm.pkg.github.com/:_authToken=${READ_PACKAGES_TOKEN}" >> .npmrc.local
    else
        echo "WARNING: Neither GITHUB_TOKEN nor READ_PACKAGES_TOKEN is available; package download may fail."
    fi
else
    echo ".npmrc.local already exists and has an authentication token for npm.pkg.github.com"
fi

sudo sv start dzhura
