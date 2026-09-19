<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Shared NEXUS organisational tree
-->
# @nexus/org

Generic organisation tree for one Meteor app. Nodes have a free `type` string, a translatable `title` map, and an optional `parentId`. Users attach later via `Meteor.users.profile.orgNodeId` (`accounts.users.setOrg`). Lists stay for flat catalogs.

The collection name is fixed (`nexus_org`). The Vue manager is `NOrgTreeEditor` in `@nexus/ui` (GovRN: `/settings/org`).

## Contents

- [What this package owns](#what-this-package-owns)
- [Develop in this repo](#develop-in-this-repo)
- [Install in an app](#install-in-an-app)
- [registerWithMeteor](#registerwithmeteor)
- [Document shape](#document-shape)
- [DDP methods](#ddp-methods)
- [Publication](#publication)
- [Tree helpers](#tree-helpers)
- [What this package does not do](#what-this-package-does-not-do)

## What this package owns

- Collection `nexus_org`
- DDP methods `org.insert` / `org.update` / `org.remove` (`superadmin` / `admin`)
- Publication `org.tree` for any logged-in user
- Helpers `Org.descendantIds`, `Org.ancestorIds`, `Org.isUnder`, `Org.requireActiveNode`, `Org.title`

This package must **not** import `meteor/*`. The app injects Meteor APIs.

## Develop in this repo

From the **repo root**:

```bash
pnpm install
```

Do not run `pnpm` inside `apps/`.

## Install in an app

```json
"@nexus/org": "file:../../packages/org"
```

Then `meteor npm install` in that app.

## registerWithMeteor

```javascript
import { Org } from '@nexus/org'

Org.registerWithMeteor({ Meteor, Mongo, check, Match, Roles, locales })
```

`locales.defaultData` must be `en` and `locales.data` must include `en`. Calling it twice throws. Client writes on `nexus_org` are denied.

## Document shape

| Field | Meaning |
|-------|---------|
| `parentId` | `null` for a root, otherwise another `nexus_org` `_id` |
| `type` | Free string (`division`, `department`, `team`, …) |
| `title.<data>` | Map keyed by `locales.data`. `title.en` is required |
| `sortOrder` | Number, default `0` |
| `active` | Boolean, default `true` |
| `createdAt` / `updatedAt` | Server timestamps |

## DDP methods

| Method | Who | Notes |
|--------|-----|-------|
| `org.insert` | `superadmin` / `admin` | `{ parentId?, type, title, sortOrder?, active? }` |
| `org.update` | `superadmin` / `admin` | `{ id, parentId?, type?, title?, sortOrder?, active? }` — cycle check |
| `org.remove` | `superadmin` / `admin` | Refuses children and users whose `profile.orgNodeId` is this node or a descendant |

## Publication

`org.tree` — every logged-in user receives the full tree, sorted by `sortOrder`.

```javascript
Org.subscribeTree()
```

## Tree helpers

```javascript
await Org.descendantIds(nodeId)
await Org.ancestorIds(nodeId)
await Org.isUnder(nodeId, ancestorId) // equal or descendant
await Org.requireActiveNode(nodeId)   // or null to clear
Org.title(node, locale)
```

`isUnder` is what Risks later uses: a user at `profile.orgNodeId` may see a risk whose `orgNodeId` is that node or a descendant.

## What this package does not do

- User-assignment UI (method `accounts.users.setOrg` exists; picker later)
- Publishing `Meteor.users` (`accounts.directory` stays in `@nexus/accounts`)
- Risks / Controls filters (those sub-apps call the helpers)
