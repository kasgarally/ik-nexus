<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
User admin, suspend, role catalogs, and auth hooks
-->
# Accounts

Admin DDP for Meteor users: create, update, delete, set password, suspend, replace roles. Users stay on `Meteor.users`. Roles stay `meteor/roles`. This package does **not** own a new users or roles collection.

Sign-in screens, reset email, optional TOTP, and gated self-register: [Auth](auth.md).

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

- Methods `accounts.users.insert` / `update` / `remove` / `setPassword` / `setSuspended` / `setOrg` and `accounts.roles.set`
- Guest methods `accounts.authOptions` and `accounts.selfRegister` (self-register is off unless settings allow it)
- Publications `accounts.users` and `accounts.roleAssignments` (admin callers only). `accounts.directory` is any logged-in user (`_id`, name, email, `profile.orgNodeId`; omit suspended). User fields never include `services`.
- In-memory `registerRoleCatalog` for sub-app role names. The platform catalog includes `superadmin`, `admin`, and `user`.
- `Accounts.config({ forbidClientAccountCreation: true })`
- Login rejection when `suspendedAt` is set
- Reset-password URL and email templates
- OAuth `ServiceConfiguration` upsert when server-only credentials exist
- Client wrappers for password, 2FA, forgot/reset, Google, and Facebook

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

Startup creates those roles plus `superadmin` / `admin` / `user`. File-owner roles (`files.bookCover.upload`, …) belong in a catalog too so an admin can grant them. `selfRegisterRoles` may list catalog names other than `superadmin` / `admin`.

## Suspend

`Meteor.users.suspendedAt` is a `Date` when suspended, otherwise `null`. `Accounts.validateLoginAttempt` rejects a suspended user for password, 2FA, and OAuth.

## App wiring

Call `Accounts.registerWithMeteor` **after** Setup, with `record: Applog.record` if you want role and user events in the audit log. Pass `ServiceConfiguration` when OAuth packages are present. GovRN adapter: [`imports/api/nexusAccounts.js`](../../apps/nexus-govrn/imports/api/nexusAccounts.js). `/settings` is core app UI, not a cloneable sub-app. Provide `NEXUS_AUTH_KEY` from the Vue bootstrap so sign-in widgets can call the wrappers.

## UI

| Widget | Job |
|--------|-----|
| `NSignIn` | Password, optional TOTP, forgot link, gated signup / OAuth |
| `NForgotPassword` / `NResetPassword` | Email reset request and token form |
| `NAccountSecurity` | Enroll or disable TOTP for the signed-in user |
| `NSettingsWorkspace` | Settings landing cards |
| `NAccountsRegister` | Admin user table (`useAccountsUsers`) |
| `NAccountForm` | Create/edit, admin-set password, suspend, assign roles. No org picker this round — `setOrg` is a method only. |
| `NSettingsHeading` | Page heading |

Widgets call the registered accounts helpers or the injected auth object. Vue `v-if` is not security — methods still authorize on the server.

## What not to do

- Do not publish `services`, bcrypt, or resume tokens.
- Do not put OAuth secrets in `Meteor.settings.public`.
- Do not treat router guards as the access control.
- Do not re-open client `Accounts.createUser`.
- Do not write `profile.orgNodeId` from the client. Use `accounts.users.setOrg`.

## Source map

| Concern | Where |
|---------|--------|
| Package | [`packages/accounts/`](../../packages/accounts/) |
| Admin widgets | [`packages/ui/src/components/accounts/`](../../packages/ui/src/components/accounts/) |
| Auth widgets | [`packages/ui/src/components/auth/`](../../packages/ui/src/components/auth/) |
| App adapter | [`imports/api/nexusAccounts.js`](../../apps/nexus-govrn/imports/api/nexusAccounts.js) |
| Settings routes | [`imports/ui/settings/`](../../apps/nexus-govrn/imports/ui/settings/) |
| Sign-in routes | [Auth](auth.md) |
