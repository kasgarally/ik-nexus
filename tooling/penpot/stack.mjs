#!/usr/bin/env node
/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Cross-platform lifecycle and backup runner for local Penpot
 */

import { randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const toolingDir = path.dirname(fileURLToPath(import.meta.url))
const composeFile = path.join(toolingDir, 'docker-compose.yml')
const envFile = path.join(toolingDir, '.env')
const backupsDir = path.join(toolingDir, 'backups')
const penpotUrl = 'http://localhost:9001'
const commands = new Set([
  'init',
  'up',
  'down',
  'restart',
  'logs',
  'ps',
  'pull',
  'backup',
])

function fail(message) {
  console.error(message)
  process.exit(1)
}

function usage() {
  console.log(`Usage: node tooling/penpot/stack.mjs <command> [flags]

Commands:
  init             Create the gitignored .env with random secrets
  up               Start Penpot and wait until its web UI responds
  down             Stop Penpot; add --volumes to permanently erase its data
  restart          Restart the running containers
  logs             Follow container logs
  ps               Show container status
  pull             Pull the pinned images
  backup           Dump PostgreSQL and archive assets into backups/
`)
}

function composeArgs(extraArgs) {
  return [
    'compose',
    '--project-directory',
    toolingDir,
    '--file',
    composeFile,
    '--env-file',
    envFile,
    ...extraArgs,
  ]
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options,
    })

    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error(`${command} was not found on PATH.`))
        return
      }
      reject(error)
    })

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`))
    })
  })
}

async function runDocker(args, options = {}) {
  try {
    await runProcess('docker', args, options)
  } catch (error) {
    if (error.message.includes('was not found on PATH')) {
      throw new Error('docker was not found on PATH. Install and start Docker Desktop.')
    }
    throw error
  }
}

async function envExists() {
  try {
    await fs.access(envFile)
    return true
  } catch {
    return false
  }
}

async function requireEnv() {
  if (!(await envExists())) {
    throw new Error('Missing tooling/penpot/.env. Run pnpm penpot:init first.')
  }
}

function randomSecret(bytes) {
  return randomBytes(bytes).toString('base64url')
}

async function initializeEnv() {
  if (await envExists()) {
    console.log('tooling/penpot/.env already exists; leaving its secrets unchanged.')
    return
  }

  const contents = `# Author: Karmil Asgarally - INTELLEKTRA © 2026
# Generated local Penpot configuration — never commit this file

PENPOT_VERSION=2.17.2
PENPOT_PORT=9001
PENPOT_MAILCATCH_PORT=1080
PENPOT_PUBLIC_URI=http://localhost:9001
PENPOT_HTTP_SERVER_MAX_BODY_SIZE=367001600
PENPOT_SECRET_KEY=${randomSecret(64)}
PENPOT_DATABASE_PASSWORD=${randomSecret(32)}
`

  await fs.writeFile(envFile, contents, { encoding: 'utf8', flag: 'wx' })
  console.log('Created tooling/penpot/.env with random local secrets.')
}

function waitForHttp(url, timeoutMs = 15 * 60 * 1000) {
  const deadline = Date.now() + timeoutMs

  return new Promise((resolve, reject) => {
    const retry = () => {
      if (Date.now() >= deadline) {
        reject(new Error(`Timed out waiting for ${url}`))
        return
      }
      setTimeout(attempt, 3000)
    }

    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume()
        if (response.statusCode >= 200 && response.statusCode < 500) {
          resolve()
          return
        }
        retry()
      })
      request.on('error', retry)
      request.setTimeout(5000, () => {
        request.destroy()
        retry()
      })
    }

    attempt()
  })
}

function backupTimestamp() {
  return new Date().toISOString().replace(/:/g, '-').replace(/\.\d{3}Z$/, 'Z')
}

async function writeCommandOutput({ command, args, outputFile }) {
  const output = await fs.open(outputFile, 'wx')
  try {
    await runProcess(command, args, {
      stdio: ['ignore', output.fd, 'inherit'],
    })
  } catch (error) {
    await output.close()
    await fs.rm(outputFile, { force: true })
    throw error
  }
  await output.close()
}

async function backupPenpot() {
  await requireEnv()
  const destination = path.join(backupsDir, backupTimestamp())
  await fs.mkdir(destination, { recursive: true })

  try {
    const databaseFile = path.join(destination, 'database.dump')
    console.log(`Writing ${databaseFile} ...`)
    await writeCommandOutput({
      command: 'docker',
      args: composeArgs([
        'exec',
        '-T',
        'penpot-postgres',
        'pg_dump',
        '--username=penpot',
        '--format=custom',
        'penpot',
      ]),
      outputFile: databaseFile,
    })

    const assetsFile = path.join(destination, 'assets.tar.gz')
    console.log(`Writing ${assetsFile} ...`)
    await writeCommandOutput({
      command: 'docker',
      args: [
        'run',
        '--rm',
        '--volume',
        'nexus-penpot-assets:/source:ro',
        'alpine:3.22',
        'tar',
        '-czf',
        '-',
        '-C',
        '/source',
        '.',
      ],
      outputFile: assetsFile,
    })

    console.log(`Backup complete: ${destination}`)
    console.log('Keep database.dump and assets.tar.gz together as one backup set.')
  } catch (error) {
    await fs.rm(destination, { recursive: true, force: true })
    throw error
  }
}

async function main() {
  const [command, ...flags] = process.argv.slice(2)

  if (!command || command === 'help' || flags.includes('--help')) {
    usage()
    process.exit(command ? 0 : 1)
  }
  if (!commands.has(command)) {
    usage()
    fail(`Unknown command "${command}".`)
  }

  if (command === 'init') {
    await initializeEnv()
    return
  }

  await requireEnv()

  if (command === 'up') {
    await runDocker(composeArgs(['up', '--detach']))
    console.log(`Waiting for ${penpotUrl} ...`)
    try {
      await waitForHttp(penpotUrl)
      console.log(`Penpot is ready at ${penpotUrl}`)
    } catch (error) {
      await runDocker(composeArgs(['logs', '--tail', '100'])).catch(() => {})
      throw error
    }
    return
  }

  if (command === 'down') {
    const extraArgs = flags.includes('--volumes')
      ? ['down', '--volumes']
      : ['down']
    await runDocker(composeArgs(extraArgs))
    return
  }

  if (command === 'restart') {
    await runDocker(composeArgs(['restart']))
    return
  }

  if (command === 'logs') {
    await runDocker(composeArgs(['logs', '--follow', ...flags]))
    return
  }

  if (command === 'ps') {
    await runDocker(composeArgs(['ps']))
    return
  }

  if (command === 'pull') {
    await runDocker(composeArgs(['pull']))
    return
  }

  if (command === 'backup') {
    await backupPenpot()
  }
}

main().catch((error) => {
  fail(error.message)
})
