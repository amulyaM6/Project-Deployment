#!/bin/sh
set -eu
: "${PORT:=7860}"
export PORT
# Render supplies PORT; Hugging Face/Docker-style environments can use 7860.
envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
