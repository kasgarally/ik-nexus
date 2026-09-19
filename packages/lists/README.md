<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Shared NEXUS translatable select lists
-->
# @nexus/lists

Central repository of translatable select-list items for one Meteor app. Each option has a stable `code` (what you store and filter on) and a `title` map whose keys come from `settings.public.locales.data` (what a later v-select shows in the user’s locale). Extra codes in `data` (for example `es`) persist even when there is no UI catalog for that code.

The collection name is fixed (`nexus_lists`), like `nexus_files`. There is no UI in this package.

## Contents

- [What this package owns](#what-this-package-owns)
- [Develop in this repo](#develop-in-this-repo)
- [Install in an app](#install-in-an-app)
- [registerWithMeteor](#registerwithmeteor)
- [Document shape](#document-shape)
- [listKey](#listkey)
- [DDP methods](#ddp-methods)
- [Publication](#publication)
- [Lists.title](#liststitle)
- [What this package does not do](#what-this-package-does-not-do)
- [Later: publish to npm](#later-publish-to-npm)

## What this package owns

- Metadata collection `nexus_lists` (one document per option)
- DDP methods `lists.insert` / `lists.update` / `lists.remove` (`superadmin` / `admin`)
- Publication `lists.forKey` for any logged-in user
- Client helpers `Lists.subscribeForKey`, `Lists.insert`, `Lists.update`, `Lists.remove`, `Lists.title`

This package must **not** import `meteor/*`. The app injects Meteor APIs.

Writes use Meteor 3 `insertAsync` / `updateAsync` / `removeAsync` / `findOneAsync`. `find()` stays for the publication cursor.

## Develop in this repo

`@nexus/lists` is a pnpm workspace member (`packages/*` only). From the **repo root**:

```bash
pnpm install
```

Do not run `pnpm` inside `apps/`.

## Install in an app

```json
"@nexus/lists": "file:../../packages/lists"
```

Then `meteor npm install` in that app. Do not use `workspace:*`.

## registerWithMeteor

Call once on the client and once on the server (same split as `@nexus/files`). Pass the normalized locales object from the app (`normalizeLocales` in `@nexus/ui` / `@nexus/ui/locales`):

```javascript
import { Lists } from '@nexus/lists'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { check, Match } from 'meteor/check'
import { Roles } from 'meteor/roles'

Lists.registerWithMeteor({ Meteor, Mongo, check, Match, Roles, locales })
```

`locales` must include `defaultData: "en"` and a `data` array that contains `en` (minimum `["en"]`). Insert/update `check` / `Match` and `buildTitle` accept exactly those keys; `title.en` is required. Extra keys are rejected. Calling it twice throws. Client inserts/updates/removes on `nexus_lists` are denied.

## Document shape

| Field | Meaning |
|-------|---------|
| `listKey` | Which v-select this row belongs to (`risks.category`, `risks.likelihood`) |
| `code` | Stable value stored on domain docs and used to filter. Unique per `listKey`. Immutable after insert. |
| `title.<data>` | Map keyed by `locales.data`. `title.en` is required; other data keys are optional. Display uses the UI locale only when that code is in `data`; otherwise `defaultData`, then `code`. Leftover keys that are not in `data` are ignored. |
| `sortOrder` | Number, default `0` |
| `active` | Boolean, default `true`. Inactive rows stay in Mongo; UI later can hide them. |
| `meta` | Optional plain object (`score`, `color`, …). This package does not interpret it. |
| `createdAt` / `updatedAt` | Server timestamps |

`listKey` is also immutable after insert.

## listKey

There is no catalog document. Any non-empty string is allowed. App convention is `subapp.field`:

```text
risks.category
risks.likelihood
controls.type
```

A later v-select subscribes to one `listKey` and uses `code` as `item-value`.

## DDP methods

| Method | Who | Notes |
|--------|-----|-------|
| `lists.insert` | `superadmin` / `admin` | `{ listKey, code, title, sortOrder?, active?, meta? }` |
| `lists.update` | `superadmin` / `admin` | `{ id, title?, sortOrder?, active?, meta? }` — not `listKey` or `code` |
| `lists.remove` | `superadmin` / `admin` | `{ id }` hard delete |

Until those roles exist in the app, methods throw `not-authorized`.

A second insert with the same `listKey` + `code` throws `duplicate-code`.

```javascript
await Lists.insert({
  listKey: 'risks.category',
  code: 'operational',
  title: { en: 'Operational', fr: 'Opérationnel', ar: 'تشغيلي' },
  sortOrder: 10,
  meta: { color: 'orange' },
})
```

## Publication

`lists.forKey` takes a `listKey` string. Any logged-in user receives every row for that key (including inactive), sorted by `sortOrder`. Anonymous callers get an empty set.

```javascript
Lists.subscribeForKey('risks.category')
```

## Lists.title

```javascript
Lists.title(item, locale)
// locale must be in locales.data, else title.en, else item.code
// leftover title.fr is ignored when data is ["en"]
```

## What this package does not do

- A v-select or any Vue widget (later, in `@nexus/ui`)
- Per-`listKey` roles
- Hierarchical parent/child options
- Collection2 / SimpleSchema
- Tests until someone asks for them

## Later: publish to npm

Keep the `@nexus/lists` import. Change the app dependency from `file:../../packages/lists` to a version.
