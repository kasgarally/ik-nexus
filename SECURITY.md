<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Security requirements, OWASP mapping, and NEXUS controls
-->
# Security

NEXUS is a Meteor 3 + Vue 3 platform. Shared libraries live in `packages/*`; product apps live in `apps/*`. Security is a design requirement on every change, not a later pass. Readable code and secure code are both mandatory: name the check so a reviewer can see it, and do not skip a control to keep a function short.

Cursor follows the same rules in [`.cursor/rules/security-owasp.mdc`](.cursor/rules/security-owasp.mdc) and [`.cursor/rules/human-readable-code.mdc`](.cursor/rules/human-readable-code.mdc). Package wiring is documented in [`PACKAGES.md`](PACKAGES.md).

## Contents

- [Principles](#principles)
- [Threat model (this stack)](#threat-model-this-stack)
- [OWASP Top 10 mapping](#owasp-top-10-mapping)
- [Meteor and DDP](#meteor-and-ddp)
- [Authentication and roles](#authentication-and-roles)
- [Publications and data exposure](#publications-and-data-exposure)
- [File uploads and GridFS](#file-uploads-and-gridfs)
- [First-run setup](#first-run-setup)
- [Audit log](#audit-log)
- [Secrets, settings, and TLS](#secrets-settings-and-tls)
- [Client UI (Vue)](#client-ui-vue)
- [Dependencies and supply chain](#dependencies-and-supply-chain)
- [Docker and production](#docker-and-production)
- [What not to do](#what-not-to-do)
- [Reporting a vulnerability](#reporting-a-vulnerability)

## Principles

1. **Deny by default.** Client collection writes are denied. Methods and publications decide who may act. A missing role returns `not-authorized` or an empty cursor — never the document.
2. **Validate on the server.** `check` / `Match` on every method and publication argument. MIME, size, and parent existence are server-side. The browser allowlist is not a control.
3. **Least privilege.** Roles are per action and per owner type (`files.risks.upload`). `allowAnonymous` is a deliberate opt-in for demos, not a default for product owners.
4. **Do not leak secrets.** Passwords never land on `nexus_setup`. Applog redacts `password`, `bcrypt`, `token`, `services`, `resume`. Publications project only the fields the caller may see.
5. **Readable controls.** `requireOwnerRole`, `denyClientWrites`, `rejectInvalidFile` — a colleague must be able to audit the path without decoding a one-liner.
6. **No security through obscurity.** Collection names are fixed and documented. Protection is roles, validation, and TLS, not hidden identifiers.

## Threat model (this stack)

Assume a caller can open the browser console, call any DDP method by name, subscribe to any publication, and hit HTTP routes such as `GET /nexus-files/:fileId`.

| Surface | What an attacker tries | House response |
|--------|------------------------|----------------|
| DDP methods | Call `nexusFiles.start`, `lists.insert`, `setup.complete` without rights | `check` + login/role gates + one-shot setup |
| Publications | Subscribe to `applog.recent` or another user’s files | Empty cursor unless role + filter match |
| HTTP | Guess a file id, path traversal | Prefix parse rejects `/` in the id; anonymous owners only until authenticated HTTP exists |
| First-run | Complete setup after install, or weak password | `setup-already-complete`; minimum password length; client writes denied |
| Uploads | Oversized file, disallowed MIME, upload without a parent | 25 MB cap, MIME allowlist, parent `findOneAsync` |
| Settings / git | Commit secrets, PEMs, generated `settings.json` | gitignored; author `settings.jsonc`; Docker certs are local only |

This is a **governance / ERP** product: unauthorized reads of audit rows, invoices, or attachments are as serious as unauthorized writes.

## OWASP Top 10 mapping

OWASP Top 10:2021, applied to this monorepo. Treat each row as a build checklist, not a slogan.

| ID | Risk | What we do in NEXUS |
|----|------|----------------------|
| **A01 Broken Access Control** | Caller reaches another tenant’s data or an admin-only method | Methods check `userId` and `Roles.userIsInRoleAsync`. Publications return `this.ready()` when the caller is not allowed. Lists writes are `superadmin` / `admin` only. Applog is readable only by those roles. Client `insert` / `update` / `remove` are denied on package collections. |
| **A02 Cryptographic Failures** | Passwords, tokens, or TLS handled badly | Passwords go through `accounts-base` only — never stored on `nexus_setup` or in applog snapshots. Production terminates TLS at NGINX (`fullchain.pem` / `privkey.pem`, gitignored). No secrets in committed JSON. |
| **A03 Injection** | Untrusted input reaches Mongo, HTTP, or HTML | `check` / `Match` on DDP arguments. Selectors are structured objects, never string-built queries. Vue interpolates by default; do not `v-html` untrusted content. File names used in `Content-Disposition` are sanitized. |
| **A04 Insecure Design** | Feature ships without an access model | `Files.defineOwner` requires role strings even when `allowAnonymous` is true, so the flag can be turned off. Parent document must exist before upload. Setup is a one-shot singleton. New sub-apps (Risks, Controls) must declare roles **before** they grow methods. |
| **A05 Security Misconfiguration** | Debug flags, default accounts, or open CORS in production | `public.devSeedAdmin` must be omitted or `false` in production. Generated `settings.json` is gitignored. `insecure` is not a product package. Docker does not copy `.env` / PEMs into the image context. |
| **A06 Vulnerable and Outdated Components** | Known-bad npm / Meteor deps | Pin with `pnpm-lock.yaml` (packages) and each app’s `package-lock.json`. CI uses frozen / `npm ci` installs. Do not add a dependency to skip writing a ten-line helper. |
| **A07 Identification and Authentication Failures** | Weak passwords, session confusion, role mix-ups | First admin is created only by `setup.complete`. Minimum password length is enforced server-side. File upload sessions are bound to `userId` when the caller is logged in. Anonymous upload is only for owners that opted in. |
| **A08 Software and Data Integrity Failures** | Tampered lockfile, untrusted `eval`, unsigned artifacts | Commit lockfiles. Do not `eval` client input. Meteor methods are the write path; do not expose a generic “run this modifier” API. |
| **A09 Security Logging Failures** | No trail of who changed which document | `@nexus/applog` wraps `*Async` writes. Failed audit inserts log to the console and do not fail the business write — still investigate those console errors. Redact secrets from snapshots. Do not log passwords. |
| **A10 Server-Side Request Forgery** | Server fetches a caller-supplied URL | Do not fetch client-supplied URLs in methods. Logo/icon are data URLs with an `image/` prefix and size cap, not remote URLs the server retrieves. |

Additional cheat sheets that apply here: **File Upload**, **Session Management**, **MongoDB**, **XSS**. When a change touches uploads, DDP, or HTML, read the matching OWASP cheat sheet and implement the control in named helpers.

## Meteor and DDP

Meteor’s client can call any method name it knows. UI hiding is not access control.

- Every `Meteor.methods` handler uses `check` / `Match`, then named gates (`requireCaller`, `requireOwnerRole`, `requireParentExists`).
- Use `Meteor.callAsync` from new client code. Use `userIsInRoleAsync` — never the sync `userIsInRole`.
- `collection.allow` / `collection.deny` still use the rule names `insert`, `update`, `remove`. Package collections **deny all three**. There is no product `allow` that trusts the client.
- Return or throw `Meteor.Error` with a stable code (`not-authorized`, `not-logged-in`, `parent-not-found`). Do not put internal paths or Mongo internals in the reason string.
- In-memory upload sessions die on restart. That is intentional: an unfinished upload must not become a blob.

```javascript
// BAD — trusts the client, no role check, sync Mongo
Meteor.methods({
  'risks.update'(id, modifier) {
    Risks.update(id, modifier)
  },
})

// GOOD — named steps, async APIs, explicit authorization
async 'risks.update'(params) {
  check(params, { id: String, title: String })
  if (!this.userId) {
    throw new Meteor.Error('not-logged-in', 'You must be signed in')
  }
  const allowed = await Roles.userIsInRoleAsync(this.userId, 'risks.update')
  if (!allowed) {
    throw new Meteor.Error('not-authorized', 'Missing role risks.update')
  }
  const existing = await Risks.findOneAsync(params.id)
  if (!existing) {
    throw new Meteor.Error('not-found', 'Risk not found')
  }
  await Risks.updateAsync(params.id, { $set: { title: params.title } })
}
```

## Authentication and roles

- **First user** comes from `@nexus/setup` (`setup.complete` creates the password user and grants `superadmin` and `admin`). There is no committed default password for production.
- **Dev seed** (`public.devSeedAdmin`) is a local convenience. Production settings must not enable it.
- **meteor-roles** strings are the authorization source. Files use `files.<ownerType>.upload` / `.download` / `.remove`. Lists and applog read/write gates use `superadmin` / `admin` until a product needs finer roles.
- Do not invent a second permission system in Vue (`v-if="isAdmin"` is presentation only).

## Publications and data exposure

A publication is a query the server runs **as that user**. Returning `Collection.find()` with no filter is a data leak.

| Publication | Who receives rows | Fields |
|-------------|-------------------|--------|
| `nexusFiles.forOwner` | Role `files.<type>.download`, or anonymous owner | Metadata only — never GridFS chunks |
| `lists.forKey` | Any logged-in user | All items for that `listKey` (including inactive) |
| `setup.public` | Anyone (needed before login) | **Only** `companyName`, `logoDataUrl`, `iconDataUrl` |
| `applog.recent` | `superadmin` / `admin` | Capped (default 50, max 200) |

Address, `firstAdminUserId`, and system versions on `nexus_setup` stay off DDP. GridFS bytes go over HTTP, not DDP.

## File uploads and GridFS

`@nexus/files` is the only write path into `nexus_fs`.

- MIME **allowlist** (pdf, office, png/jpeg/gif/webp, txt, csv). Empty MIME is rejected.
- Default max size **25 MB**. Chunk assembly rejects more bytes than `nexusFiles.start` declared.
- Parent document must exist (`findOneAsync`) before `start`.
- `allowAnonymous: true` skips login and roles but **not** parent, MIME, or size. Product owners (risks, invoices) must leave it `false`.
- HTTP `GET /nexus-files/:fileId` currently serves **anonymous owners only**. Authenticated HTTP is not implemented; non-anonymous owners get `401`. Path ids that contain `/` are ignored (no traversal).
- `Content-Disposition` is `inline` with a sanitized filename. Do not reflect raw user filenames into headers.
- Hard delete removes metadata **and** GridFS chunks.

Demo owner `demo` in GovRN is anonymous on purpose for `/files-test`. Do not copy `allowAnonymous: true` onto a real sub-app.

## First-run setup

- `setup.complete` is open only while `nexus_setup` is missing. A second call throws `setup-already-complete`.
- Password is passed to `Accounts`; it is **not** stored on the setup document.
- Logo and icon are **data URLs**, not GridFS: must start with `data:image/`, size-capped (400 KB logo, 100 KB icon). The server does not fetch a remote image URL.
- `setup.public` is the only unauthenticated publication of company branding.

## Audit log

- `@nexus/applog` is append-only. Client writes on `nexus_applog` are denied.
- Wrappers cover `insertAsync` / `updateAsync` / `removeAsync` only. Sync `insert` / `update` / `remove` are unaudited and **must not be used**.
- Default redaction: `password`, `bcrypt`, `token`, `services`, `resume`. Add per-collection `redactKeys` for anything similar (`secretNote`, API keys).
- `Applog.runAsSystem` is for seeds and first-run, not to hide a user action.
- Reading the log is an admin privilege (`applog.recent`).

## Secrets, settings, and TLS

| Item | Rule |
|------|------|
| [`apps/*/settings.json`](apps/nexus-govrn) | Generated, gitignored. Author [`settings.jsonc`](apps/nexus-govrn/settings.jsonc). |
| `.env`, `*.pem`, `*.key`, `credentials.json` | gitignored. Docker certs: only `.gitkeep` is committed. |
| `ROOT_URL` | HTTPS in production. See [docker/README.md](docker/README.md#production--digitalocean). |
| Dev seed credentials | [`demoSeedData.js`](apps/nexus-govrn/imports/api/demoSeedData.js) is for local `meteor reset` only. Never enable `devSeedAdmin` on a public host. |

Do not put company secrets, license keys, or Mongo URIs in `Meteor.settings.public`. That object is sent to every client.

## Client UI (Vue)

- Default mustache / `{{ }}` interpolation escapes HTML. Do not use `v-html` with method results, file names, or list titles unless the value is produced by us and already safe.
- `window.open(Files.downloadUrl(fileId), '_blank', 'noopener')` — keep `noopener`.
- Router guards (`Setup.isComplete`) send people to `/onboarding`. That is UX. Methods still enforce setup-already-complete.
- Do not store passwords in `localStorage`, Pinia, or applog. Locale in `localStorage` is fine.

## Dependencies and supply chain

- Three lockfiles, never mixed: root `pnpm-lock.yaml`, each app `package-lock.json`, services on their own.
- Add dependencies with the matching tool (`pnpm --filter` vs `meteor npm`). See [`PNPM.md`](PNPM.md).
- Prefer named helpers in this repo over a new library when the job is small and security-sensitive (validation, redaction, path parse).
- Packages do not import `meteor/*`. Injection keeps the Meteor surface in the app, where allow/deny and roles already live. See [`PACKAGES.md`](PACKAGES.md#why-packages-must-not-import-meteor).

## Docker and production

- The image is a `meteor build` bundle, not a copy of host `node_modules`. Builder reinstalls with `meteor npm ci`.
- [`.dockerignore`](.dockerignore) keeps `.git`, `.meteor/local`, `node_modules`, caches, and TLS PEMs out of the context.
- NGINX terminates TLS. HTTP redirects to HTTPS when certs exist. Production `ROOT_URL` must be the public `https://` URL.
- Mongo data lives on a named volume. `docker:down --volumes` wipes it — do not run that on a host that holds real data unless the operator asked.

## What not to do

- Do not add `insecure`, autopublish, or a global `Collection.allow({ insert: () => true })`.
- Do not pass a client-supplied Mongo modifier through to `updateAsync`.
- Do not publish `Users.find()` or `Meteor.users` without a field projection.
- Do not log passwords, bcrypt, resume tokens, or raw `services`.
- Do not enable `allowAnonymous` on a product owner type to “make the demo work”.
- Do not fetch caller-supplied URLs on the server.
- Do not commit PEMs, `.env`, or `settings.json`.
- Do not treat a Vue `v-if` as authorization.
- Do not “minify” access checks into an unreadable boolean chain. Extract `canUploadToOwner` and keep the `why` comment.

## Reporting a vulnerability

This repository is INTELLEKTRA proprietary software (see [`LICENSE`](LICENSE)). Do **not** file a public issue with exploit details.

Report suspected vulnerabilities privately to the author, **Karmil Asgarally**, via the INTELLEKTRA contact channel you already use for this project. Include:

- Affected app or package (`nexus-govrn`, `@nexus/files`, …)
- What a caller can do that they should not
- Reproduction that stays within a system you are allowed to test

Do not attach customer data. We will treat the report as confidential.
