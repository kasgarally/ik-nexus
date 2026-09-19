<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Data-point catalog template for a domain expert pass
-->

# Catalog template

Copy this shape into the reply. Drop empty sections. Do not invent a fourth job beyond record / analyse / present.

```markdown
Acting as a <domain> expert for a NEXUS sub-app.

## Slice
Who uses it, what decision they make, first register (not the whole profession).

## Personas
| Persona | They must see | They may write |
|---------|---------------|----------------|

## Record (stored)
| Field | Key | Why | Kind | Required | Who writes |
|-------|-----|-----|------|----------|------------|

Kinds: `string` / `locale map` / `date` / `number` / `bool` / `userId` / `orgNodeId` / `list code` / `enum` / `child collection`.

## Children and evidence
What is a **row** (journal, line, assessment) vs a **file** vs an **action**. Point at `@nexus/actions` / `@nexus/files` / `@nexus/lists` when that is the row.

## Analyse (derived)
| Measure | Inputs | Why it is not stored |

## Present
Lists, filters, KPIs, journals, exports. No new stored fields unless Record is missing them.

## Reuse
What this slice must **not** duplicate (org, actions, files, lists, directory, applog).

## Challenges
Gaps, vanity fields, wrong owner. Questions that change the catalog.

## Out of this slice
Honest deferrals.
```

## Field axes (use as a prompt, not a dump)

Walk these so a register is not only a title:

- **Identity** — stable id, human reference, translatable title/statement (`en` required)
- **Classification** — type, category, list codes, jurisdiction, materiality
- **Ownership** — document owner user, org node, executive vs in-scope writer
- **Lifecycle** — identified / opened / review-by / closed (dates). Prefer dates + flags over a large state machine
- **Magnitude** — money, scores, likelihood × impact, quantities, currency (list)
- **Relationships** — parent, counterparties, linked controls/risks (ids, not duplicated trees)
- **Accountability** — who does the work → `@nexus/actions` (`byWhoUserId` / `byWhoLabel`, `byWhen`, `completed`)
- **Evidence** — `@nexus/files` on the parent or on a child
- **Narrative** — description maps, status journal (actions), not a second free-text dump
- **Control / policy** — only if this domain’s job is to attest or test them

## Worked sketch: Risks (first register)

Not a schema to copy blindly. Use it when the domain is Risks.

**Record:** statement (locale map), category (list), ownerUserId, orgNodeId, inherent likelihood/impact, residual likelihood/impact (or residual after named controls), reviewBy, appetite or rating code, optional source/cause.

**Children:** `@nexus/actions` for treatments; `@nexus/files` on the risk and on actions; later control links as ids, not embedded org.

**Derived:** overdue treatments (`!completed && byWhen < today`); residual vs appetite breach; aging past `reviewBy`.

**Challenge:** no `risks.reader` for every row; executives + in-scope owner + assignee (read parent). Do not store org walks on the risk. Do not put action status on the risk document.
