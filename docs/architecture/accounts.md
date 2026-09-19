<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
User admin, suspend, and role catalogs
-->
# Accounts

Admin DDP for Meteor users: create, update, delete, set password, suspend, replace roles. Users stay on `Meteor.users`. Roles stay `meteor/roles`. This package does **not** own a new users or roles collection.

Back to [_Architecture.md](_Architecture.md). Package API: [`packages/accounts/README.md`](../../packages/accounts/README.md). First admin: [Setup](setup.md). Settings widgets: [UI](ui.md).

## Contents

- [Who may administer](#who-may-administer)
- [What the package owns](#what-the-package-owns)
- [Role catalogs](#role-catalogs)
- [Suspend](#suspend)
- [App wiring](#app-wiring)
- [UI](#ui)
- [What not to do](#what-not-to-do)
- [Source map](#source-map)

## Who may administer

`superadmin` and `admin` have the same account-admin permissions. Full [applog](applog.md) visibility is `superadmin` only.

The last superadmin cannot be removed, suspended, or stripped of that role. You cannot suspend or delete yourself.

## What the package owns

- Methods `accounts.users.insert` / `update` / `remove` / `setPassword` / `setSuspended` and `accounts.roles.set`
- Publications `accounts.users` and `accounts.roleAssignments` (admin callers only). User fields never include `services`.
- In-memory `registerRoleCatalog` for sub-app role names
- Login rejection when `suspendedAt` is set

Passwords go through `accounts-base` only. Methods `check` arguments; a client Mongo modifier is never applied. Writes can call `Applog.record` when the app passes that function at register time.

## Role catalogs

Each sub-app registers the names the assign-roles UI may grant. Register from that sub-app on **client and server**. Settings shows the raw role names — no labels in `@nexus/ui`.

```javascript
NexusAccounts.registerRoleCatalog({
  key: 'books',
  roles: [
    { name: 'books.reader', group: 'books' },
    { name: 'books.create', group: 'books' },
  ],
})
```

Startup creates those roles plus `superadmin` / `admin` from [Setup](setup.md). File-owner roles (`files.bookCover.upload`, …) belong in a catalog too so an admin can grant them.

## Suspend

`Meteor.users.suspendedAt` is a `Date` when suspended, otherwise `null`. `Accounts.validateLoginAttempt` rejects a suspended user.

## App wiring

Call `Accounts.registerWithMeteor` **after** Setup, with `record: Applog.record` if you want role and user events in the audit log. GovRN adapter: [`imports/api/nexusAccounts.js`](../../apps/nexus-govrn/imports/api/nexusAccounts.js). `/settings` is core app UI, not a cloneable sub-app.

## UI

| Widget | Job |
|--------|-----|
| `NSettingsWorkspace` | Settings landing cards |
| `NAccountsRegister` | Admin user table (`useAccountsUsers`) |
| `NAccountForm` | Create/edit, reset password, suspend, assign roles |
| `NSettingsHeading` | Page heading |

Widgets call the registered accounts helpers. Vue `v-if` is not security — methods still authorize on the server.

## What not to do

- Do not publish `services`, bcrypt, or resume tokens.
- Do not implement forgot-password in this package (it is out of scope today).
- Do not treat router guards as the access control.

## Source map

| Concern | Where |
|---------|--------|
| Package | [`packages/accounts/`](../../packages/accounts/) |
| Widgets | [`packages/ui/src/components/accounts/`](../../packages/ui/src/components/accounts/) |
| App adapter | [`imports/api/nexusAccounts.js`](../../apps/nexus-govrn/imports/api/nexusAccounts.js) |
| Settings routes | [`imports/ui/settings/`](../../apps/nexus-govrn/imports/ui/settings/) |
