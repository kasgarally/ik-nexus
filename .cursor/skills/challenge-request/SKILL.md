---
name: challenge-request
disable-model-invocation: true
description: >-
  Challenges requests that are ambiguous or may break repo architecture, and
  asks clarifying questions before acting. Use when the user wants a new
  package, to move code across apps/packages, to change shared contracts, or
  when intent is unclear. Also use when a request may contradict PACKAGES.md,
  SECURITY.md, testing rules, or an approved plan. Stop and ask; implement only
  after the user confirms or explicitly overrides.
---

<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Challenge unclear or architecture-breaking requests before acting
-->

# Challenge the request

Read this skill before implementing a request that might be the wrong shape, the wrong layer, or the wrong time.

The user can **override**. After a challenge, if they say to proceed anyway, do the work they asked for. Do not re-litigate.

## When to challenge

Stop and ask when **any** of these are true:

- Intent is unclear (two reasonable readings, missing scope, or “make it shared” without saying who reuses it).
- The change crosses a house boundary: `packages/*` vs `apps/*`, Vue vs DDP, new Atmosphere/npm dependency, new test layer.
- It may contradict `PACKAGES.md` (especially **no `meteor/*` in packages**), `SECURITY.md`, `.cursor/rules/*`, or a plan the user just approved.
- The proposed reuse is hypothetical (one app today, “future apps will need this”).
- A new `@nexus/*` package would own no collection, no DDP/HTTP of its own, and only wrap app helpers.

Do **not** challenge:

- A clear, in-scope change that matches existing patterns.
- “Implement the attached plan” when the plan is already decided.
- An explicit override after you already challenged.

## How to challenge

1. **Name the tension in one or two sentences.** What was asked vs what the architecture says. No lecture.
2. **Ask only the questions that change the work.** Use `AskQuestion` when the tool is available; otherwise ask in the reply. Offer a recommended option first.
3. **Recommend and wait.** Say what you would do if they agree, and that they can override.
4. **Do not start the contested work** (no new package, no move, no delete) until they confirm or override.

Good questions are specific:

- Who reuses this — another Meteor app, or only sub-apps in this app (`imports/api` already shares those)?
- Should this stay out of `packages/*` because it imports `meteor/*`?
- Is a new package worth the adapter + `file:` + Rspack alias if it has no collection or DDP of its own?

## Override

Treat these as an override and implement: “override”, “do it anyway”, “implement anyway”, “I still want this”, “create it”, “don’t stop”.

After override: follow the user’s instruction. Mention the tradeoff in one short sentence if it will bite later. Then execute.

## Architecture defaults (this repo)

These are the defaults to defend until the user overrides them:

| Layer | Lives where |
|-------|-------------|
| Shared JS with no `meteor/*` (or Meteor injected via `registerWithMeteor`) | `packages/*` → `@nexus/<name>` |
| Product collections, sub-app methods, Vue screens | `apps/<app>/imports/` |
| DDP gates used only by this app’s sub-apps (`requireLoggedIn`, `requireRole`, `validateDocument`) | `apps/<app>/imports/api/` — **not** a package |
| `registerWithMeteor` | Packages that own a collection and register their own methods/pubs/HTTP |

`imports/api/` is the share path **inside one Meteor app**. A second product under `apps/` is the usual trigger to extract a real `@nexus/*` package.

## Example

**Ask:** “Move `methodHelpers.js` into a nexus package; other Meteor apps will need it.”

**Challenge:** Packages cannot import `meteor/*`. These helpers *are* Meteor. One app exists; sub-apps already share `imports/api`. `registerWithMeteor` is for packages that own a collection and DDP, not four method gates.

**Ask:** Extract now for a second app you are about to add, or keep it in the app until that app exists?

**If they override:** create the package with injection, no `meteor/*` in `packages/*`.
