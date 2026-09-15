
```
my-monorepo/
├── apps/                 # Excluded from pnpm workspace
│   ├── meteor-app-1/     # Uses 'meteor npm' internally
│   └── meteor-app-2/     # Uses 'meteor npm' internally
├── packages/             # Included in pnpm workspace
│   ├── nexus-ui/         # JS Library
│   ├── api-client/       # JS Library
│   ├── arelle-service/   # Python / Arelle XBRL container
│   │   ├── Dockerfile
│   │   └── requirements.txt (Managed via pip/poetry, ignored by pnpm)
├── package.json          # Root scripts to run global tasks
└── pnpm-workspace.yaml   # Configured to only watch JS package directories
```