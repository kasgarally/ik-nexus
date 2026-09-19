/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Strip comments from a Meteor settings.jsonc and write settings.json
 *
 * Run from any Meteor app directory:
 *   node ../../scripts/build-settings.mjs
 *   node ../../scripts/build-settings.mjs path/to/settings.jsonc path/to/settings.json
 *
 * Defaults: ./settings.jsonc → ./settings.json (cwd).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

export function stripJsonc(source) {
  let output = ''
  let index = 0
  let inString = false
  let quote = ''
  let escaped = false

  while (index < source.length) {
    const character = source[index]
    const next = source[index + 1]

    if (inString) {
      output += character
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === quote) {
        inString = false
      }
      index += 1
      continue
    }

    if (character === '"' || character === "'") {
      inString = true
      quote = character
      output += character
      index += 1
      continue
    }

    if (character === '/' && next === '/') {
      index += 2
      while (index < source.length && source[index] !== '\n') {
        index += 1
      }
      continue
    }

    if (character === '/' && next === '*') {
      index += 2
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        index += 1
      }
      index += 2
      continue
    }

    output += character
    index += 1
  }

  return output
}

export function readSettingsJsonc(sourcePath) {
  return JSON.parse(stripJsonc(readFileSync(sourcePath, 'utf8')))
}

function sameFilesystemPath(left, right) {
  const a = normalize(left)
  const b = normalize(right)
  return process.platform === 'win32'
    ? a.toLowerCase() === b.toLowerCase()
    : a === b
}

const invokedDirectly = process.argv[1]
  && sameFilesystemPath(fileURLToPath(import.meta.url), resolve(process.argv[1]))

if (invokedDirectly) {
  const sourcePath = resolve(process.cwd(), process.argv[2] || 'settings.jsonc')
  const targetPath = resolve(process.cwd(), process.argv[3] || 'settings.json')
  const parsed = readSettingsJsonc(sourcePath)
  writeFileSync(targetPath, `${JSON.stringify(parsed, null, 2)}\n`)
  console.log(`Wrote ${targetPath}`)
}
