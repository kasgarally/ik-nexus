/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Validate optional image data URLs
 */
export function readOptionalImageDataUrl(Meteor, value, maxBytes, fieldName) {
  if (value == null || value === '') {
    return undefined
  }

  if (typeof value !== 'string' || !value.startsWith('data:image/')) {
    throw new Meteor.Error('invalid-image', `${fieldName} must be an image data URL`)
  }

  const comma = value.indexOf(',')
  if (comma < 0) {
    throw new Meteor.Error('invalid-image', `${fieldName} must be an image data URL`)
  }

  const bytes = Math.floor((value.length - comma - 1) * 0.75)
  if (bytes > maxBytes) {
    throw new Meteor.Error('image-too-large', `${fieldName} exceeds ${maxBytes} bytes`)
  }

  return value
}
