<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
NEXUS platform overview
-->
# ik-nexus

NEXUS™ is INTELLEKTRA’s Meteor 3 + Vue 3 platform (governance, ERP, and related products). This monorepo holds **shared JavaScript packages**, **Meteor product apps**, **non-JS services**, and isolated development tooling. All original work is proprietary: [INTELLEKTRA © 2026](LICENSE), author Karmil Asgarally.

Start here for orientation. The companion documents below are the detailed contracts (packages, pnpm, tests, security). Read those before changing install layout or access control.

## Contents

- [What this repository is](#what-this-repository-is)
- [Documentation](#documentation)
- [Install worlds](#install-worlds)
- [Shared JS](#shared-js)
- [Meteor apps](#meteor-apps)
- [Services](#services)
- [Docker](#docker)
- [Manual deploy](#manual-deploy)
- [Tooling](#tooling)
- [Testing](#testing)
- [Security](#security)
- [License](#license)

Companion documents (full guides, not sections of this file):

- [`PACKAGES.md`](PACKAGES.md) — what each `@nexus/*` package owns, why they must not import `meteor/*`, and how a Meteor app injects APIs and consumes `file:` libraries (Rspack, Docker, new packages).
- [`PNPM.md`](PNPM.md) — host pnpm 10 for `packages/*` only: install, filters, lockfile, and what not to do inside `apps/`.
- [`TESTING.md`](TESTING.md) — when tests are created, and the three layers (Vitest, Meteor mocha, Playwright).
- [`SECURITY.md`](SECURITY.md) — deny-by-default DDP, roles, uploads, secrets, TLS, and OWASP Top 10 mapped onto this stack.
- [`LICENSE`](LICENSE) — proprietary licence; all rights reserved to INTELLEKTRA.
- [`docker/README.md`](docker/README.md) — Compose stacks, the Meteor image, and TLS.
- [`deploy/README.md`](deploy/README.md) — manual Ubuntu droplet install for any Meteor app under `apps/` (NGINX, Mongo, UFW, PM2) when you are not using Docker.
- [`tooling/penpot/README.md`](tooling/penpot/README.md) — local Penpot design workspace, persistence, exports, backups, and integrated MCP.
- [`services/README.md`](services/README.md) — Python/Arelle and other non-JS tooling.
- [`apps/nexus-govrn/README.md`](apps/nexus-govrn/README.md) — how to run GovRN, settings, and the dev seed.

## What this repository is

Four isolated install trees share one git repo. That is deliberate: Meteor 3 does not consume a hoisted pnpm workspace, product apps pin Vue/Vuetify independently, and design tooling does not ship with a product.

| Tree | Path | You work on |
|------|------|-------------|
| Shared JS | [`packages/*`](packages/ui) | Reusable libraries imported as `@nexus/ui`, `@nexus/files`, `@nexus/applog`, `@nexus/lists`, `@nexus/setup` |
| Meteor products | [`apps/*`](apps/nexus-govrn) | One folder per Meteor app (`nexus-govrn` today). Each copies the same `file:` + `registerWithMeteor` pattern. |
| Non-JS | [`services/`](services), [`docker/`](docker) | XBRL/Arelle, product Compose, NGINX, Mongo bind mounts |
| Development tooling | [`tooling/`](tooling/penpot) | Local Penpot design workspace, exports, and MCP |

Cursor rules under [`.cursor/rules/`](.cursor/rules/) encode the same contracts for the agent: file headers, human-readable code, Meteor async APIs, testing protocol, README tables of contents, and [security / OWASP](.cursor/rules/security-owasp.mdc).

## Documentation

Use this table when you need the long form. This README stays short on purpose.

| Document | Read it when you need to… |
|----------|---------------------------|
| [`PACKAGES.md`](PACKAGES.md) | Understand package boundaries, `registerWithMeteor`, GovRN adapters, Rspack `symlinks: false`, or add a new `@nexus/*` library. |
| [`PNPM.md`](PNPM.md) | Install or pin pnpm, add a workspace dependency, or avoid mixing `pnpm` with `meteor npm`. |
| [`TESTING.md`](TESTING.md) | Add or run tests (only after a person asked), pick Vitest vs mocha vs Playwright, or find HTML reports. |
| [`SECURITY.md`](SECURITY.md) | Design a method, publication, upload, or setup flow; map a change to OWASP; handle secrets and TLS. |
| [`LICENSE`](LICENSE) | Confirm ownership (INTELLEKTRA, author Karmil Asgarally) and that this is not an open-source licence. |
| [`docker/README.md`](docker/README.md) | Build/run a stack, copy `packages/` into the image, or terminate TLS at NGINX. |
| [`deploy/README.md`](deploy/README.md) | Install a Meteor app (`apps/<name>`, e.g. nexus-govrn) on a DigitalOcean Ubuntu droplet without Docker. |
| [`tooling/penpot/README.md`](tooling/penpot/README.md) | Start Penpot, preserve or export designs, back up its data, or connect Cursor through MCP. |
| [`services/README.md`](services/README.md) | Add Python/Arelle or another sidecar that must **not** join the pnpm workspace. |
| [`apps/nexus-govrn/README.md`](apps/nexus-govrn/README.md) | Boot GovRN, author `settings.jsonc`, or reason about the first-run wizard vs `devSeedAdmin`. |
| Package READMEs | Call a public API: [ui](packages/ui/README.md), [files](packages/files/README.md), [applog](packages/applog/README.md), [lists](packages/lists/README.md), [setup](packages/setup/README.md). |

## Install worlds

Do not put Meteor apps, `services/`, or `tooling/` in the pnpm workspace.

| World | Where | Install | Lockfile |
|-------|--------|---------|----------|
| Shared JS | [`packages/*`](packages/ui) | `pnpm install` at the repo root | [`pnpm-lock.yaml`](pnpm-lock.yaml) |
| Meteor apps | [`apps/*`](apps/nexus-govrn) | `meteor npm install` in that app | each app’s `package-lock.json` |
| Non-JS | [`services/`](services), [`docker/`](docker) | venv / Compose as needed | not pnpm |
| Development tooling | [`tooling/*`](tooling/penpot) | Docker Compose via root scripts | not pnpm |

First-time host setup (example app `nexus-govrn`):

```bash
pnpm install
cd apps/nexus-govrn
meteor npm install
meteor npm start
```

If a previous `meteor npm start` was left running after the terminal closed, port 3000 stays occupied. Stop that Node listener with `pnpm run kill-port` (or `meteor npm run kill-port` from the app). Details: [`apps/nexus-govrn/README.md`](apps/nexus-govrn/README.md#stale-process-on-port-3000).

## Shared JS

Reusable Vue components (`NLocaleSelect`, `NFileUpload`, `NFileReplace`, `NSetupWizard`, `NListItemsEditor`, `NDatePicker`, `NTimePicker`, `NSettingsWorkspace`, `NAccountsRegister`) and i18n bootstrap live in [`packages/ui`](packages/ui) (`@nexus/ui`). Their `N` prefix identifies NEXUS components: import `NFileUpload` and use it as `<n-file-upload>`. GridFS uploads live in [`packages/files`](packages/files). Application audit lives in [`packages/applog`](packages/applog). Translatable select-list items live in [`packages/lists`](packages/lists). First-run install lives in [`packages/setup`](packages/setup). Account admin DDP lives in [`packages/accounts`](packages/accounts).

The pnpm workspace is **`packages/*` only** ([`pnpm-workspace.yaml`](pnpm-workspace.yaml)). Future JS libs (API clients, shared helpers) go here too. Python does not.

Apps consume those packages with `file:../../packages/<name>`, not `workspace:`. Meteor 3 cannot resolve `meteor/*` from an npm package, so files / applog / lists / setup **inject** Meteor APIs via `registerWithMeteor`. The full map — catalog, injection, GovRN adapters, Rspack, Docker, new-package checklist — is [`PACKAGES.md`](PACKAGES.md). Daily pnpm commands: [`PNPM.md`](PNPM.md).

## Meteor apps

Each product under `apps/` keeps its own Vue / Vuetify / Meteor versions and runs `meteor npm` locally. The app in tree today is [nexus-govrn](apps/nexus-govrn).

Author `settings.jsonc` in the app. The shared [`scripts/build-settings.mjs`](scripts/build-settings.mjs) strips comments and writes `settings.json` (gitignored). From an app directory: `node ../../scripts/build-settings.mjs`.

## Services

Python/Arelle XBRL containers, DevOps sidecars, and other non-JS tooling live under [`services/`](services). They are not pnpm workspace members.

## Docker

Docker build, run, and TLS setup: [docker/README.md](docker/README.md). The Meteor image still uses `meteor npm ci` and `file:` — pnpm is host-only for `packages/*`.

## Manual deploy

When a DigitalOcean Ubuntu droplet cannot run Compose, install NGINX, MongoDB, UFW, Certbot, and PM2 on the host and run a Linux `meteor build` bundle under PM2. The same steps apply to any folder under `apps/` (`APP_NAME`, e.g. `nexus-govrn`). Guide: [`deploy/README.md`](deploy/README.md). Prefer the Docker stack when you can use it.

## Tooling

Development-only tools live under [`tooling/`](tooling/penpot). Penpot runs as an isolated, localhost-only Compose stack for UI/UX design and integrated MCP; it is not included in Meteor images or product deployments. Start with [`tooling/penpot/README.md`](tooling/penpot/README.md).

## Testing

Three layers: Vitest for `packages/*`, Meteor mocha for app runtime (methods / HTTP / GridFS), Playwright for user-visible flows. Tests are not added during feature work unless a person asks. Commands, report paths, and CI: [`TESTING.md`](TESTING.md).

## Security

Access control is server-side (methods, publications, `collection.deny`). Readable helpers and OWASP controls are both required. Secrets stay out of git. Production TLS terminates at NGINX.

The contract: [`SECURITY.md`](SECURITY.md). Agent rules: [`.cursor/rules/security-owasp.mdc`](.cursor/rules/security-owasp.mdc).

## License

All original code, documentation, and configuration in this repository belong to **INTELLEKTRA © 2026**. Author: **Karmil Asgarally**. See [`LICENSE`](LICENSE) (proprietary; all rights reserved). Third-party dependencies keep their own licences.
