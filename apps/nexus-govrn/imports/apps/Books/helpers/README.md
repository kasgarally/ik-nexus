<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Pure helpers for this sub-app
-->
# Helpers

Plain functions with no Vue and no `meteor/*` (format a published date, score a cell, build a CSV row). Easy to lift into `@nexus/*` later if a second app needs them.

## Contents

- [What belongs here](#what-belongs-here)

## What belongs here

- Formatting, scoring, mapping
- Not `requireLoggedIn` / `requireRole` (those stay in `imports/api/methodHelpers.js`)
