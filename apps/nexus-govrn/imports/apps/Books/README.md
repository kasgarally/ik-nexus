<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Books sub-app: folder layout, roles, routes, and scaffold
-->
# Books

A copy-pasteable Meteor sub-app: signed-in users can read books; writers add metadata, a cover, and a PDF. Categories come from `@nexus/lists` (`books.category`). Files go through `@nexus/files`. Writes are audited by `@nexus/applog`.

This folder is the clone unit. Copy it, rename the sub-app, then add one file per extra collection.

## Contents

- [Folder](#folder)
- [Clone](#clone)
- [Routes](#routes)
- [Roles](#roles)
- [Collection and DDP](#collection-and-ddp)
- [Files and lists](#files-and-lists)
- [Scaffold](#scaffold)

## Folder

```
imports/apps/Books/
  README.md
  index.server.js
  index.client.js
  collections/          README.md, books.js
  server/               README.md, roles.js, files.js
  client/               README.md, routes.js, i18n.js, nav.js
  screens/              README.md, Scr…
  views/                README.md, Vew…
  forms/                README.md, Frm…
  components/           README.md
  workspace/            README.md
  dashboards/           README.md
  reports/              README.md
  datasets/             README.md
  composables/          README.md
  constants/            README.md
  helpers/              README.md
  exports/              README.md
```

`collections/books.js` is the cloneable collection file: constants, `Mongo.Collection`, SimpleSchema, deny, then `Meteor.isServer` methods, publications, and indexes. Vue `v-if` is display only.

Empty folders (`components/`, `workspace/`, `dashboards/`, `reports/`, `datasets/`, `composables/`, `constants/`, `helpers/`, `exports/`) are clone placeholders — each has a README for what belongs there. Books does not use them yet.

Shared method gates live in [`imports/api/methodHelpers.js`](../../api/methodHelpers.js) (`requireLoggedIn`, `requireRole`, `validateDocument`, and a resolved `SimpleSchema` constructor). Do not put `meteor/*` helpers in `@nexus/ui`.

## Clone

1. Copy `imports/apps/Books/` to `imports/apps/<Name>/`.
2. In each `collections/<name>.js`, set `collectionName` (Mongo name and DDP prefix) and `rolePrefix`. Paste schema fields. Keep methods written out — do not add a factory.
3. Import every collection file from **both** `index.client.js` (Minimongo + schema) and `index.server.js` (methods + publications register once). Extra collections (Controls later) are more files in `collections/`, two extra import lines.
4. Rename `registerBooks` / `registerBooksClient` (one line each). Keep `server/files.js` and `server/roles.js` as dedicated files that are not per-collection clones.
5. Wire the four scaffold lines below. Add a row in [`imports/ui/nav.js`](../../ui/nav.js). VS Code snippet prefix: `nexus-collection`.

## Routes

Static `/books/categories` is declared **before** `/books/:id?` so `categories` is not captured as an id.

- `/books` — heading + register + empty context (`route.params.id` missing)
- `/books/:id` — same three named views; context reads `route.params.id`
- `/books/categories` — heading + `NListItemsEditor` (no context)

Admins open categories from a **Configuration** card under the book detail in the context pane (`NAdminConfigCard` from `@nexus/ui`). Vue `v-if` on `superadmin` / `admin` is display only. List writes still use the package roles. Risks later adds more rows (likelihood, impact) to the same card.

Row click: `router.push({ name: 'books', params: { id: row._id } })`. Create opens `NModal` + `FrmBook`; after save, push `/books/<newId>`. Update and remove live on the context pane. Cover and PDF are owned by the context pane after the book exists.

`FrmBook` uses one `reactive` form object. Method failures show `error.reason` (SimpleSchema messages from `validateDocument`).

## Roles

| Role | Who | What |
|------|-----|------|
| `books.reader` | every signed-in user | label; publications use `this.userId` |
| `books.create` | `superadmin` / `admin` | New button + `books.insert` |
| `books.update` | `superadmin` / `admin` | pencil + `books.update` |
| `books.remove` | `superadmin` / `admin` | `NRemoveIcon` + `books.remove` |
| `files.books.download` | every signed-in user | file metadata and HTTP GET |
| `files.books.upload` / `files.books.remove` | writers | cover and PDF |
| `superadmin` / `admin` | list writers | Configuration card + `NListItemsEditor` |

`server/roles.js` creates these roles, grants readers to all users, and grants writers to `superadmin` / `admin`. List writes stay on the package contract (`superadmin` or `admin`).

Heading buttons use `useUserRole` from `/imports/ui/useUserRole.js`. Methods still enforce the same roles. The client only sees those roles if [`imports/api/publishUserRoles.js`](../../api/publishUserRoles.js) is imported on the server (current user’s `role-assignment` rows).

## Collection and DDP

Mongo collection: `books` (`collectionName`). Client `insert` / `update` / `remove` are denied.

Methods: `books.insert`, `books.update`, `books.remove` — login, named role, `validateDocument(bookSchema, params)`, then `$set` of schema keys only. `createdAt` / `createdBy` / `updatedAt` are server-set.

Publications: `books.list`, `books.one` — signed-in only.

Fields: `title` (required), `description`, `author`, `aboutAuthor`, `publisher`, `publishedOn`, `language`, `isbn`, `category` (list `code`). Cover and PDF are not book fields.

No Collection2 `attachSchema`. No `methodsFactory`.

## Files and lists

Two `Files.defineOwner` calls on the same `Books` collection, both `allowAnonymous: false`, both using `files.books.*`:

- `bookCover` — image (`NFileReplace` square)
- `bookPdf` — `application/pdf`

`listKey`: `books.category`. `FrmBook` uses `NListSelect`. Categories screen uses `NListItemsEditor`. The context pane links there via `NAdminConfigCard` (admin display only).

`Applog.registerCollection({ name: 'books', collection: Books })` runs in `registerBooks()`.

## Scaffold

After the four `registerNexus*` calls in [`server/main.js`](../../../server/main.js):

```js
import { registerBooks } from '/imports/apps/Books/index.server.js'
registerBooks()
```

After the four `registerNexus*` calls in [`imports/ui/main.js`](../../ui/main.js):

```js
import { registerBooksClient } from '/imports/apps/Books/index.client.js'
registerBooksClient()
```

[`router.js`](../../ui/router.js): `import { bookRoutes } from '/imports/apps/Books/client/routes.js'` then `...bookRoutes`.

[`i18n/index.js`](../../ui/i18n/index.js): merge `bookMessages.en` / `.fr` / `.ar`.

[`imports/ui/nav.js`](../../ui/nav.js): import `bookNavItem` from `client/nav.js` and place it in a section. Do not edit `WebLayout.vue`.
