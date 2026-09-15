/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Run Vitest then copy the HTML report to reports/vitest
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

const extraArgs = process.argv.slice(2)
const vitestCli = path.join(repoRoot, 'node_modules', 'vitest', 'vitest.mjs')
const result = spawnSync(process.execPath, [vitestCli, 'run', ...extraArgs], {
  cwd: repoRoot,
  stdio: 'inherit',
})

const generated = path.join(repoRoot, '.vitest')
const destination = path.join(repoRoot, 'reports', 'vitest')
if (existsSync(generated)) {
  mkdirSync(destination, { recursive: true })
  cpSync(generated, destination, { recursive: true })
}

process.exit(result.status ?? 1)
