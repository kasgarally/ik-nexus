<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Append-only application audit log
-->
# Applog

Append-only audit of **who** created, updated, or removed **which** document, and **when**. This is not `meteor/logging` (server console) and not session replay.

Back to [_Architecture.md](_Architecture.md). Package API: [`packages/applog/README.md`](../../packages/applog/README.md). Writers that pass `record` / `runAsSystem`: [Accounts](accounts.md), [Setup](setup.md).

## Contents

- [What the package owns](#what-the-package-owns)
- [Wrapping collections](#wrapping-collections)
- [Actor kinds](#actor-kinds)
- [Redaction](#redaction)
- [Who can read](#who-can-read)
- [App wiring](#app-wiring)
- [What not to do](#what-not-to-do)
- [Source map](#source-map)

## What the package owns

- Collection `nexus_applog` (append-only, fixed name)
- `Applog.registerCollection` — wraps `insertAsync` / `updateAsync` / `removeAsync` on opted-in collections
- `Applog.record` — domain events that are not a collection write (export, approve, role change)
- `Applog.runAsSystem` / `runAsAgent` / `runAs` — actor frames for seed, first-run, and later AI agents
- Publication `applog.recent` — **superadmin** only

A failed audit insert is printed to the console and **does not** fail the business write.

The package must not import `meteor/*`. Sync `insert` / `update` / `remove` are not wrapped and must not be used.

## Wrapping collections

Server only, after `registerWithMeteor`, after the target collections exist:

```javascript
Applog.registerCollection({
  name: 'books',
  collection: Books,
  redactKeys: [],
})
```

GovRN wraps `nexus_files`, demo parents, `nexus_lists`, and `nexus_setup` (and product collections as they appear). Do not register `nexus_applog` itself.

Register [Setup](setup.md) **before** wrapping, so the first-run insert can be audited as `SYSTEM`.

## Actor kinds

| Kind | When |
|------|------|
| User | Normal DDP write (`this.userId`) |
| `SYSTEM` | `Applog.runAsSystem` — startup seed, `setup.complete` |
| `agent` | `Applog.runAsAgent` — reserved for later AI actors |

## Redaction

Default redact keys include `password`, `bcrypt`, `token`, `services`, `resume`. Add `redactKeys` per collection for anything similar. Do not log secrets.

## Who can read

`applog.recent` is superadmin only. `admin` can administer users ([Accounts](accounts.md)) but cannot subscribe to the full audit stream.

## App wiring

[`imports/api/nexusApplog.js`](../../apps/nexus-govrn/imports/api/nexusApplog.js) calls `registerWithMeteor` on client and server, then **server only** `registerCollection`. Startup seeds run inside `runAsSystem`.

There is no applog Vue widget in `@nexus/ui` today.

## What not to do

- Do not wrap with sync Mongo APIs.
- Do not let a failed applog insert abort a book or list write.
- Do not publish applog to `admin` or to anonymous callers.

## Source map

| Concern | Where |
|---------|--------|
| Package | [`packages/applog/`](../../packages/applog/) |
| App adapter | [`imports/api/nexusApplog.js`](../../apps/nexus-govrn/imports/api/nexusApplog.js) |
