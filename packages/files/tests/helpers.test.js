/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * downloadUrl and DDP helper wiring
 */
import { describe, expect, it, vi } from 'vitest'

describe('@nexus/files helpers', () => {
  it('builds an encoded download path from a file id', async () => {
    const { downloadUrl } = await import('../src/helpers.js')
    expect(downloadUrl('abc123')).toBe('/nexus-files/abc123')
    expect(downloadUrl('id with space')).toBe('/nexus-files/id%20with%20space')
  })

  it('remove calls nexusFiles.remove after registerWithMeteor', async () => {
    vi.resetModules()
    const { registerWithMeteor } = await import('../src/register.js')
    const callAsync = vi.fn().mockResolvedValue({ removed: true })
    registerWithMeteor({
      Meteor: { isServer: false, callAsync },
      Mongo: { Collection: class { constructor(name) { this.name = name } } },
      check: () => {},
      Match: { Any: 'Any' },
      Random: { id: () => 'rid' },
      Roles: { userIsInRole: () => false },
    })
    const { remove } = await import('../src/helpers.js')
    await remove('file-1')
    expect(callAsync).toHaveBeenCalledWith('nexusFiles.remove', { fileId: 'file-1' })
  })
})
