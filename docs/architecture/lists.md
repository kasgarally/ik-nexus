<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
nexus_lists: stable codes and translatable titles
-->
# Lists

A list row is a **stable `code`** (what you store on a book or risk) plus a **title map** (what a `v-select` shows). Titles follow [locale data keys](locales.md). The editor uses [translatable fields](translatable-fields.md).

Back to [_Architecture.md](_Architecture.md). Package API: [`packages/lists/README.md`](../../packages/lists/README.md).

## Contents

- [Why code and title are separate](#why-code-and-title-are-separate)
- [What the package owns](#what-the-package-owns)
- [App wiring](#app-wiring)
- [UI widgets](#ui-widgets)
- [Lists.title](#liststitle)
- [What not to do](#what-not-to-do)
- [Source map](#source-map)

## Why code and title are separate

Domain documents store `category: "nia"`, not a translated string. The label can change in every data locale without breaking filters or existing rows. `code` is unique per `listKey` and immutable after insert.

`listKey` names the select (`books.category`, later `risks.likelihood`). It is also immutable after insert.

## What the package owns

- Collection `nexus_lists`. Client writes denied.
- Methods `lists.insert` / `update` / `remove` — `superadmin` or `admin`.
- `buildTitle` / `mergeTitle` keep only `locales.data` keys and require `title.en`.
- Publication `lists.forKey`: any logged-in user, every row for that key (including inactive), sorted by `sortOrder`.
- Client helpers `Lists.subscribeForKey`, `Lists.insert`, `Lists.update`, `Lists.remove`, `Lists.title`.

`@nexus/lists` must not import `meteor/*`. The app injects Meteor APIs and the normalized locales object.

When `data` is `["en"]`, the stored document is `{ title: { en: "…" }, code: "nia", … }`. Switching the header to French still shows that English title.

## App wiring

[`imports/api/nexusLists.js`](../../apps/nexus-govrn/imports/api/nexusLists.js) calls `Lists.registerWithMeteor` on client and server with `locales: appLocales`. Both sides must see the same `data` list — methods `check` those keys.

```javascript
Lists.registerWithMeteor({ Meteor, Mongo, check, Match, Roles, locales: appLocales })
```

## UI widgets

| Widget | Job |
|--------|-----|
| `NListSelect` | Capture form. Active items only. `v-model` is `code`. Labels from `Lists.title(item, uiLocale)`. |
| `NListItemsEditor` | Setup table for one `listKey`. Add/Edit opens `NListItemForm`. `code` locks on edit. |
| `NListItemForm` | One `NTranslatableTextField` for the title map, plus `code`, `sortOrder`, `active`. |

Widgets live in `@nexus/ui`. They call `Lists.*` after the app registered the package. See [UI](ui.md).

## Lists.title

```javascript
Lists.title(item, locale)
```

Uses the same rule as `resolveLocalized`: the UI locale is read only when it appears in `locales.data`. Leftover `title.fr` is ignored when `data` is `["en"]`. Then `title.en`, then `item.code`.

## What not to do

- Do not store a translated title on the domain document.
- Do not bind `NListSelect` to `_id` or to `title.en`.
- Do not register lists with a different `data` array on client vs server.

## Source map

| Concern | Where |
|---------|--------|
| Methods + `buildTitle` | [`packages/lists/src/`](../../packages/lists/src/) |
| `Lists.title` | [`packages/lists/src/title.js`](../../packages/lists/src/title.js) |
| Form / select / editor | [`packages/ui/src/components/lists/`](../../packages/ui/src/components/lists/) |
| App adapter | [`imports/api/nexusLists.js`](../../apps/nexus-govrn/imports/api/nexusLists.js) |
