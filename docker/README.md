<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Docker stack usage
-->
# Docker stacks

Each Meteor app under `apps/` gets one Compose stack: NGINX in front, the production Meteor image, and MongoDB on a named volume.

Commands go through a Node runner and root npm scripts. The same commands work on Windows, Linux, and macOS. You only need Node and Docker. There is no PowerShell-only path.

## Commands

```bash
npm run docker:up -- nexus-govrn
npm run docker:build -- nexus-govrn
npm run docker:ps -- nexus-govrn
npm run docker:down -- nexus-govrn
npm run docker:down -- nexus-govrn --volumes   # also wipe Mongo data
npm run docker:certs -- nexus-govrn            # local self-signed TLS for :8443
```

Or `npm run docker -- <command> [app]`. With only one app env file, the name can be omitted. `npm run docker -- help` lists every command.

Add another app by creating `docker/apps/<name>.env` and `docker/certs/<name>/`.

## Why 8081 works and 8443 does not (until you add certs)

`docker/apps/nexus-govrn.env` publishes two host ports:

| Host port | Container | Used for |
|-----------|-----------|----------|
| `HTTP_PORT` (8081) | 80 | HTTP |
| `HTTPS_PORT` (8443) | 443 | HTTPS |

NGINX only listens on **443** when both of these files exist:

```text
docker/certs/<app>/fullchain.pem
docker/certs/<app>/privkey.pem
```

Those names are what DigitalOcean / Let's Encrypt already use (`fullchain.pem` + `privkey.pem`). Until they are present, the entrypoint logs `No TLS certs mounted; HTTP only`, port 8443 is mapped but nothing accepts TLS, and **http://localhost:8081** is the only working URL.

PEM files are gitignored. Only `.gitkeep` is committed under `docker/certs/`.

## Local HTTPS (self-signed)

Generate a localhost certificate, point Meteor at the HTTPS URL, then recreate the stack so NGINX reloads the certs:

```bash
npm run docker:certs -- nexus-govrn
```

Edit `docker/apps/nexus-govrn.env`:

```env
ROOT_URL=https://localhost:8443
```

Then:

```bash
npm run docker:up -- nexus-govrn
```

Open **https://localhost:8443**. The browser will warn because the cert is self-signed — continue anyway. HTTP on 8081 redirects to `https://localhost:8443`.

To replace an existing pair: `npm run docker:certs -- nexus-govrn --force`.

### Manual OpenSSL (if you prefer)

```bash
openssl req -x509 -nodes -newkey rsa:2048 \
  -keyout docker/certs/nexus-govrn/privkey.pem \
  -out docker/certs/nexus-govrn/fullchain.pem \
  -days 825 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

Then set `ROOT_URL` and run `npm run docker:up` as above.

## Production / DigitalOcean

Copy the server certificate and key into the app cert directory using those exact filenames:

```text
docker/certs/nexus-govrn/fullchain.pem
docker/certs/nexus-govrn/privkey.pem
```

Typical Let's Encrypt paths on the droplet:

```bash
cp /etc/letsencrypt/live/your.domain/fullchain.pem docker/certs/nexus-govrn/fullchain.pem
cp /etc/letsencrypt/live/your.domain/privkey.pem docker/certs/nexus-govrn/privkey.pem
```

Set public ports and the public URL in `docker/apps/nexus-govrn.env`:

```env
HTTP_PORT=80
HTTPS_PORT=443
ROOT_URL=https://your.domain
```

Then `npm run docker:up -- nexus-govrn`. HTTP on port 80 redirects to HTTPS on 443.
