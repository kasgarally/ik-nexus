# Author: Karmil Asgarally - INTELLEKTRA © 2026
# NGINX reverse-proxy image
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY templates/ /etc/nginx/templates/
COPY docker-entrypoint.d/ /docker-entrypoint.d/

RUN rm -f /etc/nginx/conf.d/default.conf \
  && chmod +x /docker-entrypoint.d/*.sh
