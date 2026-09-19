/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * DDP account admin plus gated self-register and public auth options
 */
import { Org } from '@nexus/org'
import { ADMIN_ROLES } from '@nexus/setup'
import { allAssignableRoleNames, isAssignableRole } from './catalog.js'
import { readConfiguredProviders, readPublicAccounts } from './authSettings.js'
import {
  METHOD_AUTH_OPTIONS,
  METHOD_ROLES_SET,
  METHOD_SELF_REGISTER,
  METHOD_USERS_INSERT,
  METHOD_USERS_REMOVE,
  METHOD_USERS_SET_ORG,
  METHOD_USERS_SET_PASSWORD,
  METHOD_USERS_SET_SUSPENDED,
  METHOD_USERS_UPDATE,
  USERS_COLLECTION,
} from './constants.js'
import {
  assertNotLastSuperadmin,
  assertNotSelf,
  requireAccountAdmin,
  requireEmail,
  requireNonEmpty,
  requirePassword,
  userEmail,
} from './gates.js'
import {
  addUserRoles,
  createPasswordUser,
  findUserByEmail,
  replaceUserEmail,
  replaceUserRoles,
  setUserPassword,
} from './userAccounts.js'

export function registerMethods({ Meteor, check, Match, Roles, Accounts, record }) {
  Meteor.methods({
    [METHOD_AUTH_OPTIONS]() {
      const publicAccounts = readPublicAccounts(Meteor)
      const providers = readConfiguredProviders(Meteor)
      return {
        selfRegister: publicAccounts.selfRegister,
        providers: {
          google: publicAccounts.selfRegister && providers.google,
          facebook: publicAccounts.selfRegister && providers.facebook,
        },
        heroImage: publicAccounts.heroImage,
        prefillDemo: publicAccounts.prefillDemo,
      }
    },

    async [METHOD_SELF_REGISTER](params) {
      check(params, { email: String, name: String, password: String })
      const publicAccounts = readPublicAccounts(Meteor)
      if (!publicAccounts.selfRegister) {
        throw new Meteor.Error('self-register-disabled', 'Self-registration is disabled')
      }

      const email = requireEmail(Meteor, params.email)
      const name = requireNonEmpty(Meteor, params.name, 'invalid-name', 'Name is required')
      const password = requirePassword(Meteor, params.password)
      const existing = await findUserByEmail(Accounts, Meteor, email)
      if (existing) {
        throw new Meteor.Error('email-taken', 'An account with that email already exists')
      }

      const userId = await createPasswordUser(Accounts, { email, password, name })
      await addUserRoles(Roles, userId, publicAccounts.selfRegisterRoles)
      await writeAudit(record, {
        action: 'selfRegister',
        docId: userId,
        document: { email, name, roles: publicAccounts.selfRegisterRoles },
        fields: ['email', 'name', 'roles'],
      })
      return { id: userId }
    },

    async [METHOD_USERS_INSERT](params) {
      check(params, {
        email: String,
        name: String,
        password: String,
        roles: Match.Maybe([String]),
      })
      await requireAccountAdmin(Meteor, Roles, this.userId)

      const email = requireEmail(Meteor, params.email)
      const name = requireNonEmpty(Meteor, params.name, 'invalid-name', 'Name is required')
      const password = requirePassword(Meteor, params.password)
      const roles = normalizeRoles(Meteor, params.roles)

      const existing = await findUserByEmail(Accounts, Meteor, email)
      if (existing) {
        throw new Meteor.Error('email-taken', 'An account with that email already exists')
      }

      const userId = await createPasswordUser(Accounts, { email, password, name })
      await replaceUserRoles(Roles, userId, roles)
      await writeAudit(record, {
        action: 'create',
        docId: userId,
        document: { email, name, roles },
        fields: ['email', 'name', 'roles'],
      })
      return { id: userId }
    },

    async [METHOD_USERS_UPDATE](params) {
      check(params, {
        id: String,
        name: Match.Maybe(String),
        email: Match.Maybe(String),
      })
      await requireAccountAdmin(Meteor, Roles, this.userId)

      const user = await requireUser(Meteor, params.id)
      const fields = { updatedAt: new Date() }
      const changed = []

      if (params.name !== undefined) {
        fields['profile.name'] = requireNonEmpty(Meteor, params.name, 'invalid-name', 'Name is required')
        changed.push('name')
      }
      if (params.email !== undefined) {
        const email = requireEmail(Meteor, params.email)
        const previous = userEmail(user)
        if (email !== previous) {
          const taken = await findUserByEmail(Accounts, Meteor, email)
          if (taken && taken._id !== user._id) {
            throw new Meteor.Error('email-taken', 'An account with that email already exists')
          }
          await replaceUserEmail(Accounts, user._id, previous, email)
          changed.push('email')
        }
      }

      await Meteor.users.updateAsync(user._id, { $set: fields })
      await writeAudit(record, {
        action: 'update',
        docId: user._id,
        document: { name: fields['profile.name'], email: params.email },
        fields: changed,
      })
      return { ok: true }
    },

    async [METHOD_USERS_REMOVE](params) {
      check(params, { id: String })
      await requireAccountAdmin(Meteor, Roles, this.userId)
      assertNotSelf(Meteor, this.userId, params.id, 'delete')
      const user = await requireUser(Meteor, params.id)
      await assertNotLastSuperadmin(Meteor, Roles, user._id, false)
      await replaceUserRoles(Roles, user._id, [])
      await Meteor.users.removeAsync(user._id)
      await writeAudit(record, {
        action: 'remove',
        docId: user._id,
        document: { email: userEmail(user) },
        fields: ['_id'],
      })
      return { ok: true }
    },

    async [METHOD_USERS_SET_PASSWORD](params) {
      check(params, { id: String, password: String })
      await requireAccountAdmin(Meteor, Roles, this.userId)
      const user = await requireUser(Meteor, params.id)
      const password = requirePassword(Meteor, params.password)
      await setUserPassword(Accounts, user._id, password)
      await writeAudit(record, {
        action: 'setPassword',
        docId: user._id,
        document: { email: userEmail(user) },
        fields: ['password'],
      })
      return { ok: true }
    },

    async [METHOD_USERS_SET_SUSPENDED](params) {
      check(params, { id: String, suspended: Boolean })
      await requireAccountAdmin(Meteor, Roles, this.userId)
      assertNotSelf(Meteor, this.userId, params.id, 'suspend')
      const user = await requireUser(Meteor, params.id)
      if (params.suspended) {
        await assertNotLastSuperadmin(Meteor, Roles, user._id, false)
      }
      const suspendedAt = params.suspended ? new Date() : null
      await Meteor.users.updateAsync(user._id, { $set: { suspendedAt } })
      await writeAudit(record, {
        action: params.suspended ? 'suspend' : 'unsuspend',
        docId: user._id,
        document: { email: userEmail(user), suspendedAt },
        fields: ['suspendedAt'],
      })
      return { ok: true }
    },

    async [METHOD_USERS_SET_ORG](params) {
      check(params, {
        id: String,
        orgNodeId: Match.OneOf(String, null),
      })
      await requireAccountAdmin(Meteor, Roles, this.userId)
      const user = await requireUser(Meteor, params.id)
      const orgNodeId =
        params.orgNodeId === null || params.orgNodeId === ''
          ? null
          : await readActiveOrgNodeId(Meteor, params.orgNodeId)

      await Meteor.users.updateAsync(user._id, {
        $set: { 'profile.orgNodeId': orgNodeId, updatedAt: new Date() },
      })
      await writeAudit(record, {
        action: 'setOrg',
        docId: user._id,
        document: { orgNodeId },
        fields: ['orgNodeId'],
      })
      return { ok: true }
    },

    async [METHOD_ROLES_SET](params) {
      check(params, { id: String, roles: [String] })
      await requireAccountAdmin(Meteor, Roles, this.userId)
      const user = await requireUser(Meteor, params.id)
      const roles = normalizeRoles(Meteor, params.roles)
      const keepsSuperadmin = roles.includes('superadmin')
      await assertNotLastSuperadmin(Meteor, Roles, user._id, keepsSuperadmin)
      await replaceUserRoles(Roles, user._id, roles)
      await writeAudit(record, {
        action: 'setRoles',
        docId: user._id,
        document: { email: userEmail(user), roles },
        fields: ['roles'],
      })
      return { ok: true }
    },
  })
}

