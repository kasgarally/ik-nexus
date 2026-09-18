<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
One file per Mongo collection
-->
# Collections

One file per collection. Each file is the clone unit: `collectionName`, `Mongo.Collection`, SimpleSchema, `denyClientWrites`, then `Meteor.isServer` methods, publications, and indexes.

Client and server both import every file here (`index.client.js` / `index.server.js`). Vue imports the named export (`Books`). A later Controls sub-app adds `frameworks.js` and `controlAreas.js` beside `books.js`.

## Contents

- [What belongs here](#what-belongs-here)

## What belongs here

- `books.js` (and later extra collections)
- Not Applog registration, file owners, or role grants (those stay in `index.server.js` / `server/`)
