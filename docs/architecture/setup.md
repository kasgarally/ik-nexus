<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
First-run setup singleton and wizard
-->
# Setup

One-shot first-run record. Completing setup writes singleton `nexus_setup` (`_id: 'current'`), creates the first password user, and grants `superadmin` / `admin`. Company fields live here, **not** in Meteor settings. The password is never stored on this document.

Back to [_Architecture.md](_Architecture.md). Package API: [`packages/setup/README.md`](../../packages/setup/README.md). User admin after first run: [Accounts](accounts.md).

## Contents

- [Wizard vs seed](#wizard-vs-seed)
- [What the package owns](#what-the-package-owns)
- [App wiring](#app-wiring)
- [UI](#ui)
- [Images](#images)
- [What not to do](#what-not-to-do)
- [Source map](#source-map)

## Wizard vs seed

GovRN gates first boot on `/onboarding` until `nexus_setup` exists.

- **`public.devSeedAdmin: true`** (local only) inserts the singleton and `admin@localhost` from `demoSeedData.js` and skips the wizard. Production must omit the key or set it `false`.
- Without that flag, `NSetupWizard` collects company, address, branding, and the first admin.

A second `setup.complete` throws `setup-already-complete`. The wizard is not re-opened after complete.

## What the package owns

- Collection `nexus_setup`. Client writes denied.
- Methods `setup.complete` (anyone, only if no document) and `setup.isComplete`.
- Publication `setup.public` — no login; only `companyName`, `logoDataUrl`, `iconDataUrl`. Address, `firstAdminUserId`, and system snapshots stay off DDP.
- Helpers `Setup.complete`, `Setup.isComplete`, `Setup.subscribePublic`, `Setup.loginWithPassword`.

Platform roles `superadmin` / `admin` originate here. [Accounts](accounts.md) assigns those plus sub-app catalogs.

Pass `runAsSystem: Applog.runAsSystem` so the first-run insert is audited as `SYSTEM`. Register setup **before** applog wraps collections. See [Applog](applog.md).

## App wiring

[`imports/api/nexusSetup.js`](../../apps/nexus-govrn/imports/api/nexusSetup.js) injects Meteor, Mongo, Accounts, Roles, and optional `runAsSystem`. Router sends an incomplete install to `/onboarding`.

## UI

`NSetupWizard` is a `v-stepper-vertical` in `@nexus/ui`. It calls `Setup.complete` with company, address, logo/icon data URLs, and `admin: { name, email, password }`. Password goes through `accounts-base` only.

## Images

Logo and icon are **data URLs**, not [GridFS](files.md). The method rejects non-image prefixes and payloads over 400 KB (logo) or 100 KB (icon). That avoids a server fetch of a caller URL (A10).

## What not to do

- Do not store passwords on `nexus_setup` or in applog.
- Do not enable `devSeedAdmin` on a public host.
- Do not put company fields in `settings.json`.

## Source map

| Concern | Where |
|---------|--------|
| Package | [`packages/setup/`](../../packages/setup/) |
| Wizard | [`packages/ui/src/components/setup/`](../../packages/ui/src/components/setup/) |
| App adapter | [`imports/api/nexusSetup.js`](../../apps/nexus-govrn/imports/api/nexusSetup.js) |
| Dev seed | [`imports/api/demoSeedData.js`](../../apps/nexus-govrn/imports/api/demoSeedData.js) |
