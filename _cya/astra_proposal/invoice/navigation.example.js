// These arrays use the same shape as `items` in the supplied WebLayout.vue.
// Replace its local items array, or select a profile from route metadata.
export const governanceNavigation = [
  ['overview', 'Overview', 'mdi-home-outline', '/governance'],
  ['risks', 'Risks', 'mdi-alert-outline', '/risks'],
  ['incidents', 'Incidents', 'mdi-alert-circle-outline', '/incidents'],
  ['controls', 'Controls', 'mdi-shield-check-outline', '/controls'],
  ['policies', 'Policies', 'mdi-file-document-outline', '/policies'],
  ['approvals', 'Approvals', 'mdi-checkbox-marked-outline', '/approvals'],
]
export const erpNavigation = [
  ['overview', 'Overview', 'mdi-home-outline', '/erp'],
  ['receivables', 'Receivables', 'mdi-file-document-outline', '/receivables'],
  ['payables', 'Payables', 'mdi-wallet-outline', '/payables'],
  ['accounting', 'Accounting', 'mdi-chart-box-outline', '/accounting'],
  ['expenses', 'Expenses', 'mdi-credit-card-outline', '/expenses'],
  ['payroll', 'Payroll', 'mdi-account-group-outline', '/payroll'],
  ['reports', 'Reports', 'mdi-chart-bar', '/reports'],
]
