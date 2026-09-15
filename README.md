<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
NEXUS platform overview
-->
# ik-nexus
NEXUS™ Platform

## Contents

- [Install worlds](#install-worlds)
- [Shared JS](#shared-js)
- [pnpm](#pnpm)
- [Meteor apps](#meteor-apps)
- [Services](#services)
- [Docker](#docker)

## Install worlds

This repo has three isolated install trees. Do not put Meteor apps or `services/` in the pnpm workspace.

| World | Where | Install | Lockfile |
|-------|--------|---------|----------|
| Shared JS | [`packages/*`](packages/ui) | `pnpm install` at the repo root | [`pnpm-lock.yaml`](pnpm-lock.yaml) |
| Meteor apps | [`apps/*`](apps/nexus-govrn) | `meteor npm install` in that app | each app’s `package-lock.json` |
| Non-JS | [`services/`](services), [`docker/`](docker) | venv / Compose as needed | not pnpm |

## Shared JS

Reusable Vue components (`LocaleSelect`, `FileUpload`, `FileReplace`) and i18n bootstrap live in [`packages/ui`](packages/ui) (`@nexus/ui`). GridFS uploads live in [`packages/files`](packages/files) (`@nexus/files`). The pnpm workspace is **`packages/*` only** ([`pnpm-workspace.yaml`](pnpm-workspace.yaml)). Future JS libs (API clients, shared helpers) go here too.

```bash
pnpm install
```

Apps consume shared packages with `file:../../packages/ui` or `file:../../packages/files`, not `workspace:`. After a future npm publish, change that dep string only.

## pnpm

How to install the pinned tool, daily commands, filters, and what not to do: [`PNPM.md`](PNPM.md).

## Meteor apps

Each product under `apps/` keeps its own Vue / Vuetify / Meteor versions and runs `meteor npm` locally. See [nexus-govrn](apps/nexus-govrn).

## Services

Python/Arelle XBRL containers, DevOps sidecars, and other non-JS tooling live under [`services/`](services). They are not pnpm workspace members.

## Docker

Docker build, run, and TLS setup: [docker/README.md](docker/README.md). The Meteor image still uses `meteor npm ci` and `file:` — pnpm is host-only for `packages/*`.
