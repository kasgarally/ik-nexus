<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Manual Ubuntu droplet deploy for NEXUS Meteor apps
-->
# Manual deploy (Ubuntu on DigitalOcean)

Use this when a droplet must run a **Meteor app under `apps/` without Docker**: you install Node, MongoDB, NGINX, UFW, Certbot, and PM2 yourself. The preferred production path is still the [Compose stack](../docker/README.md). This guide is the bare-metal alternative.

The old NXGEN notes (Node 12/14, `mongo` shell, `/DATA/store`, secrets inside `ecosystem.config.js`) are obsolete. This document matches **ik-nexus in 2026**: Meteor **3.5.2**, Node **24**, Mongo **8** as a single-node replica set, uploads in **GridFS**, settings via **`METEOR_SETTINGS`**.

## Contents

- [App name](#app-name)
- [When to use this](#when-to-use-this)
- [What you install](#what-you-install)
- [Create the droplet](#create-the-droplet)
- [First login and OS baseline](#first-login-and-os-baseline)
  - [SSH keys and a sudo user](#ssh-keys-and-a-sudo-user)
  - [Swap, timezone, unattended upgrades](#swap-timezone-unattended-upgrades)
- [Firewall](#firewall)
  - [UFW](#ufw)
  - [DigitalOcean Cloud Firewall](#digitalocean-cloud-firewall)
  - [fail2ban](#fail2ban)
- [Node.js 24](#nodejs-24)
- [MongoDB](#mongodb)
  - [Install MongoDB 8 (Ubuntu 24.04)](#install-mongodb-8-ubuntu-2404)
  - [Single-node replica set](#single-node-replica-set)
  - [Users and authorization](#users-and-authorization)
  - [Data disk](#data-disk)
  - [Hosted Mongo instead](#hosted-mongo-instead)
- [NGINX reverse proxy](#nginx-reverse-proxy)
- [TLS with Certbot](#tls-with-certbot)
- [Build and place the Meteor bundle](#build-and-place-the-meteor-bundle)
  - [Why you cannot build on Windows for this droplet](#why-you-cannot-build-on-windows-for-this-droplet)
  - [Build on the droplet](#build-on-the-droplet)
  - [Build on another Linux host and scp](#build-on-another-linux-host-and-scp)
- [Runtime environment](#runtime-environment)
- [PM2](#pm2)
- [First-run settings](#first-run-settings)
- [Backups and restore](#backups-and-restore)
- [Redeploy](#redeploy)
- [Two apps on one droplet](#two-apps-on-one-droplet)
- [Operations](#operations)
- [What not to do](#what-not-to-do)

## App name

Every Meteor product is a folder under [`apps/`](../apps). That folder name is **`APP_NAME`**. It must match:

| Place | Path |
|-------|------|
| Source | `apps/$APP_NAME` |
| Docker stack (if you use it later) | `docker/apps/$APP_NAME.env` |
| Bundle on the droplet | `~/apps/$APP_NAME/bundle` |
| Runtime env | `~/etc/$APP_NAME.env` |
| Mongo database (usual convention) | `$APP_NAME` |
| PM2 process name | `$APP_NAME` |

The app in this repo today is **`nexus-govrn`**. Export it once per shell, then reuse the same commands for the next product:

```bash
export APP_NAME=nexus-govrn
export APP_HOST=app.example.com
```

## When to use this

| Path | Use it when |
|------|-------------|
| [`docker/README.md`](../docker/README.md) | You can run Docker Engine on the droplet. Same image, dual Mongo, settings injection. |
| **This guide** | Policy or habit requires apt-installed NGINX, `mongod`, PM2. |
| Atlas + this guide | You still want host NGINX/PM2 but not a local `mongod`. |
| Kubernetes / App Platform | Out of scope. |

Do not mix the two product paths on the same ports (80/443/27017) unless you know which process owns them.

## What you install

```mermaid
flowchart LR
  browser[Browser] -->|"443"| nginx[NGINX plus Certbot]
  nginx -->|"127.0.0.1:3000"| pm2[PM2 node main.js]
  pm2 -->|"MONGO_URL rs0"| mongo[mongod]
  env["0600 runtime.env"] --> pm2
```

| Piece | 2026 choice | Why |
|-------|-------------|-----|
| OS | Ubuntu **24.04 LTS** x86_64 | Current DigitalOcean LTS image. |
| Node | **24.x** from NodeSource | Meteor 3.5 bundles Node 24.15. Ubuntu’s own `nodejs` package is older. |
| Mongo | **8.0** Community, replica set `rs0` | Official `noble` packages. Meteor 3.5 change streams need Mongo 6+ **and** a replica set, not a standalone. The Compose stack still uses `mongo:7`; both are fine. |
| Shell | `mongosh` | The `mongo` binary is gone. |
| Files | GridFS (`nexus_fs.*`) | There is no host upload folder. A `mongodump` includes uploads. |
| Process manager | PM2, `watch: false` | Restart on crash and reboot. Secrets stay in an env file. |
| TLS | Certbot **snap** + Let’s Encrypt | 90-day certs, systemd timer for renew. |
| Firewall | UFW **and** a DO Cloud Firewall | Defence in depth. SSH before `ufw enable`. |

The Meteor process receives `MAIL_URL` / `TWILIO_*`. Set them when you need them; do not invent a second secrets file later.

## Create the droplet

In the DigitalOcean control panel:

1. **Ubuntu 24.04 LTS**, Regular CPU, **x86_64** (not the Docker image, not App Platform).
2. Size: **2 vCPU / 4 GB** is the floor. **8 GB** if you run `meteor build` on the droplet (the Docker builder sets a 4 GB Node heap).
3. Disk: SSD. For real data, attach **Block Storage** and put Mongo there. **Spaces is object storage** — do not use it as `mongod` `--dbpath`.
4. Add **your SSH public key** at create time. Do not rely on a root password.
5. Hostname such as `$APP_NAME-prod`. Note the public IPv4.
6. Optional: reserved IP, monitoring agent, backups (these are droplet snapshots — still take `mongodump`).

In DNS (wherever the zone lives), create an **A** record for `$APP_HOST` → the droplet IP. Wait until it resolves before Certbot.

## First login and OS baseline

```bash
ssh root@YOUR.DROPLET.IP
```

If you only have a password, add a key immediately and disable password SSH after the sudo user works.

```bash
apt update && apt upgrade -y
apt install -y sudo curl ca-certificates gnupg ufw fail2ban unattended-upgrades \
  software-properties-common htop unzip
```

### SSH keys and a sudo user

Do not operate as `root`. Do not grant `ALL=(ALL:ALL) ALL` in a hand-edited sudoers file — the `sudo` group is enough.

```bash
adduser --disabled-password --gecos "NEXUS deploy" nexus
usermod -aG sudo nexus
mkdir -p /home/nexus/.ssh
cp /root/.ssh/authorized_keys /home/nexus/.ssh/authorized_keys
chown -R nexus:nexus /home/nexus/.ssh
chmod 700 /home/nexus/.ssh
chmod 600 /home/nexus/.ssh/authorized_keys
```

Test a **second** terminal as `nexus` before you lock root:

```bash
ssh nexus@YOUR.DROPLET.IP
sudo -v
```

Then harden SSH (`/etc/ssh/sshd_config.d/99-nexus.conf`):

```text
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
```

```bash
sudo sshd -t && sudo systemctl reload ssh
```

### Swap, timezone, unattended upgrades

A 4 GB droplet should have swap so `meteor build` or `mongod` does not get OOM-killed.

```bash
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo timedatectl set-timezone UTC
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Firewall

Open **22 / 80 / 443** only. Mongo (**27017**) and Meteor (**3000**, or whichever `PORT` you chose) stay on localhost.

### UFW

Allow SSH **before** enabling, or you lock yourself out.

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
sudo ufw status numbered
```

`sudo ufw delete 3` removes a rule by number if you add a mistake.

### DigitalOcean Cloud Firewall

Create a firewall in the panel attached to this droplet: inbound TCP 22, 80, 443 from `0.0.0.0/0` and `::/0` (or lock 22 to your office / VPN CIDR). Outbound: allow all. This still applies if someone stops UFW.

### fail2ban

```bash
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

Default `sshd` jail is enough to start. Do not open Mongo or PM2 to the world “so Compass works” — use an SSH tunnel:

```bash
ssh -L 27017:127.0.0.1:27017 nexus@YOUR.DROPLET.IP
```

## Node.js 24

Ubuntu 24.04’s archive Node is not Meteor 3.5. Use NodeSource (deb822 `nodistro` repo). **Do not use nvm** for this host: PM2’s systemd unit will not see `~/.nvm`.

```bash
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_24.x -o /tmp/nodesource_setup.sh
sudo -E bash /tmp/nodesource_setup.sh
sudo apt install -y nodejs
node -v    # v24.x
npm -v
```

If `apt update` reports “File has unexpected size” on the NodeSource mirror, wait and retry — that is a sync glitch, not a wrong version.

Confirm the ABI later when you `npm ci` inside `bundle/programs/server`. Native addons built for Node 18/22 will not load on 24.

## MongoDB

Meteor 3.5 defaults to **change streams**. A standalone `mongod` is the wrong topology (and has caused tight retry loops on 3.5). Run a **replica set**, even with one member.

### Install MongoDB 8 (Ubuntu 24.04)

Use the official **Noble** packages. Do not install Ubuntu’s `mongodb` metapackage — it conflicts with `mongodb-org`.

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc \
  | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor

echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" \
  | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

sudo apt update
sudo apt install -y mongodb-org
sudo systemctl enable mongod
```

Pin if you want to avoid a surprise minor jump:

```bash
sudo apt-mark hold mongodb-org mongodb-org-database mongodb-org-server \
  mongodb-org-mongos mongodb-org-tools
```

### Single-node replica set

Edit `/etc/mongod.conf`:

```yaml
# Author: Karmil Asgarally - INTELLEKTRA © 2026
net:
  port: 27017
  bindIp: 127.0.0.1

storage:
  dbPath: /var/lib/mongodb

replication:
  replSetName: rs0

# Leave security.authorization off until the replica is PRIMARY and users exist.
```

```bash
sudo systemctl restart mongod
mongosh --eval 'rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "127.0.0.1:27017" }] })'
mongosh --eval 'rs.status()'
```

Wait until the member is `PRIMARY`. The Compose helper [`docker/mongo/init-replica.js`](../docker/mongo/init-replica.js) does the same thing for `mongo:7`.

One `mongod` can hold several app databases. Give each Meteor app its own database name (usually `$APP_NAME`) and its own user.

### Users and authorization

Create users **after** `rs0` is PRIMARY, **before** you turn authorization on. Use long random passwords (password manager). URL-encode reserved characters in `MONGO_URL`.

```javascript
// mongosh — replace APP_NAME (example: nexus-govrn)
use admin
db.createUser({
  user: 'mongoAdmin',
  pwd: passwordPrompt(),
  roles: [{ role: 'root', db: 'admin' }],
})

use APP_NAME
db.createUser({
  user: 'nexus_app',
  pwd: passwordPrompt(),
  roles: [{ role: 'readWrite', db: 'APP_NAME' }],
})
```

Then in `/etc/mongod.conf`:

```yaml
security:
  authorization: enabled
```

```bash
sudo systemctl restart mongod
mongosh "mongodb://mongoAdmin@127.0.0.1:27017/admin?replicaSet=rs0"
```

Useful later (always against the right database):

```javascript
use APP_NAME
db.getUsers()
db.changeUserPassword('nexus_app', passwordPrompt())
db.dropUser('nexus_app')   // only if replacing the app user
```

`MONGO_URL` for that Meteor app:

```text
mongodb://nexus_app:ENCODED_PASSWORD@127.0.0.1:27017/APP_NAME?replicaSet=rs0&authSource=APP_NAME
```

### Data disk

Default dbpath is `/var/lib/mongodb` (all databases on this `mongod`). For Block Storage:

```bash
sudo systemctl stop mongod
sudo rsync -aHAX /var/lib/mongodb/ /mnt/mongo/data/
# point storage.dbPath at /mnt/mongo/data and fix ownership (mongodb:mongodb)
sudo systemctl start mongod
```

Spaces, S3, or a CIFS/SMB share is **not** a WiredTiger filesystem.

### Hosted Mongo instead

Set `MONGO_URL` to an Atlas (or other) replica URI, do not install `mongodb-org`, and skip the local replica. Atlas **replaces** local Mongo; it does not sit beside it. Same rule as the Compose `local-mongo` profile.

## NGINX reverse proxy

Meteor listens on **127.0.0.1:$PORT** (default **3000**). Browsers hit NGINX on 80/443. DDP needs WebSockets; `X-Forwarded-Proto` must be the public scheme or Meteor will generate `http://` URLs behind TLS.

```bash
sudo apt install -y nginx
sudo cp /path/to/ik-nexus/deploy/nginx/meteor-map.conf /etc/nginx/conf.d/meteor-map.conf
sudo cp /path/to/ik-nexus/deploy/nginx/meteor-app.conf /etc/nginx/sites-available/$APP_NAME
```

Edit `server_name` to `$APP_HOST` (and the `upstream` port if `PORT` is not 3000). Then:

```bash
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/$APP_NAME
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

[`deploy/nginx/meteor-app.conf`](nginx/meteor-app.conf) sets `client_max_body_size 26m` (`@nexus/files` default is 25 MB) and the same upgrade map the Docker NGINX image uses. Do not copy the old `Connection 'upgrade'` on every request.

## TLS with Certbot

Certbot on Ubuntu is installed with **snap**, not apt.

```bash
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d "$APP_HOST"
sudo certbot renew --dry-run
```

HTTP-01 needs port 80 reachable from the internet and a matching A record. Certbot writes `fullchain.pem` / `privkey.pem` under `/etc/letsencrypt/live/<name>/` and a systemd timer renews them. After renew, NGINX is reloaded automatically if the plugin is in use.

`ROOT_URL` must be `https://$APP_HOST` (no `:443`, no trailing path).

## Build and place the Meteor bundle

The runtime is **`node main.js`** on a `meteor build` bundle. It is not `meteor run` and it is not a copy of your laptop `node_modules`.

Apps depend on `file:../../packages/*`. Build from a checkout that contains **`apps/$APP_NAME` and `packages/`**.

### Why you cannot build on Windows for this droplet

A Windows `meteor build` targets Windows native addons. This droplet is Linux x86_64. That is why the Docker image runs `meteor build` inside Linux. For a manual deploy, build on **Linux** (this droplet, a Linux CI runner, or WSL2 only if you accept that as “good enough” and then `npm ci` again on the droplet).

```bash
# from apps/$APP_NAME on a Linux machine
meteor npm ci
node ../../scripts/build-settings.mjs   # writes settings.json locally; do not ship it with secrets
meteor build --directory /tmp/${APP_NAME}-build --server-only=false
# output: /tmp/${APP_NAME}-build/bundle
```

Do **not** pass `--server-only`. The Vue client must be in the bundle (same rule as [`docker/Dockerfile`](../docker/Dockerfile)).

### Build on the droplet

Install the Meteor CLI as `nexus` (not root). Pin the release to the app’s [`.meteor/release`](../apps/nexus-govrn/.meteor/release) (currently **3.5.2**):

```bash
curl https://install.meteor.com/?release=3.5.2 | sh
export PATH="$HOME/.meteor:$PATH"
```

Clone the repo (deploy key or HTTPS with a token you do not commit):

```bash
sudo apt install -y git
mkdir -p ~/src ~/apps/$APP_NAME
git clone git@github.com:YOUR_ORG/ik-nexus.git ~/src/ik-nexus
cd ~/src/ik-nexus
# host pnpm is only required if you change packages/* on this box
cd apps/$APP_NAME
meteor npm ci
meteor build --directory ~/apps/$APP_NAME
cd ~/apps/$APP_NAME/bundle/programs/server
npm ci
```

Need RAM: 4–8 GB plus swap. `TOOL_NODE_FLAGS=--max-old-space-size=4096` if the build OOMs.

### Build on another Linux host and scp

```bash
# on the Linux build host, after meteor build --directory ...
tar -C /tmp/${APP_NAME}-build -czf /tmp/${APP_NAME}-bundle.tgz bundle

scp /tmp/${APP_NAME}-bundle.tgz nexus@${APP_HOST}:~/
ssh nexus@${APP_HOST}
mkdir -p ~/apps/$APP_NAME
tar -C ~/apps/$APP_NAME -xzf ~/${APP_NAME}-bundle.tgz
cd ~/apps/$APP_NAME/bundle/programs/server
npm ci
```

Name tarballs with a UTC stamp (`$APP_NAME-20260919T1200Z.tgz`) so you can roll back.

## Runtime environment

Create a **gitignored** file on the server. Do not put keys in [`deploy/pm2/ecosystem.config.cjs`](pm2/ecosystem.config.cjs). Historical NXGEN `ecosystemprd.config.js` files that listed live SendGrid and Twilio values are **leaked** — rotate those credentials if they were ever used.

```bash
mkdir -p ~/etc
cp ~/src/ik-nexus/deploy/env/meteor-app.env.example ~/etc/${APP_NAME}.env
chmod 600 ~/etc/${APP_NAME}.env
nano ~/etc/${APP_NAME}.env
```

Required keys (see [`deploy/env/meteor-app.env.example`](env/meteor-app.env.example)):

| Variable | Role |
|----------|------|
| `ROOT_URL` | Public `https://` URL. Must match the certificate and NGINX `server_name`. |
| `PORT` | `3000` unless this host already uses that port. NGINX proxies here. |
| `MONGO_URL` | Local replica or Atlas. Include `replicaSet` for a self-hosted set. |
| `METEOR_SETTINGS` | One line of JSON. `public.devSeedAdmin` and `public.devSeedUsers` must be `false` or omitted. |
| `MAIL_URL` | SMTP (`smtps://…`) when you enable mail. |
| `TWILIO_*` | SMS when you enable it. |

Generate `METEOR_SETTINGS` on a machine that has the repo (do not minify by hand):

```bash
node -e "import { readSettingsJsonc } from './scripts/build-settings.mjs'; process.stdout.write(JSON.stringify(readSettingsJsonc('apps/' + process.env.APP_NAME + '/settings.jsonc')))"
```

Paste that string as the value. Node 24’s `--env-file` (used by PM2 below) does not interpolate `$`.

## PM2

```bash
sudo npm install -g pm2
cd ~/src/ik-nexus
NEXUS_APP_NAME=$APP_NAME \
NEXUS_APP_ROOT=$HOME/apps/$APP_NAME \
NEXUS_ENV_FILE=$HOME/etc/${APP_NAME}.env \
  pm2 start deploy/pm2/ecosystem.config.cjs
pm2 status
pm2 logs $APP_NAME --lines 80
```

The ecosystem file runs `node --env-file=… main.js` from `~/apps/$APP_NAME/bundle`. `watch` is **off**. Clustering (`instances: max`) is not used — Meteor is one process per `MONGO_URL` unless you have designed for it.

Survive reboot (as `nexus`, then the printed `sudo` command):

```bash
pm2 startup systemd -u nexus --hp /home/nexus
pm2 save
```

Daily commands:

```bash
pm2 restart $APP_NAME
pm2 stop $APP_NAME
pm2 delete $APP_NAME
pm2 unstartup systemd   # only if you are removing the host
```

Smoke-test without PM2 (debug only):

```bash
cd ~/apps/$APP_NAME/bundle
node --env-file=$HOME/etc/${APP_NAME}.env main.js
```

## First-run settings

Production `apps/$APP_NAME/settings.jsonc` must **not** enable `public.devSeedAdmin` or `public.devSeedUsers`. Apps that use `@nexus/setup` send the first operator to `/onboarding` (`setup.complete`). Demo `admin@localhost` and extra `@localhost` users are for local `meteor reset` only.

Confirm from the droplet (this prints **keys**, not values):

```bash
pm2 show $APP_NAME | sed -n '/env:/,$p'
node --env-file=$HOME/etc/${APP_NAME}.env -e "console.log(Object.keys(process.env).filter(k => /MONGO|MAIL|TWILIO|METEOR|ROOT|PORT/.test(k)).sort().join('\n'))"
```

Do not paste secret values into tickets, chats, or this repo.

Open `https://$APP_HOST`. Complete setup. Create a real admin password.

## Backups and restore

Two layers:

1. **Mongo** — `mongodump` of that app’s database (collections **and** `nexus_fs.files` / `nexus_fs.chunks` when the app uses `@nexus/files`).
2. **Off-box copy** — scp or rclone the `.tar.gz` to another region or to Spaces. Spaces is appropriate for **archives**, not for live WiredTiger files.

```bash
chmod u+x ~/src/ik-nexus/deploy/scripts/backup.sh ~/src/ik-nexus/deploy/scripts/restore.sh
NEXUS_APP_NAME=$APP_NAME NEXUS_ENV_FILE=$HOME/etc/${APP_NAME}.env \
  ~/src/ik-nexus/deploy/scripts/backup.sh
```

Cron (daily 02:15 UTC):

```cron
15 2 * * * NEXUS_APP_NAME=nexus-govrn NEXUS_ENV_FILE=/home/nexus/etc/nexus-govrn.env /home/nexus/src/ik-nexus/deploy/scripts/backup.sh >> /home/nexus/backups/backup.log 2>&1
```

Restore (stops writes; do this during a window):

```bash
pm2 stop $APP_NAME
NEXUS_APP_NAME=$APP_NAME ~/src/ik-nexus/deploy/scripts/restore.sh \
  ~/backups/$APP_NAME/$APP_NAME-YYYYMMDDTHHMMSSZ.tar.gz
pm2 start $APP_NAME
```

`--drop` in the restore script replaces existing collections. Edit the scripts on Linux (or `sed -i 's/\r$//'`) so you do not hit `^M` / `$'\r'` from a Windows checkout.

Droplet snapshots are not a substitute for `mongodump` if you need a consistent logical backup.

## Redeploy

1. Build a new Linux bundle (or `git pull` and `meteor build` on the droplet).
2. Keep the previous `~/apps/$APP_NAME/bundle` as `bundle.prev`.
3. Extract the new bundle, `npm ci` in `programs/server`.
4. Refresh `METEOR_SETTINGS` if `settings.jsonc` changed.
5. `pm2 restart $APP_NAME`.
6. `pm2 logs` and hit `/` over HTTPS.

Rollback: point the directory back to `bundle.prev` and restart.

## Two apps on one droplet

Duplicate [`deploy/nginx/meteor-app.conf`](nginx/meteor-app.conf) with a different `server_name` and `upstream` port. Run the second Meteor on another `PORT` in its own `~/etc/$APP_NAME.env` and a second `NEXUS_APP_NAME=… pm2 start`. Issue a **second** certificate (`certbot --nginx -d other.example.com`) after the new server block exists.

Do not share one Mongo database between products unless that is an explicit design. Do not reuse the same PM2 `name`. The WebSocket `map` in [`meteor-map.conf`](nginx/meteor-map.conf) is installed once.

## Operations

| Check | Command |
|-------|---------|
| App process | `pm2 status` |
| App logs | `pm2 logs $APP_NAME --lines 100` |
| NGINX | `sudo nginx -t` · `sudo journalctl -u nginx -e` |
| Mongo | `sudo systemctl status mongod` · `mongosh "$MONGO_URL" --eval 'db.adminCommand({ ping: 1 })'` |
| Disk | `df -h` · `sudo du -sh /var/lib/mongodb` |
| Cert | `sudo certbot certificates` |
| Listening | `ss -lntp` — 80/443 public; app `PORT` and 27017 on `127.0.0.1` |

## What not to do

- Do not commit `~/etc/$APP_NAME.env`, PEMs, or a PM2 file that lists live `MAIL_URL` / `TWILIO_*` / Mongo passwords.
- Do not enable `public.devSeedAdmin` or `public.devSeedUsers` on a public `ROOT_URL`.
- Do not bind `mongod` to `0.0.0.0` or publish 27017 on UFW.
- Do not point `dbPath` at DigitalOcean Spaces.
- Do not `ufw enable` before `ufw allow OpenSSH`.
- Do not run `meteor run` or `insecure` in production.
- Do not `watch: true` in PM2 on a production bundle.
- Do not skip `npm ci` inside `bundle/programs/server` after a new tarball.
- Do not treat a droplet snapshot as the only backup.
- Do not put Penpot or other tooling Compose stacks on this public droplet.
