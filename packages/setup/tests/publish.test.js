/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * setup.public projects only branding fields
 */
import { describe, expect, it, vi } from 'vitest'
import { registerPublication } from '../src/publish.js'

describe('@nexus/setup publication', () => {
  it('publishes only companyName logoDataUrl and iconDataUrl for current', () => {
    const find = vi.fn().mockReturnValue('cursor')
    let publishHandler
    const Meteor = {
      publish(name, handler) {
        expect(name).toBe('setup.public')
        publishHandler = handler
      },
    }

    registerPublication({ Meteor, setupCollection: { find } })
    const cursor = publishHandler.call({})

    expect(cursor).toBe('cursor')
    expect(find).toHaveBeenCalledWith(
      { _id: 'current' },
      { fields: { companyName: 1, logoDataUrl: 1, iconDataUrl: 1 } },
    )
  })
})
