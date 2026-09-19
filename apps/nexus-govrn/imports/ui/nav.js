/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Drawer menu catalog — add a sub-app row here, not in WebLayout
 *
 * Each item: { key, fallback, icon, path }.
 * `key` is the i18n suffix (`nav.${key}`). `path` is unique and used as the Vue key.
 * Use `#` when the screen does not exist yet so the router does not warn.
 */
import { bookNavItem } from '/imports/apps/Books/client/nav.js'

export const navSections = [
  {
    key: 'regulator',
    fallback: 'Regulator',
    items: [
      { key: 'overview', fallback: 'Overview', icon: 'mdi-home-outline', path: '/' },
      { key: 'firms', fallback: 'Firms', icon: 'mdi-office-building-outline', path: '#' },
      { key: 'submissions', fallback: 'Submissions', icon: 'mdi-file-document-outline', path: '/submissions' },
      bookNavItem,
      { key: 'reviews', fallback: 'Reviews', icon: 'mdi-checkbox-marked-outline', path: '#' },
      { key: 'correspondence', fallback: 'Correspondence', icon: 'mdi-email-outline', path: '#' },
      { key: 'reports', fallback: 'Reports', icon: 'mdi-chart-box-outline', path: '#' },
    ],
  },
  {
    key: 'governance',
    fallback: 'Governance',
    items: [
      { key: 'governance', fallback: 'Overview', icon: 'mdi-home-outline', path: '/governance' },
      { key: 'risks', fallback: 'Risks', icon: 'mdi-alert-outline', path: '#' },
      { key: 'incidents', fallback: 'Incidents', icon: 'mdi-alert-circle-outline', path: '#' },
      { key: 'controls', fallback: 'Controls', icon: 'mdi-shield-check-outline', path: '#' },
      { key: 'policies', fallback: 'Policies', icon: 'mdi-file-document-outline', path: '#' },
      { key: 'approvals', fallback: 'Approvals', icon: 'mdi-checkbox-marked-outline', path: '#' },
    ],
  },
  {
    key: 'erp',
    fallback: 'ERP',
    items: [
      { key: 'erp', fallback: 'Overview', icon: 'mdi-home-outline', path: '#' },
      { key: 'receivables', fallback: 'Receivables', icon: 'mdi-file-document-outline', path: '/receivables/invoices/new' },
      { key: 'payables', fallback: 'Payables', icon: 'mdi-wallet-outline', path: '#' },
      { key: 'accounting', fallback: 'Accounting', icon: 'mdi-chart-box-outline', path: '#' },
      { key: 'expenses', fallback: 'Expenses', icon: 'mdi-credit-card-outline', path: '#' },
      { key: 'payroll', fallback: 'Payroll', icon: 'mdi-account-group-outline', path: '#' },
      { key: 'erpReports', fallback: 'Reports', icon: 'mdi-chart-bar', path: '#' },
    ],
  },
  {
    key: 'demo',
    fallback: 'Demos',
    items: [
      { key: 'filesTest', fallback: 'Files test', icon: 'mdi-paperclip', path: '/files-test' },
      { key: 'listsTest', fallback: 'Lists test', icon: 'mdi-format-list-bulleted', path: '/lists-test' },
      { key: 'workspace', fallback: 'With context', icon: 'mdi-view-split-vertical', path: '/workspace' },
    ],
  },
]
