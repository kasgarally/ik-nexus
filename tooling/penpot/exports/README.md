<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Versioned Penpot design milestone policy
-->
# Penpot design exports

This folder stores selected, reviewable milestones exported from the local Penpot workspace.

## Contents

- [What to commit](#what-to-commit)
- [Naming](#naming)
- [Export](#export)
- [Import](#import)
- [Limitations](#limitations)

## What to commit

Commit an export when it records a meaningful design-system or screen milestone that another developer may need to import. Do not commit routine backups, throwaway explorations, secrets, client data, or unnecessary large media.

Before committing, inspect the file size and include the reason for the milestone in the commit message. Operational PostgreSQL and asset backups belong in the gitignored `../backups/` directory.

## Naming

Use lowercase kebab-case:

```text
<area>-YYYY-MM-DD-<purpose>.penpot
```

Examples:

```text
nexus-ui-2026-09-18-account-settings.penpot
govrn-2026-09-18-books-workspace.penpot
```

Use a new dated export for a milestone instead of overwriting unrelated history.

## Export

From the file card menu or workspace menu, choose **Download**. When shared libraries are involved, prefer **Export shared libraries** so links remain intact. Save the resulting file in this directory.

## Import

Open a Penpot project menu, choose **Import files**, select the `.penpot` file, review the detected contents, and confirm the import.

## Limitations

A `.penpot` file is a ZIP archive containing readable JSON and binary assets. Git stores it as a binary file: normal line diffs and merge conflict resolution do not apply. It is a portable design milestone, not a complete backup of users, teams, every project, PostgreSQL, or the assets volume.
