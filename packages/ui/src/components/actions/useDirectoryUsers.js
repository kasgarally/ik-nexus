/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Subscribe to accounts.directory for the assignee combobox
 */
import { onUnmounted, ref } from 'vue'
import { Accounts } from '@nexus/accounts'

export function useDirectoryUsers() {
  const people = ref([])
  const ready = ref(false)

  let subscriptionHandle = null
  let observer = null

  async function refreshPeople() {
    const rows = await Accounts.users.find({}, { sort: { 'profile.name': 1 } }).fetchAsync()
    people.value = rows.map((user) => ({
      title: user.profile?.name || user.emails?.[0]?.address || user._id,
      value: user._id,
      subtitle: user.emails?.[0]?.address || '',
    }))
  }

  const cursor = Accounts.users.find({})
  void refreshPeople()
  observer = cursor.observe({
    added() {
      void refreshPeople()
    },
    changed() {
      void refreshPeople()
    },
    removed() {
      void refreshPeople()
    },
  })

  subscriptionHandle = Accounts.subscribeDirectory({
    onReady() {
      ready.value = true
      void refreshPeople()
    },
  })

  onUnmounted(() => {
    observer?.stop()
    subscriptionHandle?.stop()
  })

  return { people, ready }
}
