/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * English app messages
 */
export default {
  brand: 'Nexus GovRN',
  themeToggle: 'Toggle theme',
  nav: {
    home: 'Home',
    filesTest: 'Files test',
    listsTest: 'Lists test',
    workspace: 'With context',
    signin: 'Sign in',
    books: 'Books',
    section: {
      regulator: 'Regulator',
      governance: 'Governance',
      erp: 'ERP',
    },
  },
  listsTest: {
    title: 'Lists test',
    body: 'Setup editors write through lists.insert / update / remove. The capture card is a later risk form: v-select shows the locale title and stores the code.',
    credentials: 'Sign in as {email} / {password} (local demo admin).',
    setupHint: 'Add, edit, or delete items for this listKey. Inactive rows stay here but disappear from the v-select.',
    setupCategory: 'Setup: demo.category',
    setupLikelihood: 'Setup: demo.likelihood',
    captureTitle: 'Capture form (v-select)',
    captureHint: 'Change language in the app bar. Labels update; the stored codes stay the same.',
    category: 'Category',
    likelihood: 'Likelihood',
    selected: 'Selected codes: {category} / {likelihood}',
  },
  filesTest: {
    title: 'Files test',
    body: 'Four variants. Single-file replace uploads the new file first, then deletes the previous one. Image galleries open a lightbox.',
    oneDocTitle: '1. Single document',
    oneDocHint: 'Paperclip field for PDF, Office, txt, or csv. The file name and link sit below. No image preview.',
    oneAvatarTitle: '2. Avatar image',
    oneAvatarHint: 'Click the image (or the empty circle) to pick a photo. Shape and pixel size are props.',
    manyDocTitle: '3. Many documents',
    manyDocHint: 'Add several documents. They stay in a list below.',
    manyImagesTitle: '4. Image gallery',
    manyImagesHint: 'Add several images. Click a thumbnail to open the lightbox.',
  },
  home: {
    title: 'Welcome',
    body: 'Layouts come from route.meta.layout. Home uses the web layout with a single main view. Workspace adds a context panel. Sign in uses the auth layout.',
    openWorkspace: 'Open workspace',
    signin: 'Sign in',
    vuetifyChrome: 'Vuetify chrome (empty table uses the $vuetify catalog)',
    tableName: 'Name',
    tableStatus: 'Status',
  },
  auth: {
    title: 'Sign in',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    signOut: 'Sign out',
    signedIn: 'Signed in as {email}.',
    demoHint: "Local demo admin is admin{'@'}localhost / admin.",
    back: 'Back to app',
  },
  context1: {
    title: 'Context 1',
    body: 'First component hosted by Context.vue.',
  },
  context2: {
    title: 'Context 2',
    body: 'Second component hosted by Context.vue.',
  },
  footer: 'INTELLEKTRA © 2026',
}
