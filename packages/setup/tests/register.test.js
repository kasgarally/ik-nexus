/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * registerWithMeteor injection and required APIs
 */
import { describe, expect, it, vi } from 'vitest'

function clientApis(overrides = {}) {
  return {
    Meteor: { isServer: false, startup: vi.fn(), methods: vi.fn(), publish: vi.fn() },
    Mongo: {
      Collection: class {
        constructor(name) {
          this.name = name
          this.deny = vi.fn()
        }

        createIndexAsync() {
          return Promise.resolve()
        }
      },
    },
    check: () => {},
    Match: { Maybe: () => 'Maybe' },
    Roles: { createRoleAsync: async () => {}, addUsersToRolesAsync: async () => {} },
    Accounts: { createUser: () => 'user-1' },
    ...overrides,
  }
}

function serverApis(overrides = {}) {
  return clientApis({
    Meteor: {
      isServer: true,
      startup: vi.fn((callback) => callback()),
      methods: vi.fn(),
      publish: vi.fn(),
    },
    ...overrides,
  })
}

async function loadRegister() {
  vi.resetModules()
  return import('../src/register.js')
}

describe('@nexus/setup registerWithMeteor', () => {
  it('throws when Meteor APIs have not been injected yet', async () => {
    const { getMeteorApis } = await loadRegister()
    expect(() => getMeteorApis()).toThrow(/registerWithMeteor before using/)
  })

  it('rejects a missing APIs object', async () => {
    const { registerWithMeteor } = await loadRegister()
    expect(() => registerWithMeteor(null)).toThrow(/requires an object/)
  })

  it('lists missing APIs', async () => {
    const { registerWithMeteor } = await loadRegister()
    expect(() => registerWithMeteor({ Meteor: { isServer: false } })).toThrow(
      /missing: Mongo, check, Match, Roles, Accounts/,
    )
  })

  it('creates the nexus_setup collection on the client and denies writes', async () => {
    const apis = clientApis()
    const { registerWithMeteor, getSetupCollection } = await loadRegister()
    registerWithMeteor(apis)
    expect(getSetupCollection().name).toBe('nexus_setup')
    expect(getSetupCollection().deny).toHaveBeenCalled()
    expect(apis.Meteor.methods).not.toHaveBeenCalled()
    expect(apis.Meteor.publish).not.toHaveBeenCalled()
  })

  it('rejects a second registerWithMeteor call', async () => {
    const { registerWithMeteor } = await loadRegister()
    registerWithMeteor(clientApis())
    expect(() => registerWithMeteor(clientApis())).toThrow(/already called/)
  })

  it('wires methods, publication, and indexes on the server', async () => {
    const apis = serverApis()
    const { registerWithMeteor } = await loadRegister()
    registerWithMeteor(apis)
    expect(apis.Meteor.methods).toHaveBeenCalled()
    expect(apis.Meteor.publish).toHaveBeenCalled()
    expect(apis.Meteor.startup).toHaveBeenCalled()
  })
})
