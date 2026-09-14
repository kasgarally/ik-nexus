#!/bin/sh
# Author: Karmil Asgarally - INTELLEKTRA © 2026
# Enable NGINX HTTPS when PEMs are mounted
#
# Runs before 20-envsubst-on-templates.sh in the official nginx image.
set -eu

CERT_DIR=/etc/nginx/certs
TEMPLATE_DIR=/etc/nginx/templates

if [ -f "$CERT_DIR/fullchain.pem" ] && [ -f "$CERT_DIR/privkey.pem" ]; then
  echo "TLS certs found; enabling HTTPS"

  # Host port may not be 443 (local Docker maps 8443:443). $host has no port.
  HTTPS_PORT="${HTTPS_PORT:-443}"
  if [ "$HTTPS_PORT" = "443" ]; then
    REDIRECT='return 301 https://$host$request_uri;'
  else
    REDIRECT="return 301 https://\$host:${HTTPS_PORT}\$request_uri;"
  fi

  cat > "$TEMPLATE_DIR/redirect.conf.template" <<EOF
server {
  listen 80;
  server_name _;
  ${REDIRECT}
}
EOF

  cat > "$TEMPLATE_DIR/ssl.conf.template" <<'EOF'
server {
  listen 443 ssl;
  http2 on;
  server_name _;

  ssl_certificate     /etc/nginx/certs/fullchain.pem;
  ssl_certificate_key /etc/nginx/certs/privkey.pem;
  ssl_protocols       TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;

  location / {
    proxy_pass http://meteor_app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 120s;
    proxy_send_timeout 120s;
  }
}
EOF

  rm -f "$TEMPLATE_DIR/app.conf.template"
else
  echo "No TLS certs mounted; HTTP only"
fi
