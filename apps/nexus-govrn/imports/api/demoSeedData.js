/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Local-only demo company, admin, extra users, and org. Edit this file to change seed data.
 */
export const demoAdmin = {
  name: 'Demo Admin',
  email: 'admin@localhost',
  password: 'admin',
  roles: ['superadmin', 'admin'],
}

export const DEMO_USER_PASSWORD = 'password'

export const demoUsers = [
  { name: 'Ada Lovelace', email: 'ada@localhost', roles: ['user'] },
  { name: 'Ben Carter', email: 'ben@localhost', roles: ['user'] },
  { name: 'Chen Wei', email: 'chen@localhost', roles: ['user'] },
  { name: 'Dana Okonkwo', email: 'dana@localhost', roles: ['user'] },
  { name: 'Elena Rossi', email: 'elena@localhost', roles: ['user'] },
  { name: 'Farid Rahman', email: 'farid@localhost', roles: ['user'] },
  { name: 'Grace Nakamura', email: 'grace@localhost', roles: ['user', 'admin'] },
  { name: 'Hiro Tanaka', email: 'hiro@localhost', roles: ['user'] },
  { name: 'Imani Nkrumah', email: 'imani@localhost', roles: ['user'] },
]

export const demoSetup = {
  companyName: 'Nexus GovRN (dev)',
  legalName: 'INTELLEKTRA Ltd',
  website: 'https://intellektra.example',
  phone: '+230 000 0000',
  email: 'hello@localhost',
  address: {
    line1: '1 Cybercity',
    line2: 'Ebene Cyber Tower',
    city: 'Ebene',
    region: 'Plaines Wilhems',
    postalCode: '72201',
    country: 'Mauritius',
  },
  logoDataUrl:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDAgNjQiPjxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iNjQiIHJ4PSI4IiBmaWxsPSIjMTU2NWMwIi8+PHRleHQgeD0iMTIwIiB5PSI0MiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2ZmZiIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjI4IiBmb250LXdlaWdodD0iNzAwIj5ORVhVUzwvdGV4dD48L3N2Zz4=',
  iconDataUrl:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiMxNTY1YzAiLz48dGV4dCB4PSIzMiIgeT0iNDIiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmYiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIzMiIgZm9udC13ZWlnaHQ9IjcwMCI+TjwvdGV4dD48L3N2Zz4=',
}

export const demoOrgNodes = [
  {
    _id: 'org-demo-hq',
    parentId: null,
    type: 'company',
    title: { en: 'INTELLEKTRA', fr: 'INTELLEKTRA', ar: 'إنتيلكترا' },
    sortOrder: 0,
  },
  {
    _id: 'org-demo-grc',
    parentId: 'org-demo-hq',
    type: 'division',
    title: { en: 'Risk and Compliance', fr: 'Risque et conformité', ar: 'المخاطر والامتثال' },
    sortOrder: 0,
  },
  {
    _id: 'org-demo-oprisk',
    parentId: 'org-demo-grc',
    type: 'department',
    title: { en: 'Operational Risk', fr: 'Risque opérationnel', ar: 'المخاطر التشغيلية' },
    sortOrder: 0,
  },
  {
    _id: 'org-demo-audit',
    parentId: 'org-demo-grc',
    type: 'department',
    title: { en: 'Internal Audit', fr: 'Audit interne', ar: 'التدقيق الداخلي' },
    sortOrder: 1,
  },
  {
    _id: 'org-demo-fin',
    parentId: 'org-demo-hq',
    type: 'division',
    title: { en: 'Finance', fr: 'Finance', ar: 'المالية' },
    sortOrder: 1,
  },
  {
    _id: 'org-demo-treas',
    parentId: 'org-demo-fin',
    type: 'department',
    title: { en: 'Treasury', fr: 'Trésorerie', ar: 'الخزينة' },
    sortOrder: 0,
  },
  {
    _id: 'org-demo-ops',
    parentId: 'org-demo-hq',
    type: 'division',
    title: { en: 'Operations', fr: 'Opérations', ar: 'العمليات' },
    sortOrder: 2,
  },
  {
    _id: 'org-demo-it',
    parentId: 'org-demo-ops',
    type: 'department',
    title: { en: 'Information Technology', fr: 'Technologies de l’information', ar: 'تقنية المعلومات' },
    sortOrder: 0,
  },
  {
    _id: 'org-demo-plat',
    parentId: 'org-demo-it',
    type: 'team',
    title: { en: 'Platform', fr: 'Plateforme', ar: 'المنصة' },
    sortOrder: 0,
  },
]
