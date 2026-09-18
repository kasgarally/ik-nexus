/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Drawer menu catalog — add a sub-app row here, not in WebLayout
 *
 * Each item: { key, fallback, icon, path }.
 * `key` is the i18n suffix (`nav.${key}`). `path` is unique and used as the Vue key.
 */
import { bookNavItem } from '/imports/apps/Books/client/nav.js'

export const navSections = [
  {
    key: 'regulator',
    fallback: 'Regulator',
    items: [
      { key: 'overview', fallback: 'Overview', icon: 'mdi-home-outline', path: '/' },
      { key: 'firms', fallback: 'Firms', icon: 'mdi-office-building-outline', path: '/firms' },
      { key: 'submissions', fallback: 'Submissions', icon: 'mdi-file-document-outline', path: '/submissions' },
      bookNavItem,
      { key: 'reviews', fallback: 'Reviews', icon: 'mdi-checkbox-marked-outline', path: '/reviews' },
      { key: 'correspondence', fallback: 'Correspondence', icon: 'mdi-email-outline', path: '/correspondence' },
      { key: 'reports', fallback: 'Reports', icon: 'mdi-chart-box-outline', path: '/reports' },
    ],
  },
  {
    key: 'governance',
    fallback: 'Governance',
    items: [
      { key: 'governance', fallback: 'Overview', icon: 'mdi-home-outline', path: '/governance' },
      { key: 'risks', fallback: 'Risks', icon: 'mdi-alert-outline', path: '/risks' },
      { key: 'incidents', fallback: 'Incidents', icon: 'mdi-alert-circle-outline', path: '/incidents' },
      { key: 'controls', fallback: 'Controls', icon: 'mdi-shield-check-outline', path: '/controls' },
      { key: 'policies', fallback: 'Policies', icon: 'mdi-file-document-outline', path: '/policies' },
      { key: 'approvals', fallback: 'Approvals', icon: 'mdi-checkbox-marked-outline', path: '/approvals' },
    ],
  },
  {
    key: 'erp',
    fallback: 'ERP',
    items: [
      { key: 'erp', fallback: 'Overview', icon: 'mdi-home-outline', path: '/erp' },
      { key: 'receivables', fallback: 'Receivables', icon: 'mdi-file-document-outline', path: '/receivables/invoices/new' },
      { key: 'payables', fallback: 'Payables', icon: 'mdi-wallet-outline', path: '/payables' },
      { key: 'accounting', fallback: 'Accounting', icon: 'mdi-chart-box-outline', path: '/accounting' },
      { key: 'expenses', fallback: 'Expenses', icon: 'mdi-credit-card-outline', path: '/expenses' },
      { key: 'payroll', fallback: 'Payroll', icon: 'mdi-account-group-outline', path: '/payroll' },
      { key: 'erpReports', fallback: 'Reports', icon: 'mdi-chart-bar', path: '/reports' },
    ],
  },
]
