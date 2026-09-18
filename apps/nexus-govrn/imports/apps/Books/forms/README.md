<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Create and update forms (Frm…)
-->
# Forms

`Frm…` Vue files: one `reactive` document, `v-model="form.field"`, payload `{ ...form }`. Call `Meteor.callAsync` for insert/update. Show `error.reason` (SimpleSchema messages from `validateDocument`). Cover and PDF stay on the context pane, not on the form.

## Contents

- [What belongs here](#what-belongs-here)

## What belongs here

- `FrmBook.vue` — metadata create/update
- Not list-item editors (`NListItemsEditor` on a view) and not file widgets (`NFileReplace` on `VewBook`)
