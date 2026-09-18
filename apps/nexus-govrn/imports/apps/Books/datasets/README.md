<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Optional seed documents for this sub-app
-->
# Datasets

Optional starter rows for an empty database: demo books, a default control catalogue, list items that are not user-authored. Import from `index.server.js` / `Meteor.startup` after roles exist. Do not commit secrets.

## Contents

- [What belongs here](#what-belongs-here)

## What belongs here

- JS modules that `insertAsync` when a collection is empty
- Static catalogues the product ships with (controls, likelihood labels)
- Not `settings.json`, passwords, or TLS material
