/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Stop the Node process listening on a TCP port (stale Meteor after a closed terminal)
 *
 * Usage (repo root):
 *   node scripts/kill-port.mjs
 *   node scripts/kill-port.mjs 3000
 *
 * npm:
 *   pnpm run kill-port
 *   pnpm run kill-port -- 3001
 *   meteor npm run kill-port   (from an app folder)
 */
import { spawnSync } from 'node:child_process'

const DEFAULT_PORT = 3000
const isWindows = process.platform === 'win32'

function parsePort(argument) {
  const port = Number(argument ?? DEFAULT_PORT)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Port must be an integer from 1 to 65535 (got ${argument})`)
  }
  return port
}

function run(command, args) {
  return spawnSync(command, args, { encoding: 'utf8' })
}

function localAddressUsesPort(address, port) {
  const suffix = `:${port}`
  return address.endsWith(suffix)
}

function listListeningPidsWindows(port) {
  const result = run('netstat', ['-ano', '-p', 'tcp'])
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || 'netstat failed')
  }
  const pids = new Set()
  for (const line of result.stdout.split(/\r?\n/)) {
    if (!line.includes('LISTENING')) {
      continue
    }
    const columns = line.trim().split(/\s+/)
    const localAddress = columns[1] || ''
    if (!localAddressUsesPort(localAddress, port)) {
      continue
    }
    const pid = Number(columns[columns.length - 1])
    if (Number.isInteger(pid) && pid > 0) {
      pids.add(pid)
    }
  }
  return [...pids]
}

function listListeningPidsUnix(port) {
  const result = run('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'])
  if (result.status === 1 && !result.stdout.trim()) {
    return []
  }
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(result.stderr.trim() || 'lsof failed (install lsof to list listeners)')
  }
  const pids = new Set()
  for (const line of result.stdout.split(/\r?\n/)) {
    const pid = Number(line.trim())
    if (Number.isInteger(pid) && pid > 0) {
      pids.add(pid)
    }
  }
  return [...pids]
}

function processImageNameWindows(pid) {
  const result = run('tasklist', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'])
  if (result.status !== 0 || !result.stdout.trim()) {
    return ''
  }
  const firstField = result.stdout.trim().split(',')[0] || ''
  return firstField.replaceAll('"', '')
}

function processImageNameUnix(pid) {
  const result = run('ps', ['-p', String(pid), '-o', 'comm='])
  if (result.status !== 0) {
    return ''
  }
  return result.stdout.trim()
}

function isNodeProcess(imageName) {
  const name = imageName.toLowerCase()
  return (
    name === 'node' ||
    name === 'node.exe' ||
    name.includes('meteor')
  )
}

function killWindows(pid) {
  // /T stops Meteor's child processes (Rspack, local Mongo) with the listener.
  const result = run('taskkill', ['/PID', String(pid), '/T', '/F'])
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || result.stdout.trim() || `taskkill failed for ${pid}`)
  }
}

function killUnix(pid) {
  try {
    process.kill(pid, 'SIGTERM')
  } catch (error) {
    throw new Error(`Could not signal ${pid}: ${error.message}`)
  }
}

function main() {
  const port = parsePort(process.argv[2])
  const pids = isWindows ? listListeningPidsWindows(port) : listListeningPidsUnix(port)
  const imageNameOf = isWindows ? processImageNameWindows : processImageNameUnix

  if (pids.length === 0) {
    console.log(`Nothing listening on port ${port}`)
    return
  }

  let stopped = 0
  for (const pid of pids) {
    if (pid === process.pid) {
      continue
    }
    const imageName = imageNameOf(pid) || 'unknown'
    if (!isNodeProcess(imageName)) {
      console.log(`Port ${port} is held by ${imageName} (pid ${pid}); not a Node process, left running`)
      continue
    }
    if (isWindows) {
      killWindows(pid)
    } else {
      killUnix(pid)
    }
    stopped += 1
    console.log(`Stopped ${imageName} (pid ${pid}) on port ${port}`)
  }

  if (stopped === 0) {
    process.exitCode = 1
  }
}

try {
  main()
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
