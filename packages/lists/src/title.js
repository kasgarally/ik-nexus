/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Localized label for a list item
 */
export function title(item, locale) {
  if (!item) {
    return ''
  }

  const localized = item.title?.[locale]
  if (typeof localized === 'string' && localized) {
    return localized
  }

  if (typeof item.title?.en === 'string' && item.title.en) {
    return item.title.en
  }

  return item.code || ''
}