async function readActiveOrgNodeId(Meteor, orgNodeId) {
  const node = await Org.requireActiveNode(orgNodeId)
  if (!node) {
    throw new Meteor.Error('invalid-org-node', 'orgNodeId must be an active nexus_org id')
  }
  return node._id
}

async function requireUser(Meteor, id) {
  const user = await Meteor.users.findOneAsync(id)
  if (!user) {
    throw new Meteor.Error('user-not-found', 'No account for that id')
  }
  return user
}

function normalizeRoles(Meteor, roles) {
  const unique = []
  for (const role of roles || []) {
    if (typeof role !== 'string' || !role.trim()) {
      continue
    }
    const name = role.trim()
    if (!isAssignableRole(name)) {
      throw new Meteor.Error('invalid-role', `Role ${name} is not in a registered catalog`)
    }
    if (!unique.includes(name)) {
      unique.push(name)
    }
  }
  if (unique.includes('superadmin') && !unique.includes('admin')) {
    unique.push('admin')
  }
  if (unique.length === 0) {
    return []
  }
  const allowed = new Set(allAssignableRoleNames())
  for (const name of unique) {
    if (!allowed.has(name) && !ADMIN_ROLES.includes(name)) {
      throw new Meteor.Error('invalid-role', `Role ${name} is not in a registered catalog`)
    }
  }
  return unique
}

async function writeAudit(record, { action, docId, document, fields }) {
  if (typeof record !== 'function') {
    return
  }
  await record({
    action,
    collection: USERS_COLLECTION,
    docId,
    document,
    fields,
    redactKeys: ['password'],
  })
}
