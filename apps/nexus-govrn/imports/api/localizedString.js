/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * SimpleSchema for a data-locale string map
 *
 * Keys come from locales.data. defaultData is always en, so title.en
 * (or the matching field.en) is required unless the map is optional.
 */
import { appLocales } from '/imports/api/appLocales.js'
import { SimpleSchema } from '/imports/api/methodHelpers.js'

export function localizedStringSchema({ optional = false } = {}) {
  const fields = {}

  for (const code of appLocales.data) {
    const required = !optional && code === appLocales.defaultData
    fields[code] = {
      type: String,
      optional: !required,
      defaultValue: '',
      label: code,
    }
    if (required) {
      fields[code].min = 1
    }
  }

  return new SimpleSchema(fields)
}
