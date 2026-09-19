#!/usr/bin/env bash
# Author: Karmil Asgarally - INTELLEKTRA © 2026
# Restore a mongodump archive produced by deploy/scripts/backup.sh
set -euo pipefail

APP_NAME="${NEXUS_APP_NAME:-nexus-govrn}"
ENV_FILE="${NEXUS_ENV_FILE:-${HOME}/etc/${APP_NAME}.env}"
ARCHIVE="${1:-}"

if [[ -z "${ARCHIVE}" || ! -f "${ARCHIVE}" ]]; then
  echo "Usage: NEXUS_APP_NAME=<app> $0 /path/to/<app>-YYYYMMDDTHHMMSSZ.tar.gz" >&2
  exit 1
fi

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing env file: ${ENV_FILE}" >&2
  exit 1
fi

# Do not `source` the env file: METEOR_SETTINGS is JSON and can break bash.
MONGO_URL="$(grep -E '^MONGO_URL=' "${ENV_FILE}" | head -n 1 | cut -d= -f2-)"
MONGO_URL="${MONGO_URL%\"}"
MONGO_URL="${MONGO_URL#\"}"

if [[ -z "${MONGO_URL}" ]]; then
  echo "MONGO_URL is empty in ${ENV_FILE}" >&2
  exit 1
fi

work="$(mktemp -d)"
trap 'rm -rf "${work}"' EXIT

tar -C "${work}" -xzf "${ARCHIVE}"

# Archive root is the mongodump output (database folder names).
mongorestore --uri="${MONGO_URL}" --drop "${work}"

echo "Restored ${ARCHIVE} into the database from MONGO_URL"
