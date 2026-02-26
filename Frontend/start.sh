#!/bin/sh
# Sustituye $PORT en la config de nginx y arranca el servidor
envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
