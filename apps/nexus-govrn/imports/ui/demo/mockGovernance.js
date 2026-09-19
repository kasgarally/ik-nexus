/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Fictional governance snapshot for the layout preview
 */
export const metrics = [
  { title: 'Open risks', value: '24', icon: 'mdi-alert-outline', colour: 'error', change: '20%', direction: 'mdi-arrow-down', trendColour: 'success', comparison: 'vs. last month' },
  { title: 'Overdue actions', value: '7', icon: 'mdi-clock-outline', colour: 'error', change: '3', direction: 'mdi-arrow-up', trendColour: 'error', comparison: 'vs. last month' },
  { title: 'Controls reviewed', value: '86%', icon: 'mdi-shield-check-outline', colour: 'secondary', change: '6 percentage points', direction: 'mdi-arrow-up', trendColour: 'success', comparison: 'vs. last month' },
  { title: 'Awaiting approval', value: '12', icon: 'mdi-file-document-outline', colour: 'primary', change: '25%', direction: 'mdi-arrow-down', trendColour: 'success', comparison: 'vs. last month' },
]
export const attention = [
  { id: 'GOV-1042', title: 'Third-party vendor risk review', category: 'Third-party risk', owner: 'James Doyle', initials: 'JD', team: 'Procurement', due: '12 Sep 2026', status: 'Overdue', colour: 'error' },
  { id: 'GOV-1043', title: 'Data retention policy update', category: 'Data privacy', owner: 'Sophie Lane', initials: 'SL', team: 'Legal', due: '15 Sep 2026', status: 'Overdue', colour: 'error' },
  { id: 'GOV-1044', title: 'IT access controls assessment', category: 'Information security', owner: 'Marcus Tan', initials: 'MT', team: 'IT', due: '22 Sep 2026', status: 'At risk', colour: 'warning' },
  { id: 'GOV-1045', title: 'Regulatory change impact analysis', category: 'Compliance', owner: 'Priya Rao', initials: 'PR', team: 'Compliance', due: '24 Sep 2026', status: 'At risk', colour: 'warning' },
  { id: 'GOV-1046', title: 'Business continuity plan review', category: 'Operational resilience', owner: 'Alex Morgan', initials: 'AM', team: 'Operations', due: '30 Sep 2026', status: 'In progress', colour: 'primary' },
]
export const approvals = [
  { id: 'APR-31', title: 'Supplier due diligence assessment', category: 'Third-party risk', by: 'Oliver Grant', date: '14 Sep 2026' },
  { id: 'APR-32', title: 'Information security policy v2.1', category: 'Information security', by: 'Hannah Brooks', date: '12 Sep 2026' },
  { id: 'APR-33', title: 'Marketing data processing agreement', category: 'Data privacy', by: 'Daniel Kim', date: '9 Sep 2026' },
]
export const activity = [
  { id: 1, title: 'Risk R-1042 updated', detail: 'Cyber security threat assessment', by: 'Maya Patel', when: '2 hours ago', icon: 'mdi-file-document-outline', colour: 'primary' },
  { id: 2, title: 'Control assessment completed', detail: 'Access rights management (C-214)', by: 'Liam Chen', when: '5 hours ago', icon: 'mdi-check-circle-outline', colour: 'secondary' },
  { id: 3, title: 'Policy published', detail: 'Remote working policy v3.0', by: 'Sophie Lane', when: 'Yesterday', icon: 'mdi-file-document-outline', colour: 'primary' },
  { id: 4, title: 'New third-party added', detail: 'CloudSync Tools Ltd', by: 'Marcus Tan', when: 'Yesterday', icon: 'mdi-account-multiple-outline', colour: 'primary' },
  { id: 5, title: 'Incident INC-338 closed', detail: 'Phishing email reported', by: 'Emma Wilson', when: '2 days ago', icon: 'mdi-pencil-outline', colour: 'primary' },
]
export const coverage = [
  { domain: 'Information security', value: 92, status: 'Good', colour: 'success' },
  { domain: 'Data privacy', value: 78, status: 'Adequate', colour: 'warning' },
  { domain: 'Third-party risk', value: 67, status: 'Needs attention', colour: 'error' },
  { domain: 'Operational resilience', value: 83, status: 'Good', colour: 'success' },
  { domain: 'Regulatory compliance', value: 71, status: 'Adequate', colour: 'warning' },
]
