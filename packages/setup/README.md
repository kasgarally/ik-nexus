<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
First-run install record for NEXUS Meteor apps
-->
# @nexus/setup

One-shot first-run record for a NEXUS Meteor app. Completing setup writes a singleton `nexus_setup` document (`_id: 'current'`), creates the first password user, and grants `superadmin` / `admin`.

Company fields live here, not in Meteor settings. The password is never stored on this document.

## Contents

- [What this package owns](#what-this-package-owns)
- [Develop in this repo](#develop-in-this-repo)
- [Install in an app](#install-in-an-app)
- [registerWithMeteor](#registerwithmeteor)
- [Document shape](#document-shape)
- [DDP methods](#ddp-methods)
- [Publications](#publications)
- [Images](#images)
- [Testing](#testing)
- [What this package does not do](#what-this-package-does-not-do)
- [Later: publish to npm](#later-publish-to-npm)

## What this package owns

- Metadata collection `nexus_setup` (one document)
- DDP methods `setup.complete` / `setup.isComplete` / `setup.update`
- Publications `setup.public` (branding) and `setup.current` (admin company fields)
- Client helpers `Setup.complete`, `Setup.isComplete`, `Setup.update`, `Setup.subscribePublic`, `Setup.subscribeCurrent`, `Setup.loginWithPassword`

This package must **not** import `meteor/*`. The app injects Meteor APIs.

Writes use Meteor 3 `insertAsync` / `findOneAsync`. `find()` stays for the publication cursor.

## Develop in this repo

`@nexus/setup` is a pnpm workspace member (`packages/*` only). From the **repo root**:

```bash
pnpm install
```

Do not run `pnpm` inside `apps/`.

## Install in an app

```json
"@nexus/setup": "file:../../packages/setup"
```

Then `meteor npm install` in that app. Do not use `workspace:*`.

## registerWithMeteor

Call once on the client and once on the server (same split as `@nexus/files`), **before** `@nexus/applog` registers collections:

```javascript
import { Applog } from '@nexus/applog'
import { Setup } from '@nexus/setup'
import { Accounts } from 'meteor/accounts-base'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { check, Match } from 'meteor/check'
import { Roles } from 'meteor/roles'

Setup.registerWithMeteor({
  Meteor,
  Mongo,
  check,
  Match,
  Roles,
  Accounts,
  runAsSystem: Applog.runAsSystem, // optional; first-run insert is audited as SYSTEM
})
```

Calling it twice throws. Client inserts/updates/removes on `nexus_setup` are denied.

## Document shape

| Field | Meaning |
|-------|---------|
| `_id` | Always `'current'` |
| `companyName` | Required |
| `legalName` / `website` / `phone` / `email` | Optional strings |
| `address` | `{ line1, line2, city, region, postalCode, country }` |
| `logoDataUrl` / `iconDataUrl` | Optional image data URLs |
| `installedAt` | Set once on complete |
| `meteorRelease` / `nodeVersion` | Server snapshot at complete |
| `firstAdminUserId` | The user created by `setup.complete` |
| `createdAt` / `updatedAt` | Server timestamps |

## DDP methods

| Method | Who | Notes |
|--------|-----|-------|
| `setup.complete` | Anyone, only if no document | Validates payload, creates the first user, inserts the singleton. Second call throws `setup-already-complete`. |
| `setup.isComplete` | Anyone | `{ complete: boolean }` |
| `setup.update` | `superadmin` / `admin` | Company, address, and branding only. Never writes `admin`, `firstAdminUserId`, `installedAt`, or system snapshots. Empty logo/icon strings `$unset` those fields. Throws `setup-not-complete` if the singleton is missing. |

```javascript
await Setup.complete({
  companyName: 'Acme',
  address: { city: 'Port Louis' },
  admin: { name: 'Ada', email: 'ada@example.com', password: 'long-enough' },
})
```

## Publications

`setup.public` needs no login. It projects only `companyName`, `logoDataUrl`, and `iconDataUrl`.

`setup.current` is `superadmin` / `admin` only. It adds `legalName`, `website`, `phone`, `email`, `address`, `installedAt`, and `updatedAt`. `firstAdminUserId`, `meteorRelease`, and `nodeVersion` stay off DDP.

```javascript
Setup.subscribePublic()
Setup.subscribeCurrent()
await Setup.update({ companyName: 'Acme', address: { city: 'Port Louis' } })
```

## Images

Logo and icon are **data URLs**, not GridFS. The method rejects non-image prefixes and payloads over 400 KB (logo) or 100 KB (icon). The UI reads a `File` with `FileReader.readAsDataURL`.

## Testing

From the repo root: `pnpm --filter @nexus/setup test`. Suite lives in `tests/`. See [`TESTING.md`](../../TESTING.md).

## What this package does not do

- Re-opening the wizard after complete (admins edit through `setup.update` / `NSetupForm`)
- Collection2 / SimpleSchema
- License server
- GridFS for logo or icon

## Later: publish to npm

Keep the `@nexus/setup` import. Change the app dependency from `file:../../packages/setup` to a version.
