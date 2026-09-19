<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Layout and widget preview screens
-->
# UI demos

Static and package-widget previews used while the web layout and `@nexus/ui` were being built. They are **not** product sub-apps. Books, settings, sign-in, and onboarding stay outside this folder.

## Contents

- [What lives here](#what-lives-here)
- [Routes](#routes)
- [What does not live here](#what-does-not-live-here)

## What lives here

| Screen | Route | Why it exists |
|--------|-------|----------------|
| `FilesTest` | `/files-test` | Four `NFileUpload` / `NFileReplace` variants |
| `ListsTest` | `/lists-test` | `NListItemsEditor` / `NListSelect` |
| `Context` + `Context1` / `Context2` | `/workspace` | Named `context` slot on `WebLayout` |
| `SubmissionsRegister` / `SubmissionsHeading` / `SubmissionContext` | `/submissions` | Heading + register + context with mock rows |
| `GovernanceDashboard` / `GovernanceApprovals` | `/governance` | Mock governance chrome |
| `InvoicePage` / `InvoiceSummary` | `/receivables/invoices/new` | Mock invoice form |

`mockSubmissions.js` and `mockGovernance.js` are in-memory fixtures for those screens.

## Routes

[`routes.js`](routes.js) is imported from [`../router.js`](../router.js) as `demoRoutes`. Paths stay the same so Playwright (`/files-test`) and the drawer keep working.

## What does not live here

- Layouts, i18n, Vuetify, router bootstrap
- Sign-in, reset, `/account`, onboarding, settings
- Books (`imports/apps/Books`)
