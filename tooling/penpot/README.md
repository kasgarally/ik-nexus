<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Local Penpot design and MCP tooling
-->
# Penpot design tooling

Penpot is a design workspace for NEXUS UI/UX work. This local-only stack is development tooling, not part of a Meteor product or its production deployment.

## Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [First start](#first-start)
- [Commands](#commands)
- [Local accounts and email](#local-accounts-and-email)
- [Persistence and reset](#persistence-and-reset)
- [Back up and restore](#back-up-and-restore)
  - [Create a backup](#create-a-backup)
  - [Restore a backup](#restore-a-backup)
- [Export and import design files](#export-and-import-design-files)
- [Connect Cursor through MCP](#connect-cursor-through-mcp)
  - [Generate the Penpot MCP key](#generate-the-penpot-mcp-key)
  - [Configure Cursor](#configure-cursor)
  - [Connect a design file](#connect-a-design-file)
- [Upgrade](#upgrade)
- [Windows and browser notes](#windows-and-browser-notes)
- [Troubleshooting](#troubleshooting)
- [Security boundaries](#security-boundaries)
- [Official references](#official-references)

## Architecture

[`docker-compose.yml`](docker-compose.yml) follows Penpot's official Compose topology:

- frontend and reverse proxy at `http://localhost:9001`
- backend API
- integrated MCP server
- exporter
- PostgreSQL 15
- Valkey 8.1
- development SMTP catcher at `http://localhost:1080`

Only the two HTTP endpoints bind to the host, and both bind to `127.0.0.1`. Database, Valkey, backend, exporter, and MCP container ports stay inside the `penpot` Docker network.

Penpot services are pinned to `2.17.2`. The stack is independent of the Meteor image and Compose runner under [`../../docker/`](../../docker/README.md).

## Prerequisites

- Docker Desktop with Linux containers and Docker Compose
- Node.js supported by this repository
- pnpm from the repository root
- enough Docker disk for PostgreSQL, uploaded assets, and image layers

Start Docker Desktop before running these commands.

## First start

From the repository root:

```bash
pnpm penpot:init
pnpm penpot:up
```

`penpot:init` creates `tooling/penpot/.env` with random database and 512-bit application secrets. The file is gitignored. Running it again preserves the existing file and therefore preserves active sessions.

`penpot:up` starts the stack in the background and waits for `http://localhost:9001`. Open that URL, register a local account, and create a team, project, and design file.

## Commands

```bash
pnpm penpot:init
pnpm penpot:up
pnpm penpot:down
pnpm penpot:restart
pnpm penpot:logs
pnpm penpot:ps
pnpm penpot:pull
pnpm penpot:backup
```

The general command accepts the same action:

```bash
pnpm penpot -- ps
```

`penpot:logs` follows logs until `Ctrl+C`. `penpot:pull` only refreshes the versions pinned in `.env`; it does not silently upgrade the version.

## Local accounts and email

Email/password registration is enabled by Penpot's default configuration. This localhost stack disables email verification and secure session cookies because it uses HTTP. Do not reuse it as an internet-facing deployment.

Penpot sends development email to Mailcatcher. Inspect messages at `http://localhost:1080`; no email leaves the machine.

## Persistence and reset

Working data survives container recreation in two named Docker volumes:

- `nexus-penpot-postgres` — users, teams, projects, file data, and metadata
- `nexus-penpot-assets` — images, SVG clips, fonts, and other uploaded assets

Stop without deleting data:

```bash
pnpm penpot:down
```

Permanently erase both volumes and start from an empty instance:

```bash
pnpm penpot -- down --volumes
```

The reset is destructive. A `.penpot` milestone export does not contain accounts, teams, or every file in the instance.

## Back up and restore

### Create a backup

Keep the stack running, then run:

```bash
pnpm penpot:backup
```

The command creates a timestamped, gitignored directory under `tooling/penpot/backups/` containing:

- `database.dump` — PostgreSQL custom-format dump
- `assets.tar.gz` — matching asset-volume archive

Keep both files together. Copy important backup sets outside this repository and Docker Desktop.

### Restore a backup

Restoration replaces current local data. Stop Penpot and preserve a separate backup first. Start only PostgreSQL, copy the dump into it, restore the database, then restore the matching assets archive:

```powershell
docker compose --project-directory tooling/penpot --file tooling/penpot/docker-compose.yml --env-file tooling/penpot/.env up --detach penpot-postgres
docker compose --project-directory tooling/penpot --file tooling/penpot/docker-compose.yml --env-file tooling/penpot/.env cp tooling/penpot/backups/<timestamp>/database.dump penpot-postgres:/tmp/database.dump
docker compose --project-directory tooling/penpot --file tooling/penpot/docker-compose.yml --env-file tooling/penpot/.env exec -T penpot-postgres pg_restore --clean --if-exists --no-owner --username=penpot --dbname=penpot /tmp/database.dump
docker run --rm --volume nexus-penpot-assets:/target --volume "${PWD}/tooling/penpot/backups/<timestamp>:/backup:ro" alpine:3.22 sh -c "rm -rf /target/* /target/.[!.]* /target/..?*; tar -xzf /backup/assets.tar.gz -C /target"
pnpm penpot:up
```

Replace `<timestamp>` with one backup directory name. The asset command is intentionally explicit because it deletes the current asset volume before extracting the archive.

## Export and import design files

Named volumes are the working copy. Commit selected portable milestones under [`exports/`](exports/README.md):

1. From a Penpot dashboard file menu, choose **Download**.
2. Include linked shared libraries when they must remain linked.
3. Save the `.penpot` file under `tooling/penpot/exports/` using the documented name.
4. Review its size before committing.

To import, open the destination project menu, choose **Import files**, select one or more `.penpot` files (or a ZIP), review the detected files, and confirm. Penpot currently limits one import to 1 GB.

`.penpot` v3 is a ZIP containing JSON plus binary media. It is portable and inspectable, but Git cannot meaningfully merge it.

## Connect Cursor through MCP

The integrated MCP container is reached through the frontend:

```text
http://localhost:9001/mcp/stream?userToken=YOUR_MCP_KEY
```

The key is personal, shown once, expires, and is revoked immediately when regenerated. Never put the resolved URL in this repository.

### Generate the Penpot MCP key

1. Sign in at `http://localhost:9001`.
2. Open **Your account → Integrations → MCP Server**.
3. Enable MCP.
4. Generate the personal key and save it in an approved password manager.

### Configure Cursor

Add a remote HTTP MCP server named `penpot` in Cursor settings. Use the complete URL Penpot provides. Keep this user-specific configuration outside the repository because the query string contains the key.

Cursor must be restarted or its MCP servers refreshed after the configuration changes. Confirm that the Penpot tools appear before allowing writes.

### Connect a design file

1. Open exactly one Penpot design file in the browser.
2. Choose **File → MCP Server → Connect**.
3. Keep that tab and its MCP plugin active.
4. Start with a read-only request such as “List pages in this file.”
5. Ask for a description of intended changes before permitting design writes.

MCP follows the currently focused Penpot page. Disconnect the plugin or disable the integration to stop file operations.

## Upgrade

1. Read release and migration notes.
2. Run `pnpm penpot:backup`.
3. Change `PENPOT_VERSION` in both `.env.example` and local `.env`.
4. Run `pnpm penpot:pull`, then `pnpm penpot:up`.
5. Verify login, files, assets, export, and MCP.

Upgrade in small increments. Keep frontend, backend, exporter, and MCP on the same version.

## Windows and browser notes

- Docker Desktop must be running with Linux containers.
- Keep named volumes in Docker's Linux VM; do not bind-mount PostgreSQL onto NTFS.
- In Chrome, add `http://localhost:9001` to **Always keep these sites active**.
- In Edge, exclude the site from sleeping tabs.
- If Chromium blocks local network access for MCP, grant the requested local-network permission or try Firefox.
- Sleep or hibernation can pause Docker and disconnect the active MCP tab.

## Troubleshooting

- **Docker API/pipe missing:** start Docker Desktop and wait until the engine is ready.
- **Port 9001 or 1080 occupied:** stop the conflicting process or change the corresponding port and public URI in `.env`.
- **MCP reports no plugin:** focus the design tab and reconnect **File → MCP Server → Connect**.
- **MCP key rejected:** regenerate it in Penpot and replace the user-local Cursor URL.
- **MCP disconnects during long tasks:** prevent the browser tab from sleeping.
- **Startup fails:** run `pnpm penpot:logs`; confirm `.env` exists and all images use the same Penpot version.

## Security boundaries

- Local development only; ports bind to loopback.
- `.env`, MCP keys, database dumps, and asset backups are not committed.
- Telemetry is disabled.
- HTTP-only flags are unsafe for an internet-facing deployment.
- MCP can modify or delete the focused design. Begin read-only and keep milestone exports.

## Official references

- [Install Penpot with Docker](https://help.penpot.app/technical-guide/getting-started/docker/)
- [Penpot configuration](https://help.penpot.app/technical-guide/configuration/)
- [Penpot MCP server](https://help.penpot.app/mcp/)
- [Export and import files](https://help.penpot.app/user-guide/export-import/export-import-files/)
- [The `.penpot` file format](https://help.penpot.app/user-guide/export-import/penpot-file-format/)
