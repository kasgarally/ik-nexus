/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Run Meteor mocha with a spec reporter; ignore Windows --once abort
 *
 * meteor test --once can crash libuv on Windows after a green suite
 * (UV_HANDLE_CLOSING). If mocha printed only passes, exit 0.
 */
import { spawn } from 'node:child_process'

const watch = process.argv.includes('--watch')

process.env.SERVER_TEST_REPORTER = 'spec'
process.env.CLIENT_TEST_REPORTER = 'spec'
process.env.MOCHA_TIMEOUT = '30000'
if (watch) {
  process.env.TEST_WATCH = '1'
}

const meteorArgs = ['test', '--full-app', '--driver-package', 'meteortesting:mocha']
if (!watch) {
  meteorArgs.splice(1, 0, '--once')
}

const child = spawn('meteor', meteorArgs, {
  env: process.env,
  shell: true,
})

let combined = ''

child.stdout.on('data', (chunk) => {
  const text = String(chunk)
  combined += text
  process.stdout.write(text)
})

child.stderr.on('data', (chunk) => {
  const text = String(chunk)
  combined += text
  process.stderr.write(text)
})

child.on('exit', (code) => {
  const hasFailure = /\d+ failing/.test(combined)
  const hasPassing = /\d+ passing/.test(combined)
  if (code && hasPassing && !hasFailure) {
    process.exit(0)
    return
  }
  process.exit(code ?? 1)
})
