/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Client helpers call the setup DDP names
 */
import { describe, expect, it, vi } from 'vitest'

async function loadHelpers(Meteor) {
  vi.resetModules()
  const { registerWithMeteor } = await import('../src/register.js')
  registerWithMeteor({
    Meteor: { isServer: false, ...Meteor },
    Mongo: {
      Collection: class {
        constructor(name) {
          this.name = name
        }
      },
    },
    check: () => {},
    Match: { Maybe: () => 'Maybe' },
    Roles: {},
    Accounts: {},
  })
  return import('../src/helpers.js')
}

describe('@nexus/setup helpers', () => {
  it('isComplete and complete call the setup methods', async () => {
    const callAsync = vi.fn().mockResolvedValue({ complete: true })
    const { isComplete, complete } = await loadHelpers({ callAsync })
    await isComplete()
    await complete({ companyName: 'Acme' })
    expect(callAsync).toHaveBeenNthCalledWith(1, 'setup.isComplete')
    expect(callAsync).toHaveBeenNthCalledWith(2, 'setup.complete', { companyName: 'Acme' })
  })

  it('subscribePublic uses setup.public', async () => {
    const subscribe = vi.fn().mockReturnValue({ stop() {} })
    const { subscribePublic } = await loadHelpers({ subscribe })
    const handle = subscribePublic({ onReady() {} })
    expect(subscribe).toHaveBeenCalledWith('setup.public', expect.any(Object))
    expect(handle.stop).toBeTypeOf('function')
  })

  it('prefers loginWithPasswordAsync when Meteor exposes it', async () => {
    const loginWithPasswordAsync = vi.fn().mockResolvedValue(undefined)
    const { loginWithPassword } = await loadHelpers({ loginWithPasswordAsync })
    await loginWithPassword('ada@example.com', 'longenough')
    expect(loginWithPasswordAsync).toHaveBeenCalledWith('ada@example.com', 'longenough')
  })

  it('wraps callback loginWithPassword when the async export is missing', async () => {
    const loginWithPasswordFn = vi.fn((email, password, callback) => callback())
    const { loginWithPassword } = await loadHelpers({ loginWithPassword: loginWithPasswordFn })
    await loginWithPassword('ada@example.com', 'longenough')
    expect(loginWithPasswordFn).toHaveBeenCalled()
  })

  it('rejects when callback loginWithPassword fails', async () => {
    const loginWithPasswordFn = vi.fn((email, password, callback) => callback(new Error('login-failed')))
    const { loginWithPassword } = await loadHelpers({ loginWithPassword: loginWithPasswordFn })
    await expect(loginWithPassword('ada@example.com', 'wrong')).rejects.toThrow(/login-failed/)
  })
})
