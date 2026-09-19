<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Developer guides for NEXUS Meteor apps
-->
# Developer guides

Long-form design docs for how a Meteor product uses the `@nexus/*` packages. Start at the architecture hub. API details stay in each package README. Install and injection stay in [`PACKAGES.md`](../PACKAGES.md).

## Contents

- [Architecture](#architecture)
- [Related contracts](#related-contracts)

## Architecture

| Document | Concern |
|----------|---------|
| [Meteor app architecture](architecture/_Architecture.md) | How a product is assembled; table of contents for every concern |
| [Locales](architecture/locales.md) | UI chrome vs stored maps; leftover keys |
| [Translatable fields](architecture/translatable-fields.md) | Map widgets, translate method |
| [Lists](architecture/lists.md) | `nexus_lists` codes and titles |
| [@nexus/ui](architecture/ui.md) | `N` prefix, inject, i18n, widgets |
| [Files](architecture/files.md) | GridFS, owners, upload widgets |
| [Setup](architecture/setup.md) | First-run singleton and wizard |
| [Accounts](architecture/accounts.md) | Users, suspend, role catalogs |
| [Auth](architecture/auth.md) | Sign-in, password reset, optional TOTP, gated self-register |
| [Org](architecture/org.md) | Organisation tree and `profile.orgNodeId` |
| [Actions](architecture/actions.md) | Shared actions, status journals, assignee visibility |
| [Applog](architecture/applog.md) | Append-only audit |

## Related contracts

- [`PACKAGES.md`](../PACKAGES.md) — `registerWithMeteor`, `file:` installs, Rspack
- [`SECURITY.md`](../SECURITY.md) — DDP, roles, uploads, `locales.translate`
- [`apps/nexus-govrn/README.md`](../apps/nexus-govrn/README.md) — how to run GovRN
