/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Reactive role check for Vue (display only — methods still enforce)
 *
 * Client checks need the user's role-assignment rows. The server publishes
 * them from imports/api/publishUserRoles.js.
 */
import { Meteor } from 'meteor/meteor'
import { Roles } from 'meteor/roles'
import { Tracker } from 'meteor/tracker'
import { onUnmounted, ref, toValue, watch } from 'vue'

export function useUserRole(roleOrRoles) {
  const allowed = ref(false)

  async function refresh() {
    const userId = Meteor.userId()
    const roles = toValue(roleOrRoles)
    if (!userId || roles == null || (Array.isArray(roles) && roles.length === 0)) {
      allowed.value = false
      return
    }

    allowed.value = await Roles.userIsInRoleAsync(userId, roles)
  }

  const computation = Tracker.autorun(() => {
    Meteor.userId()
    Meteor.user()
    void refresh()
  })

  watch(
    () => toValue(roleOrRoles),
    () => {
      void refresh()
    },
  )

  onUnmounted(() => {
    computation.stop()
  })

  return allowed
}
