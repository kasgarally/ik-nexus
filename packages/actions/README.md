<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Shared NEXUS actions and status journals
-->
# @nexus/actions

Opinionated actions and time-stamped status journals for every sub-app in one Meteor product. Collection names are fixed (`nexus_actions`, `nexus_action_status`). Parents opt in with `Actions.defineOwner` and supply `canRead` / `canWrite` for **each parent document**. This package ORs the action assignee (`byWhoUserId`) for that action’s read, status writes, and files.

There is no product screen here. `@nexus/ui` mounts `NActionsList` after the app registered the package.

## Contents

- [What this package owns](#what-this-package-owns)
- [Develop in this repo](#develop-in-this-repo)
- [Install in an app](#install-in-an-app)
- [registerWithMeteor](#registerwithmeteor)
- [defineOwner](#defineowner)
- [Document shape](#document-shape)
- [DDP API](#ddp-api)
- [Files](#files)
- [What this package does not do](#what-this-package-does-not-do)

## What this package owns

- Collections `nexus_actions` and `nexus_action_status`
- Methods `actions.insert` / `update` / `remove` / `removeForOwner` and `actionStatus.insert` / `update` / `remove`
- Publications `actions.forOwner`, `actionStatus.forAction`, `actions.assignedToMe`
- `Actions.defineOwner` and `Actions.ownerIdsAssignedTo`
- File owners `action.<type>` and `actionStatus.<type>` via `@nexus/files`

This package must **not** import `meteor/*`. The app injects Meteor APIs.

## Develop in this repo

From the **repo root**:

```bash
pnpm install
```

## Install in an app

```json
"@nexus/actions": "file:../../packages/actions"
```

Register **after** `@nexus/files` (file owners) and **before** applog wraps the collections. Call `defineOwner` from the parent sub-app (Risks later). GovRN registers the package now with **no** owner types.

## registerWithMeteor

```javascript
Actions.registerWithMeteor({ Meteor, Mongo, check, Match, locales })
```

`locales.defaultData` must be `en`. Client writes are denied.

## defineOwner

```javascript
Actions.defineOwner({
  type: 'risk',
  collection: Risks,
  async canRead({ userId, parent }) {
    // executive / owner / Org.isUnder — implemented by Risks
  },
  async canWrite({ userId, parent }) {
    // executive or in-scope owner
  },
})
```

Unknown `ownerType` is refused. Assignee is **not** a meteor-role. `canRead` false still publishes actions assigned to the caller on that parent.

`Actions.ownerIdsAssignedTo(userId, ownerType)` is for the **parent** publication so an assignee receives the parent document.

## Document shape

**`nexus_actions`:** `ownerType`, `ownerId`, `title` / `description` maps (`en` required), `byWhoUserId`, `byWhoLabel`, `byWhen`, `completed`, `completedAt`, `completedBy`, `createdBy`, `createdAt`, `updatedAt`.

**`nexus_action_status`:** `actionId`, `asOf`, `description` map, `createdBy`, `createdAt`, `updatedAt`.

`completed` may be set only when `canWrite(parent)` is true.

## DDP API

| Name | Who |
|------|-----|
| `actions.insert` / `update` / `remove` | `canWrite(parent)` |
| `actions.update` `completed` | `canWrite(parent)` only |
| `actions.removeForOwner` | `canWrite(parent)` — cascade statuses and files |
| `actionStatus.*` | `canWrite(parent)` or assignee of that action |
| `actions.forOwner` | All actions if `canRead`; else the caller’s assigned rows |
| `actionStatus.forAction` | `canRead` or assignee |
| `actions.assignedToMe` | `byWhoUserId === this.userId` plus those statuses |

## Files

`defineOwner` registers `Files.defineOwner` for `action.<type>` and `actionStatus.<type>`. Role strings are placeholders. The files `authorize` hook allows download if `canRead` or assignee, and upload/remove if `canWrite` or assignee.

## What this package does not do

- Org walks (`@nexus/org` + the parent sub-app)
- A Risks screen (mount `NActionsList` later)
- Vue widgets (those are `@nexus/ui`)
