/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * DDP method: translate text into other data locales
 *
 * Calls translate.google.com via google-translate-api-x. The host is fixed;
 * the caller supplies text and locale codes, never a URL.
 */
import { check } from 'meteor/check'
import { Meteor } from 'meteor/meteor'
import translateModule from 'google-translate-api-x'
import { appLocales } from '/imports/api/appLocales.js'
import { requireLoggedIn } from '/imports/api/methodHelpers.js'

const MAX_TEXT_LENGTH = 5000
const translate = readTranslate(translateModule)

Meteor.methods({
  async 'locales.translate'(params) {
    check(params, {
      text: String,
      from: String,
      to: [String],
    })
    requireLoggedIn(this.userId)

    const text = params.text.trim()
    if (!text) {
      throw new Meteor.Error('invalid-text', 'text is required')
    }
    if (text.length > MAX_TEXT_LENGTH) {
      throw new Meteor.Error('invalid-text', `text must be at most ${MAX_TEXT_LENGTH} characters`)
    }
    if (appLocales.data.length < 2) {
      throw new Meteor.Error(
        'invalid-locale',
        'translation requires at least two data locales',
      )
    }
    if (!appLocales.data.includes(params.from)) {
      throw new Meteor.Error('invalid-locale', 'from must be a data locale')
    }

    const to = uniqueDataLocales(params.to, params.from)
    const input = to.map((code) => ({
      text,
      from: params.from,
      to: code,
    }))

    try {
      const results = await translate(input, { forceBatch: true })
      return readTranslatedMap(to, results)
    } catch (error) {
      throw new Meteor.Error(
        'translate-failed',
        error?.message || 'Translation failed',
      )
    }
  },
})

function uniqueDataLocales(codes, from) {
  const to = []
  for (const code of codes) {
    if (!appLocales.data.includes(code)) {
      throw new Meteor.Error('invalid-locale', 'to must contain only data locales')
    }
    if (code === from) {
      throw new Meteor.Error('invalid-locale', 'to cannot include from')
    }
    if (!to.includes(code)) {
      to.push(code)
    }
  }
  if (to.length === 0) {
    throw new Meteor.Error('invalid-locale', 'to must list at least one data locale')
  }
  return to
}

function readTranslatedMap(to, results) {
  const rows = Array.isArray(results) ? results : [results]
  const next = {}
  for (let index = 0; index < to.length; index += 1) {
    const row = rows[index]
    if (typeof row?.text === 'string' && row.text) {
      next[to[index]] = row.text
    }
  }
  return next
}

function readTranslate(exported) {
  if (typeof exported === 'function') {
    return exported
  }
  if (typeof exported?.default === 'function') {
    return exported.default
  }
  if (typeof exported?.translate === 'function') {
    return exported.translate
  }
  throw new Error('google-translate-api-x did not export a translate function')
}
