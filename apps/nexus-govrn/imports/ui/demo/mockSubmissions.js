/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Fictional submissions for the register preview
 */
export const submissions = [
  { id: 'REG-2026-0152', firm: 'Northbridge Bank', type: 'Annual return', due: '31 Mar 2026', status: 'Submitted', period: 'Q1 2026' },
  { id: 'REG-2026-0151', firm: 'Rivermere Investments', type: 'Quarterly return', due: '30 Sep 2026', status: 'Pending review', period: 'Q2 2026' },
  { id: 'REG-2026-0150', firm: 'Cedar Asset Management', type: 'Capital adequacy', due: '30 Jun 2026', status: 'Overdue', period: 'Q2 2026' },
  { id: 'REG-2026-0148', firm: 'Atlas Capital', type: 'Quarterly return', due: '18 Sep 2026', status: 'In review', period: 'Q2 2026' },
  { id: 'REG-2026-0147', firm: 'Mariner Trust', type: 'Quarterly return', due: '31 Aug 2026', status: 'Submitted', period: 'Q2 2026' },
  { id: 'REG-2026-0146', firm: 'Stonebridge Funds', type: 'Risk exposure', due: '30 Sep 2026', status: 'Pending review', period: 'Q2 2026' },
  { id: 'REG-2026-0145', firm: 'Evergreen Securities', type: 'Liquidity return', due: '31 Aug 2026', status: 'Submitted', period: 'Q2 2026' },
]
export const statusColour = status => ({ Submitted: 'success', Overdue: 'error', 'In review': 'primary', 'Pending review': undefined })[status]
export const defaultSelection = 'REG-2026-0148'
