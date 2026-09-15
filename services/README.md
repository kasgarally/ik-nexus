<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Non-JS services convention
-->
# Services

Python/Arelle XBRL containers, DevOps sidecars, and other non-JS tooling go here. Each service owns its own venv, Compose file, or lockfile.

## Contents

- [Not a pnpm member](#not-a-pnpm-member)
- [Meteor apps and shared JS](#meteor-apps-and-shared-js)

## Not a pnpm member

Do **not** add `services/` to [`pnpm-workspace.yaml`](../pnpm-workspace.yaml). That workspace is `packages/*` (shared JavaScript) only.

## Meteor apps and shared JS

- Meteor products: [`apps/`](../apps/nexus-govrn) — `meteor npm` per app
- Shared JS libs: [`packages/`](../packages/ui) — `pnpm install` at the repo root
