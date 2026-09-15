/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Image data-URL validation for logo and icon
 */
import { describe, expect, it } from 'vitest'
import { readOptionalImageDataUrl } from '../src/images.js'

class MeteorError extends Error {
  constructor(error, reason) {
    super(reason)
    this.error = error
    this.reason = reason
  }
}

const Meteor = { Error: MeteorError }

function imageDataUrl(payloadLength) {
  return `data:image/png;base64,${'A'.repeat(payloadLength)}`
}

describe('@nexus/setup image data URLs', () => {
  it('treats a missing or empty value as omitted', () => {
    expect(readOptionalImageDataUrl(Meteor, null, 100, 'logo')).toBeUndefined()
    expect(readOptionalImageDataUrl(Meteor, '', 100, 'logo')).toBeUndefined()
  })

  it('rejects a value that is not an image data URL', () => {
    expect(() => readOptionalImageDataUrl(Meteor, 'https://example.com/logo.png', 100, 'logo')).toThrow(
      /must be an image data URL/,
    )
    expect(() => readOptionalImageDataUrl(Meteor, 'data:image/png;base64', 100, 'logo')).toThrow(
      /must be an image data URL/,
    )
  })

  it('rejects a payload larger than the byte limit', () => {
    const tooLarge = imageDataUrl(200)
    expect(() => readOptionalImageDataUrl(Meteor, tooLarge, 10, 'icon')).toThrow(/exceeds 10 bytes/)
  })

  it('returns the same data URL when it is an image under the limit', () => {
    const value = imageDataUrl(8)
    expect(readOptionalImageDataUrl(Meteor, value, 100, 'logo')).toBe(value)
  })
})
