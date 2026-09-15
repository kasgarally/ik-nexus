/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * registerWithMeteor injection and required APIs
 */
import { describe, expect, it, vi } from 'vitest'

function clientApis(overrides = {}) {
  return {
    Meteor: { isServer: false, startup: vi.fn(), methods: vi.fn() },
    Mongo: {
      Collection: class {
        constructor(name) {
          this.name = name
        }

        createIndexAsync() {
          return Promise.resolve()
        }
      },
    },
    check: () => {},
    Match: { Any: 'Any' },
    Random: { id: () => 'rid' },
    Roles: { userIsInRoleAsync: async () => false },
    ...overrides,
  }
}

function serverApis(overrides = {}) {
  return clientApis({
    Meteor: { isServer: true, startup: vi.fn(), methods: vi.fn(), publish: vi.fn() },
    MongoInternals: {
      NpmModule: {
        GridFSBucket: class {
          constructor() {}
        },
        ObjectId: class {
          constructor(hex) {
            this.hex = hex
          }

          toHexString() {
            return this.hex
          }
        },
      },
      defaultRemoteCollectionDriver() {
        return { mongo: { db: {} } }
      },
    },
    WebApp: { connectHandlers: { use: vi.fn() } },
    ...overrides,
  })
}

async function loadRegister() {
  vi.resetModules()
  return import('../src/register.js')
}

describe('@nexus/files registerWithMeteor', () => {
  it('throws when Meteor APIs have not been injected yet', async () => {
    const { getMeteorApis } = await loadRegister()
    expect(() => getMeteorApis()).toThrow(/registerWithMeteor before using/)
  })

  it('rejects a missing APIs object', async () => {
    const { registerWithMeteor } = await loadRegister()
    expect(() => registerWithMeteor(null)).toThrow(/requires an object/)
  })

  it('lists missing client APIs', async () => {
    const { registerWithMeteor } = await loadRegister()
    expect(() => registerWithMeteor({ Meteor: { isServer: false } })).toThrow(
      /missing: Mongo, check, Match, Random, Roles/,
    )
  })

  it('requires MongoInternals and WebApp on the server', async () => {
    const { registerWithMeteor } = await loadRegister()
    expect(() =>
      registerWithMeteor({
        Meteor: { isServer: true },
        Mongo: { Collection: class {} },
        check: () => {},
        Match: {},
        Random: {},
        Roles: {},
      }),
    ).toThrow(/missing: MongoInternals, WebApp/)
  })

  it('creates the nexus_files collection on the client', async () => {
    const { registerWithMeteor, getFilesCollection, getMeteorApis } = await loadRegister()
    registerWithMeteor(clientApis())
    expect(getFilesCollection().name).toBe('nexus_files')
    expect(getMeteorApis().Meteor.isServer).toBe(false)
  })

  it('rejects a second registerWithMeteor call', async () => {
    const { registerWithMeteor } = await loadRegister()
    registerWithMeteor(clientApis())
    expect(() => registerWithMeteor(clientApis())).toThrow(/already called/)
  })

  it('wires methods, publication, HTTP, and GridFS on the server', async () => {
    const apis = serverApis()
    const { registerWithMeteor, getStorageAdapter } = await loadRegister()
    registerWithMeteor(apis)
    expect(apis.Meteor.methods).toHaveBeenCalled()
    expect(apis.Meteor.publish).toHaveBeenCalled()
    expect(apis.WebApp.connectHandlers.use).toHaveBeenCalled()
    expect(apis.Meteor.startup).toHaveBeenCalled()
    expect(getStorageAdapter()).toBeTruthy()
  })
})
