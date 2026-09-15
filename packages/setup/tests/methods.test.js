/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * setup.complete and setup.isComplete contracts
 */
import { describe, expect, it, vi } from 'vitest'
import { METHOD_COMPLETE, METHOD_IS_COMPLETE, SETUP_DOC_ID } from '../src/constants.js'
import { registerMethods } from '../src/methods.js'

class MeteorError extends Error {
  constructor(error, reason) {
    super(reason)
    this.error = error
    this.reason = reason
  }
}

function validPayload(overrides = {}) {
  return {
    companyName: 'Acme',
    legalName: 'Acme Ltd',
    website: 'https://acme.example',
    phone: '+230 000',
    email: 'hello@acme.example',
    address: { city: 'Port Louis', country: 'Mauritius' },
    admin: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'longenough',
    },
    ...overrides,
  }
}

function createHarness({ existing = null, insertError = null } = {}) {
  const inserted = []
  const methods = {}
  const Meteor = {
    Error: MeteorError,
    release: 'METEOR@3.0.0',
    methods(map) {
      Object.assign(methods, map)
    },
  }
  const setupCollection = {
    async findOneAsync(id) {
      if (existing && id === SETUP_DOC_ID) {
        return existing
      }
      return inserted.find((document) => document._id === id) || null
    },
    async insertAsync(document) {
      if (insertError) {
        throw insertError
      }
      inserted.push(document)
      return document._id
    },
  }
  const Roles = {
    createRoleAsync: vi.fn().mockResolvedValue(undefined),
    addUsersToRolesAsync: vi.fn().mockResolvedValue(undefined),
  }
  const Accounts = {
    createUserAsync: vi.fn().mockResolvedValue('user-ada'),
  }
  const runAsSystem = vi.fn(async (work) => work())

  registerMethods({
    Meteor,
    check: () => {},
    Match: { Maybe: () => 'Maybe' },
    Roles,
    Accounts,
    setupCollection,
    runAsSystem,
  })

  return { methods, inserted, Roles, Accounts, runAsSystem }
}

describe('@nexus/setup methods', () => {
  it('reports incomplete when the singleton is missing', async () => {
    const { methods } = createHarness()
    await expect(methods[METHOD_IS_COMPLETE]()).resolves.toEqual({ complete: false })
  })

  it('reports complete when the singleton already exists', async () => {
    const { methods } = createHarness({ existing: { _id: SETUP_DOC_ID } })
    await expect(methods[METHOD_IS_COMPLETE]()).resolves.toEqual({ complete: true })
  })

  it('inserts the current singleton, creates roles, and does not store the password', async () => {
    const { methods, inserted, Roles, Accounts, runAsSystem } = createHarness()
    await expect(methods[METHOD_COMPLETE](validPayload())).resolves.toEqual({ ok: true })

    expect(Roles.createRoleAsync).toHaveBeenCalledWith('superadmin', { unlessExists: true })
    expect(Roles.createRoleAsync).toHaveBeenCalledWith('admin', { unlessExists: true })
    expect(Accounts.createUserAsync).toHaveBeenCalledWith({
      email: 'ada@example.com',
      password: 'longenough',
      profile: { name: 'Ada Lovelace' },
    })
    expect(Roles.addUsersToRolesAsync).toHaveBeenCalledWith('user-ada', ['superadmin', 'admin'])
    expect(runAsSystem).toHaveBeenCalled()

    expect(inserted).toHaveLength(1)
    const document = inserted[0]
    expect(document._id).toBe('current')
    expect(document.companyName).toBe('Acme')
    expect(document.address.city).toBe('Port Louis')
    expect(document.firstAdminUserId).toBe('user-ada')
    expect(document.meteorRelease).toBe('METEOR@3.0.0')
    expect(document).not.toHaveProperty('password')
    expect(JSON.stringify(document)).not.toContain('longenough')
  })

  it('throws setup-already-complete on a second complete', async () => {
    const { methods } = createHarness({ existing: { _id: SETUP_DOC_ID } })
    await expect(methods[METHOD_COMPLETE](validPayload())).rejects.toMatchObject({
      error: 'setup-already-complete',
    })
  })

  it('rejects a blank company name and a short password', async () => {
    const { methods } = createHarness()
    await expect(methods[METHOD_COMPLETE](validPayload({ companyName: '   ' }))).rejects.toMatchObject({
      error: 'invalid-company',
    })
    await expect(
      methods[METHOD_COMPLETE](
        validPayload({
          admin: { name: 'Ada', email: 'ada@example.com', password: 'short' },
        }),
      ),
    ).rejects.toMatchObject({ error: 'invalid-password' })
  })

  it('maps a duplicate-key insert to setup-already-complete', async () => {
    const { methods } = createHarness({ insertError: new Error('E11000 duplicate key') })
    await expect(methods[METHOD_COMPLETE](validPayload())).rejects.toMatchObject({
      error: 'setup-already-complete',
    })
  })

  it('falls back to Accounts.createUser when createUserAsync is missing', async () => {
    const { methods, Accounts } = createHarness()
    delete Accounts.createUserAsync
    Accounts.createUser = vi.fn().mockReturnValue('user-sync')
    await methods[METHOD_COMPLETE](validPayload())
    expect(Accounts.createUser).toHaveBeenCalled()
  })
})
