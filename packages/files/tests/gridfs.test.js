/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * GridFS ids stay 24-char hex so Meteor.ObjectID cannot miss the blob
 */
import { describe, expect, it } from 'vitest'
import { GridFSAdapter } from '../src/gridfs.js'

class FakeObjectId {
  constructor(hex) {
    this.hex = hex
  }

  toHexString() {
    return this.hex
  }
}

class FakeGridFSBucket {
  constructor() {}
}

function createAdapter() {
  return new GridFSAdapter({
    db: {},
    GridFSBucket: FakeGridFSBucket,
    ObjectId: FakeObjectId,
  })
}

describe('@nexus/files GridFSAdapter.toNativeObjectId', () => {
  it('requires db, GridFSBucket, and ObjectId', () => {
    expect(() => new GridFSAdapter({})).toThrow(/requires db, GridFSBucket, and ObjectId/)
  })

  it('accepts a 24-character hex string', () => {
    const hex = '6aa917aaaaaaaaaaaaaaaaaa'
    const native = createAdapter().toNativeObjectId(hex)
    expect(native).toBeInstanceOf(FakeObjectId)
    expect(native.hex).toBe(hex)
  })

  it('reads Meteor.ObjectID via _str so GridFS find does not miss', () => {
    const hex = '6aa917bbbbbbbbbbbbbbbbbb'
    const native = createAdapter().toNativeObjectId({ _str: hex })
    expect(native.hex).toBe(hex)
  })

  it('reads a native ObjectId via toHexString', () => {
    const hex = '6aa917cccccccccccccccccc'
    const native = createAdapter().toNativeObjectId(new FakeObjectId(hex))
    expect(native.hex).toBe(hex)
  })

  it('rejects a value that is not a 24-character hex id', () => {
    expect(() => createAdapter().toNativeObjectId('not-an-objectid')).toThrow(
      /24-character hex string/,
    )
  })
})
