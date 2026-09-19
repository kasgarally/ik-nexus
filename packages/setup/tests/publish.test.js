/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * setup.public projects only branding fields
 */
import { describe, expect, it, vi } from 'vitest'
import { registerPublication } from '../src/publish.js'

describe('@nexus/setup publication', () => {
  it('publishes only companyName logoDataUrl and iconDataUrl for current', () => {
    const find = vi.fn().mockReturnValue('cursor')
    const handlers = {}
    const Meteor = {
      publish(name, handler) {
        handlers[name] = handler
      },
    }

    registerPublication({ Meteor, Roles: {}, setupCollection: { find } })
    const cursor = handlers['setup.public'].call({})

    expect(cursor).toBe('cursor')
    expect(find).toHaveBeenCalledWith(
      { _id: 'current' },
      { fields: { companyName: 1, logoDataUrl: 1, iconDataUrl: 1 } },
    )
  })
})
