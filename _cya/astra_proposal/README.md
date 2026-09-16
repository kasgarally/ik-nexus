# INTELLEKTRA UI kit — regulatory register

Implementation of the approved regulatory submissions concept. Uses Vue 3, Vuetify 4 and Vue Router. Designed for your existing Meteor 3.5.2 application; no Meteor APIs are needed by this static demo.

## Files and placement

- `vuetify.config.js`: replacement options for createVuetify; keep at its current location so `./i18n/index.js` resolves.
- `main.css`: load after `vuetify/styles` and your existing resets. Replace the supplied minimal main.css.
- `WebLayout.vue`: replacement layout; preserves `@nexus/ui` LocaleSelect and `../usePublicSetup.js`. Adjust these two imports only if you move the file.
- `SubmissionsHeading.vue`: heading and preview actions.
- `SubmissionsRegister.vue`: mock records, working local search, filters, tabs and selection.
- `SubmissionContext.vue`: selected record and working context tabs.
- `mockSubmissions.js`: keep beside the three submissions components.

Keep exactly one `<v-app>` in your root application. WebLayout does not create a second one. Continue registering your configured Vuetify instance and vue-i18n on the same Vue application. Load MDI font CSS as in your existing app (`@mdi/font/css/materialdesignicons.css`). No extra icon package is introduced.

## Route wiring example

Replace paths below with your component locations. The extra `heading` outlet lets the page heading span both the register and context columns.

```js
import WebLayout from './layouts/WebLayout.vue'
import SubmissionsHeading from './pages/SubmissionsHeading.vue'
import SubmissionsRegister from './pages/SubmissionsRegister.vue'
import SubmissionContext from './pages/SubmissionContext.vue'

const routes = [{
  path: '/',
  component: WebLayout,
  children: [{
    path: 'submissions',
    components: {
      default: SubmissionsRegister,
      heading: SubmissionsHeading,
      context: SubmissionContext,
    },
  }],
}]
```

Visit `/submissions`. The default selected record is REG-2026-0148. Selection is persisted in `?submission=REG-2026-0148`, preserving other query parameters. Unknown IDs display an explicit not-found state. Selection focuses the context heading; below 1440px it scrolls to the stacked context. Filtering does not silently change the selected record.

If you already have a parent layout route, add only the child definition to it. For other pages, omit heading or context as appropriate. The context column renders only when a named context component exists.

## Typography and dimensions

The chosen implementation font is Arial, with Helvetica Neue and sans-serif fallbacks. Arial is normally available on Windows, including your development environment. This is an explicit visual approximation of the generated reference, which does not expose an identifiable font or measurable CSS. No external font request is made. Rendering can differ across operating systems; distribute a licensed webfont if exact cross-platform glyph consistency becomes necessary.

| Viewport | Body / controls | Small text | Page title | Section title |
| --- | --- | --- | --- | --- |
| Desktop, 1145px+ | 14px | 13px | 30px | 22px |
| Tablet, 600–1144px | 15px | 13px | 28px | 22px |
| Mobile, below 600px | 16px | 14px | 24px | 20px |

All values are rem-based with the browser default root retained. Table status chips stay 12px; data tables scroll locally on narrow screens. App bar is 64px, navigation 232px, page padding 24px desktop / 16px mobile, context 360px. Context sits beside the register from 1440px; below that it stacks. Below 1145px navigation becomes temporary with a menu button. The root direction comes from your existing vue-i18n/Vuetify RTL integration. Demo content is English; translate those literal strings before releasing another language. The shell supports existing translation keys with English fallbacks.

## Palette

| Role | Light | Dark |
| --- | --- | --- |
| Background | #F5F7FA | #101828 |
| Surface | #FFFFFF | #182230 |
| Text | #182230 | #E6EAF0 |
| Muted text | #526176 | #AAB8CA |
| Border | #DCE3ED | #344054 |
| Primary | #2457C5 | #91B5FF |
| Secondary | #087F8C | #64CDD2 |
| Error | #B42318 | #FDA29B |
| Warning | #B54708 | #FEC84B |
| Success | #067647 | #75E0A7 |
| Information | #175CD3 | #84CAFF |

Theme colours are the source of truth. CSS reads generated Vuetify RGB variables so it follows theme changes. Borders for visual grouping are intentionally subtle; input outlines retain stronger contrast. Full accessibility validation is still required in the integrated application.

## Preview-only behaviour

- Heading buttons and Review submission show an explicit preview notice; they do not perform business operations.
- Global search is read-only; local register search works.
- Attachments are display records, not downloadable files.
- One page of seven records is supplied. Pagination arrows are disabled intentionally.
- Sidebar destinations are examples; create or replace those routes.
- User name/avatar are demonstration values. Replace them with your authenticated identity.
- Existing company branding is used when available; otherwise the fallback wordmark is shown.
- Mock filters operate on display values. Production date filters, sorting, paging, permissions and server queries belong in your application.
- Theme toggling is session-local; persist preferences through your existing application if needed.

## Verification performed

- Vue 3.5.39 compiler: script and template compilation passed for all four SFCs.
- Node syntax checks passed for config and mock data.
- No Meteor runtime test was performed.
- Browser screenshot comparison was not completed because Chromium was unavailable. This is a close implementation of the approved design, not a verified pixel-perfect reproduction. Check with your actual installed Vuetify 4 patch version, fonts and app stylesheet order.

Suggested integration check: open at 1536x1024, 1024x768 and 390x844; select a record, filter by status, toggle dark mode, use keyboard navigation, and test Arabic RTL plus 200% zoom. Ensure only the table scrolls horizontally.

Framework references: https://vuetifyjs.com/en/features/theme/ and https://vuetifyjs.com/en/features/global-configuration/.
