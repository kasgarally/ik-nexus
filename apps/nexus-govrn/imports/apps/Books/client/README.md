<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Sub-app client wiring: routes, i18n, drawer item
-->
# Client

Browser-only wiring for this sub-app. The app merges these into the product router, i18n instance, and drawer catalog. Do not edit `WebLayout.vue` when adding a sub-app.

`index.client.js` imports collection files (Minimongo + schema) and file owner types. It does not import this folder; `router.js` / `i18n` / `nav.js` at the app level do.

## Contents

- [What belongs here](#what-belongs-here)

## What belongs here

- `routes.js` — named views; static `/books/categories` before `/books/:id?`
- `i18n.js` — `bookMessages` for en / fr / ar
- `nav.js` — one drawer row (`bookNavItem`)
- Not Vue screens (those are `screens/`, `views/`, `forms/`)
