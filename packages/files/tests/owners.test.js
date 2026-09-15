/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * defineOwner validation and registry
 */
import { describe, expect, it } from 'vitest'
import { defineOwner, getRegisteredOwner, listOwnerTypes } from '../src/owners.js'

function fakeCollection() {
  return { findOneAsync: async () => null }
}

function validRoles() {
  return {
    upload: 'files.demo.upload',
    download: 'files.demo.download',
    remove: 'files.demo.remove',
  }
}

describe('@nexus/files defineOwner', () => {
  it('rejects a missing type', () => {
    expect(() => defineOwner({ collection: fakeCollection(), roles: validRoles() })).toThrow(
      /requires a string type/,
    )
  })

  it('rejects a collection that cannot look up a parent', () => {
    expect(() => defineOwner({ type: 'broken', collection: {}, roles: validRoles() })).toThrow(
      /requires a Meteor collection/,
    )
  })

  it('rejects missing upload download or remove roles', () => {
    expect(() =>
      defineOwner({ type: 'noroles', collection: fakeCollection(), roles: { upload: 'only' } }),
    ).toThrow(/requires roles.upload/)
  })

  it('stores allowAnonymous and returns the owner by type', () => {
    const collection = fakeCollection()
    defineOwner({
      type: 'demo-owners-test',
      collection,
      roles: validRoles(),
      allowAnonymous: true,
    })

    const owner = getRegisteredOwner('demo-owners-test')
    expect(owner.allowAnonymous).toBe(true)
    expect(owner.collection).toBe(collection)
    expect(listOwnerTypes()).toContain('demo-owners-test')
  })

  it('returns null for a type that was never registered', () => {
    expect(getRegisteredOwner('does-not-exist')).toBeNull()
  })
})
