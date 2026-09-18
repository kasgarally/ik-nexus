<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Books sub-app: folder layout, roles, routes, and scaffold
-->
# Books

A copy-pasteable Meteor sub-app: signed-in users can read books; writers add metadata, a cover, and a PDF. Categories come from `@nexus/lists` (`books.category`). Files go through `@nexus/files`. Writes are audited by `@nexus/applog`.

## Contents

- [Folder](#folder)
- [Routes](#routes)
- [Roles](#roles)
- [Collection and DDP](#collection-and-ddp)
- [Files and lists](#files-and-lists)
- [Scaffold](#scaffold)

## Folder

```
imports/apps/Books/
  README.md
  collection.js
  index.server.js
  index.client.js
  server/
    methods.js
    publications.js
    indexes.js
    roles.js
    files.js
  client/
    routes.js
    i18n.js
    nav.js
  screens/
    ScrBooksHeading.vue
    ScrBookCategoriesHeading.vue
  views/
    VewBooks.vue
    VewBook.vue
    VewBookCategories.vue
  forms/
    FrmBook.vue
```

`collection.js` is isomorphic so Minimongo exists on the client. Methods and publications stay server-only. Vue `v-if` is display only.

## Routes

Static `/books/categories` is declared **before** `/books/:id?` so `categories` is not captured as an id.

- `/books` — heading + register + empty context (`route.params.id` missing)
- `/books/:id` — same three named views; context reads `route.params.id`
- `/books/categories` — heading + `NListItemsEditor` (no context)

Row click: `router.push({ name: 'books', params: { id: row._id } })`. Create opens `NModal` + `FrmBook`; after save, push `/books/<newId>`. Update and remove live on the context pane. Cover and PDF are owned by the context pane after the book exists.

## Roles

| Role | Who | What |
|------|-----|------|
| `books.reader` | every signed-in user | label; publications use `this.userId` |
| `books.create` | `superadmin` / `admin` | New button + `books.insert` |
| `books.update` | `superadmin` / `admin` | pencil + `books.update` |
| `books.remove` | `superadmin` / `admin` | `NRemoveIcon` + `books.remove` |
| `files.books.download` | every signed-in user | file metadata and HTTP GET |
| `files.books.upload` / `files.books.remove` | writers | cover and PDF |

`server/roles.js` creates these roles, grants readers to all users, and grants writers to `superadmin` / `admin`. List writes stay on the package contract (`superadmin` or `admin`).

Heading buttons use `useUserRole` from `/imports/ui/useUserRole.js`. Methods still enforce the same roles. The client only sees those roles if [`imports/api/publishUserRoles.js`](../../api/publishUserRoles.js) is imported on the server (current user’s `role-assignment` rows).

## Collection and DDP

Mongo collection: `books`. Client `insert` / `update` / `remove` are denied.

Methods: `books.insert`, `books.update`, `books.remove` (`check` / `Match`, then login, then the named role, then `$set` of known fields only).

Publications: `books.list`, `books.one` — signed-in only.

Fields: `title` (required), `description`, `author`, `aboutAuthor`, `publisher`, `publishedOn`, `language`, `isbn`, `category` (list `code`), `createdAt`, `updatedAt`, `createdBy`. Cover and PDF are not book fields.

## Files and lists

Two `Files.defineOwner` calls on the same `Books` collection, both `allowAnonymous: false`, both using `files.books.*`:

- `bookCover` — image (`NFileReplace` square)
- `bookPdf` — `application/pdf`

`listKey`: `books.category`. `FrmBook` uses `NListSelect`. Categories screen uses `NListItemsEditor`.

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
