/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Subscribe to admin user list and role assignments
 */
import { Accounts } from '@nexus/accounts'
import { onMounted, onUnmounted, ref } from 'vue'

export function useAccountsUsers() {
  const users = ref([])
  const assignments = ref([])
  const ready = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  let usersObserver = null
  let assignmentsObserver = null
  let usersHandle = null
  let assignmentsHandle = null

  async function refreshUsers() {
    const rows = await Accounts.users.find({}, { sort: { createdAt: -1 } }).fetchAsync()
    users.value = rows
  }

  async function refreshAssignments() {
    const collection = Accounts.roleAssignment
    if (!collection) {
      assignments.value = []
      return
    }
    assignments.value = await collection.find({}).fetchAsync()
  }

  function stopWatching() {
    usersObserver?.stop()
    assignmentsObserver?.stop()
    usersHandle?.stop()
    assignmentsHandle?.stop()
    usersObserver = null
    assignmentsObserver = null
    usersHandle = null
    assignmentsHandle = null
  }

  function startWatching() {
    stopWatching()
    const usersCollection = Accounts.users
    void refreshUsers()
    usersObserver = usersCollection.find({}).observe({
      added() {
        void refreshUsers()
      },
      changed() {
        void refreshUsers()
      },
      removed() {
        void refreshUsers()
      },
    })
    usersHandle = Accounts.subscribeUsers({
      onReady() {
        ready.value = true
        void refreshUsers()
      },
    })

    const assignmentCollection = Accounts.roleAssignment
    if (assignmentCollection) {
      void refreshAssignments()
      assignmentsObserver = assignmentCollection.find({}).observe({
        added() {
          void refreshAssignments()
        },
        changed() {
          void refreshAssignments()
        },
        removed() {
          void refreshAssignments()
        },
      })
      assignmentsHandle = Accounts.subscribeRoleAssignments({
        onReady() {
          void refreshAssignments()
        },
      })
    }
  }

  onMounted(startWatching)
  onUnmounted(stopWatching)

  function rolesFor(userId) {
    return assignments.value
      .filter((row) => row.user?._id === userId)
      .map((row) => row.role?._id)
      .filter(Boolean)
  }

  async function run(work) {
    errorMessage.value = ''
    saving.value = true
    try {
      return await work()
    } catch (error) {
      errorMessage.value = error.reason || error.message || String(error)
      throw error
    } finally {
      saving.value = false
    }
  }

  return {
    users,
    assignments,
    ready,
    saving,
    errorMessage,
    rolesFor,
    run,
  }
}
