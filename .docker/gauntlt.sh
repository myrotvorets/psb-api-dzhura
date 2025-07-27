#!/bin/sh

(timeout 300 sh -c 'while ! nc -z mysql 3306; do sleep 5; done' || false) && /usr/local/bin/gauntlt
