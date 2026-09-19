<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Shared actions, status journals, and scoped parent access
-->
# Actions

Shared actions for Risks, Controls, Incidents, and later parents. Fixed collections `nexus_actions` and `nexus_action_status`. The parent sub-app supplies `canRead` / `canWrite`. This package ORs the assignee for that action.

Back to [_Architecture.md](_Architecture.md). Package API: [`packages/actions/README.md`](../../packages/actions/README.md). Widgets: [UI](ui.md). Org tree: [Org](org.md).

## Contents

- [Personas](#personas)
- [defineOwner](#defineowner)
- [Documents](#documents)
- [Files](#files)
- [What not to do](#what-not-to-do)
- [Source map](#source-map)

## Personas

| Persona | How | See | Write |
|---------|-----|-----|-------|
| Executive | `risks.executive` or admin (Risks later) | Every parent | Every parent, full actions, `completed` |
| Owner | `ownerUserId` or `Org.isUnder` plus `risks.update` | Own / subtree | Those parents and their actions |
| Assignee | `byWhoUserId` — not a role | That action, its files, **and the parent** (read-only) | Status + files on that action only |

`Actions.ownerIdsAssignedTo(userId, ownerType)` must be `$or`’d into the parent publication or the assignee never receives the parent document.

`actions.forOwner` returns all actions when `canRead(parent)`, otherwise only the caller’s assigned rows.

## defineOwner

GovRN registers `@nexus/actions` now with **no** owners. Risks later:

```javascript
Actions.defineOwner({
  type: 'risk',
  collection: Risks,
  canRead,
  canWrite,
})
```

That also registers file owners `action.risk` and `actionStatus.risk`.

## Documents

Action: translatable `title` / `description`, `byWhoUserId` and/or `byWhoLabel`, `byWhen` (date), manual `completed`. Status: `asOf` + translatable `description`. `en` is required on every map.

## Files

`NFileUpload` uses `ownerType="action.risk"` / `actionStatus.risk`. The files `authorize` hook is the gate (parent `canRead`/`canWrite` or assignee). Product owners stay `allowAnonymous: false`.

## What not to do

- Do not add `risks.reader` that means every risk.
- Do not grant a catalog role to assignees.
- Do not walk the org tree inside this package.

## Source map

| Concern | Where |
|---------|--------|
| Package | [`packages/actions/`](../../packages/actions/) |
| Widgets | [`packages/ui/src/components/actions/`](../../packages/ui/src/components/actions/) |
| Adapter | [`imports/api/nexusActions.js`](../../apps/nexus-govrn/imports/api/nexusActions.js) |
