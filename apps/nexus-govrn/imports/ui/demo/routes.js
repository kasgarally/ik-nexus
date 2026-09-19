/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Preview routes for layout and widget demos (not product sub-apps)
 */
import Context from './Context.vue'
import FilesTest from './FilesTest.vue'
import GovernanceDashboard from './GovernanceDashboard.vue'
import InvoicePage from './InvoicePage.vue'
import ListsTest from './ListsTest.vue'
import SubmissionContext from './SubmissionContext.vue'
import SubmissionsHeading from './SubmissionsHeading.vue'
import SubmissionsRegister from './SubmissionsRegister.vue'
import Entry from '../Entry.vue'

export const demoRoutes = [
  {
    path: '/files-test',
    name: 'filesTest',
    component: FilesTest,
    meta: { layout: 'web' },
  },
  {
    path: '/lists-test',
    name: 'listsTest',
    component: ListsTest,
    meta: { layout: 'web' },
  },
  {
    path: '/workspace',
    name: 'workspace',
    components: {
      default: Entry,
      context: Context,
    },
    meta: { layout: 'web', context: true },
  },
  {
    path: '/submissions',
    name: 'submissions',
    components: {
      default: SubmissionsRegister,
      heading: SubmissionsHeading,
      context: SubmissionContext,
    },
    meta: { layout: 'web' },
  },
  {
    path: '/governance',
    name: 'governance',
    component: GovernanceDashboard,
    meta: { layout: 'web' },
  },
  {
    path: '/receivables/invoices/new',
    name: 'invoice',
    component: InvoicePage,
    meta: { layout: 'web' },
  },
]
