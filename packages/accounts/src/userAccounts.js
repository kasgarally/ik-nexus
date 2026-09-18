/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Password-user helpers that tolerate missing *Async exports
 */
export async function createPasswordUser(Accounts, { email, password, name }) {
  const options = {
    email,
    password,
    profile: { name },
  }
  if (typeof Accounts.createUserAsync === 'function') {
    return Accounts.createUserAsync(options)
  }
  return Accounts.createUser(options)
}

export async function findUserByEmail(Accounts, Meteor, email) {
  if (typeof Accounts.findUserByEmailAsync === 'function') {
    return Accounts.findUserByEmailAsync(email)
  }
  if (typeof Accounts.findUserByEmail === 'function') {
    return Accounts.findUserByEmail(email)
  }
  return Meteor.users.findOneAsync({ 'emails.address': email })
}

export async function setUserPassword(Accounts, userId, password) {
  if (typeof Accounts.setPasswordAsync === 'function') {
    return Accounts.setPasswordAsync(userId, password)
  }
  return Accounts.setPassword(userId, password)
}

export async function replaceUserEmail(Accounts, userId, previousEmail, nextEmail) {
  if (previousEmail === nextEmail) {
    return
  }
  if (typeof Accounts.addEmailAsync === 'function') {
    await Accounts.addEmailAsync(userId, nextEmail, true)
    if (previousEmail) {
      await Accounts.removeEmailAsync(userId, previousEmail)
    }
    return
  }
  Accounts.addEmail(userId, nextEmail, true)
  if (previousEmail) {
    Accounts.removeEmail(userId, previousEmail)
  }
}

export async function replaceUserRoles(Roles, userId, roles) {
  if (typeof Roles.setUserRolesAsync === 'function') {
    return Roles.setUserRolesAsync(userId, roles)
  }
  return Roles.setUserRoles(userId, roles)
}
