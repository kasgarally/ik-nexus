#!/usr/bin/env bash
# Author: Karmil Asgarally - INTELLEKTRA © 2026
# Dump Mongo (including GridFS) and keep dated archives off the data disk
set -euo pipefail

# Uploads live in Mongo GridFS (nexus_fs.*), not a host folder.
# DigitalOcean Spaces is fine for these .tar.gz archives. It is not a
# WiredTiger dbpath.

APP_NAME="${NEXUS_APP_NAME:-nexus-govrn}"
ENV_FILE="${NEXUS_ENV_FILE:-${HOME}/etc/${APP_NAME}.env}"
BACKUP_ROOT="${NEXUS_BACKUP_ROOT:-${HOME}/backups/${APP_NAME}}"
KEEP_DAYS="${NEXUS_BACKUP_KEEP_DAYS:-14}"

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

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
work="${BACKUP_ROOT}/work-${stamp}"
archive="${BACKUP_ROOT}/${APP_NAME}-${stamp}.tar.gz"

mkdir -p "${BACKUP_ROOT}" "${work}"

mongodump --uri="${MONGO_URL}" --out="${work}"
tar -C "${work}" -czf "${archive}" .
rm -rf "${work}"

find "${BACKUP_ROOT}" -type f -name "${APP_NAME}-*.tar.gz" -mtime "+${KEEP_DAYS}" -delete

echo "Wrote ${archive}"
echo "Copy this file off the droplet (scp, rclone to Spaces, or another region)."
