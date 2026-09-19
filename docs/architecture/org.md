<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Organisational tree and user attachment
-->
# Org

Generic tree in `@nexus/org`. Collection name is fixed (`nexus_org`). Users attach with `profile.orgNodeId` via `accounts.users.setOrg` (admin only, after the user exists). Assignment UI is later.

Back to [_Architecture.md](_Architecture.md). Package API: [`packages/org/README.md`](../../packages/org/README.md).

## Contents

- [Why a package](#why-a-package)
- [Nodes](#nodes)
- [Settings UI](#settings-ui)
- [User attachment](#user-attachment)
- [Same unit](#same-unit)
- [What not to do](#what-not-to-do)
- [Source map](#source-map)

## Why a package

Lists stay for flat select catalogs. Org owns parent/child walks that Risks, Controls, and later sub-apps will share. Writes are `superadmin` / `admin` only.

## Nodes

`parentId` is `null` at a root. `type` is a free string. `title` is a locale map (`en` required). Remove refuses children and users whose `profile.orgNodeId` is the node or a descendant. Moving a node under one of its descendants is refused.

Any logged-in user may subscribe to `org.tree`.

## Settings UI

`NOrgTreeEditor` on `/settings/org` (admin display gate). DDP stays `org.insert` / `update` / `remove`. `type` is a free string. No user-assignment picker on `NAccountForm`.

Local `public.devSeedAdmin` inserts a dummy tree when `nexus_org` is empty. Production leaves the collection empty.

## User attachment

`accounts.directory` stays in `@nexus/accounts` and may project `profile.orgNodeId`. Org does not publish users.

```javascript
await Accounts.setOrg({ id: userId, orgNodeId })
```

`orgNodeId` must be an active `nexus_org` id, or `null` to clear. Not a client `profile` write.

## Same unit

```javascript
await Org.isUnder(risk.orgNodeId, user.profile.orgNodeId)
```

True when the ids are equal or the risk’s node is a descendant of the user’s node. Risks (later) uses this in `canRead` / `canWrite` and in its publication `$or`.

## What not to do

- Do not store `divisionId` / `departmentId` on the user. One pointer: `orgNodeId`.
- Do not put org walks inside `@nexus/actions`.
- Do not treat a global `risks.reader` as “same unit”.

## Source map

| Concern | Where |
|---------|--------|
| Package | [`packages/org/`](../../packages/org/) |
| Widgets | [`packages/ui/src/components/org/`](../../packages/ui/src/components/org/) |
| Adapter | [`imports/api/nexusOrg.js`](../../apps/nexus-govrn/imports/api/nexusOrg.js) |
| Settings | [`imports/ui/settings/VewOrg.vue`](../../apps/nexus-govrn/imports/ui/settings/VewOrg.vue) |
| Dummy seed | [`imports/api/demoOrg.js`](../../apps/nexus-govrn/imports/api/demoOrg.js) |
| User field | `accounts.users.setOrg` in [`packages/accounts/`](../../packages/accounts/) |
