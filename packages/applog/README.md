<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Shared NEXUS application audit log
-->
# @nexus/applog

Append-only audit log for NEXUS Meteor apps: **who** created, updated, or removed **which** document, and **when**. This is not `meteor/logging` (server console) and not session replay (OpenReplay).

The collection name is fixed (`nexus_applog`), like `nexus_files`. There is no UI in this package.

## Contents

- [What this package owns](#what-this-package-owns)
- [Develop in this repo](#develop-in-this-repo)
- [Install in an app](#install-in-an-app)
- [registerWithMeteor](#registerwithmeteor)
- [registerCollection](#registercollection)
- [Applog.record](#applogrecord)
- [Document shape](#document-shape)
- [Redaction](#redaction)
- [Publication](#publication)
- [Actor kinds](#actor-kinds)
- [What this package does not do](#what-this-package-does-not-do)
- [Later: publish to npm](#later-publish-to-npm)

## What this package owns

- Metadata collection `nexus_applog` (append-only)
- `Applog.registerCollection` — wraps `insertAsync` / `updateAsync` / `removeAsync` on opted-in collections (not the deprecated sync `insert` / `update` / `remove`)
- `Applog.record` — domain events (export, approve, login, role change)
- `Applog.runAsSystem` — mark startup/seed writes as `actorKind: 'system'`
- Publication `applog.recent` for `superadmin` and `admin` only
- Client helper `Applog.subscribeRecent`

This package must **not** import `meteor/*`. The app injects Meteor APIs.

A failed audit insert is printed to the console and **does not** fail the business write.

## Develop in this repo

`@nexus/applog` is a pnpm workspace member (`packages/*` only). From the **repo root**:

```bash
pnpm install
```

Do not run `pnpm` inside `apps/`.

## Install in an app

```json
"@nexus/applog": "file:../../packages/applog"
```

Then `meteor npm install` in that app. Do not use `workspace:*`.

## registerWithMeteor

Call once on the client and once on the server (same split as `@nexus/files`):

```javascript
import { Applog } from '@nexus/applog'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { check, Match } from 'meteor/check'
import { Roles } from 'meteor/roles'

Applog.registerWithMeteor({ Meteor, Mongo, check, Match, Roles })
```

Calling it twice throws.

## registerCollection

Server only (no-op wrap on the client). After `registerWithMeteor`:

```javascript
Applog.registerCollection({
  name: 'risks',
  collection: Risks,
  redactKeys: ['secretNote'],
})
```

`name` is stored on each audit row. Extra `redactKeys` are merged with the package defaults.

The collection must expose `findOneAsync`, `insertAsync`, `updateAsync`, and `removeAsync`. Only those write methods are wrapped. Sync `insert` / `update` / `remove` are not audited and must not be used.

Do not register `nexus_applog` itself.

## Applog.record

For events that are not a collection write:

```javascript
await Applog.record({
  action: 'export',
  collection: 'risks',
  docId,
  document: snapshot,
})
```

`action` is a non-empty string (`create` / `update` / `remove` are reserved for wrappers; custom values are allowed).

## Document shape

| Field | Meaning |
|-------|---------|
| `createdAt` | Server timestamp |
| `actorId` | `Meteor.userId()` or `null` |
| `actorKind` | `user`, `anonymous`, or `system` |
| `action` | `create`, `update`, `remove`, or a custom string |
| `collection` | Registered name |
| `docId` | Target document id |
| `fields` | On **update** only: `{ key, before, after }` for changed keys |
| `document` | Redacted new doc on **create**, last doc on **remove**. Omitted on update. |

## Redaction

Default keys stripped from snapshots and diffs: `password`, `bcrypt`, `token`, `services`, `resume`. Add more per collection via `redactKeys`.

Modifiers (`$set`, …) are never stored. The wrapper loads before/after documents and diffs top-level fields.

A multi-document write is capped at 100 audited rows.

## Publication

`applog.recent` accepts `{ limit, collection, docId }`. Limit defaults to 50 (max 200).

Only `Roles.userIsInRoleAsync(userId, ['superadmin', 'admin'])` receives rows. Until those roles exist in the app, the publication is empty.

```javascript
Applog.subscribeRecent({ collection: 'nexus_files', limit: 50 })
```

Client inserts/updates/removes on `nexus_applog` are denied.

## Actor kinds

| Kind | When |
|------|------|
| `user` | `Meteor.userId()` is set |
| `anonymous` | Method/write with no user (for example anonymous file upload) |
| `system` | Code inside `Applog.runAsSystem(() => …)` (seeds, migrations) |

## What this package does not do

- Server console logging (`meteor/logging`)
- Session replay or product analytics (OpenReplay)
- An audit UI
- Retention deletes (v1 is append-only forever)
- Tests until someone asks for them

## Later: publish to npm

Keep the `@nexus/applog` import. Change the app dependency from `file:../../packages/applog` to a version.
