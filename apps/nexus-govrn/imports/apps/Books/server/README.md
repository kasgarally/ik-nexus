<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Sub-app server files that are not per-collection clones
-->
# Server

Dedicated server modules that are **not** copied per collection: file owner types, role create/grant. Methods, publications, and indexes live on the collection file behind `Meteor.isServer`.

`index.server.js` imports this folder after the collection files.

## Contents

- [What belongs here](#what-belongs-here)

## What belongs here

- `files.js` — `Files.defineOwner` (`bookCover`, `bookPdf`)
- `roles.js` — create Books roles; grant readers to all users, writers to `superadmin` / `admin`
- Not `books.insert` / `books.list` (those are in `collections/books.js`)
