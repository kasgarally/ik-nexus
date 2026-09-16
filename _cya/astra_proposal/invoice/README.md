# Invoice and governance screens

Add-on components for the INTELLEKTRA Vuetify 4 UI kit previously supplied. Keep the existing vuetify.config.js, main.css and WebLayout.vue. These new components inherit its palette, responsive typography and theme variables. Each page includes its own heading and internal columns, so register it in the default outlet only.

## Files

- InvoicePage.vue: invoice form, editable lines, notes, local attachment selection and preview submission.
- InvoiceSummary.vue: totals, attachment slot and approval notice. Explicit props; no global mutable state.
- GovernanceDashboard.vue: overview with metrics, attention table, recent activity and control coverage.
- GovernanceApprovals.vue: reusable approvals card with demonstration dialogs.
- mockGovernance.js: fictional dashboard snapshot.
- navigation.example.js: optional menu profiles matching the earlier WebLayout items array.

Keep these six files together, or update their relative imports after moving them. Vue 3, Vuetify 4 and MDI icons are the only component dependencies. The dashboard does not need a chart library: coverage bars use v-progress-linear. CSS is scoped to the components and reads the existing global design tokens.

## Routes

Add these child routes below your existing WebLayout route:

```js
import InvoicePage from './pages/InvoicePage.vue'
import GovernanceDashboard from './pages/GovernanceDashboard.vue'

const childRoutes = [
  { path: 'receivables/invoices/new', component: InvoicePage },
  { path: 'governance', component: GovernanceDashboard },
]
```

The parent layout supplies the single application shell. Do not give these routes named heading/context components: their headings and internal context are already included. Registering another named context would unnecessarily constrain the page width. Your existing regulatory submissions route can continue using its three named components.

The invoice summary is a separate component within InvoicePage so reactive totals are passed directly through props. You can reuse it independently:

```vue
<InvoiceSummary
  :subtotal-minor="1200000"
  :tax-minor="240000"
  currency="MAD"
  :tax-rate="20"
/>
```

Those amounts are minor units: 1,200,000 = MAD 12,000.00. The default example totals MAD 14,400.00, including illustrative 20% tax. This is a UI demonstration, not a tax rule.

## Behaviour

Invoice:
- Add/remove lines; at least one line remains.
- Totals update locally. Quantities must be positive whole numbers; prices permit up to two decimal places.
- Invalid line values contribute zero to the preview and block valid submission.
- Required fields and due date are checked by v-form.
- Submit validates and displays a preview notice. It does not save, post, send or approve an invoice.
- Cancel opens a reset confirmation and restores the sample data if confirmed.
- Currency changes the display label; it does not perform currency conversion.
- Selected attachments remain in browser memory. No file upload or download occurs.
- Native date fields use the browser's display formatting; stored values are YYYY-MM-DD.
- The form and summary sit side by side at 1200px and above; below that the summary stacks. Fields collapse to one column on mobile. The line-items table scrolls locally.

Governance:
- Snapshot is fixed at 16 September 2026, matching the design.
- Four metric cards, five attention items, three approval previews, five activity items and five coverage bars.
- Portfolio counts intentionally exceed the few records displayed in each preview list.
- Action buttons display clearly labelled previews. They do not modify business data.
- Metrics move from four columns to two below 1440px; the attention and approvals cards stack at that breakpoint. Lower cards stack below 1200px.
- Semantic labels accompany all status colours.

Use server-side decimal calculations and your configured tax/rounding rules in production. The demo arithmetic, file controls and validation do not replace financial validation, upload enforcement, permissions or approval workflows.

## Match the sidebar

The previous WebLayout lists regulatory navigation. To reproduce the corresponding governance/ERP image, replace its `items` array with one of the exported arrays in navigation.example.js. Those links are examples: create the destinations you need.

For one app hosting both previews, a computed menu can read your route meta, for example:

```js
import { governanceNavigation, erpNavigation } from './navigation.example.js'
const items = computed(() => route.meta.navigation === 'erp'
  ? erpNavigation
  : governanceNavigation)
```

Set `meta: { navigation: 'erp' }` on the invoice route, and `meta: { navigation: 'governance' }` on the dashboard route. Adjust the import path. The existing template iterates the same array shape.

## Font clarification

There is no known font name for the generated reference images. Image generation rendered letter shapes; it did not provide a font file, CSS family or exact font-size metadata. A claim that the images use Helvetica Neue, Arial, Inter or any other specific font would be unsupported.

The earlier kit declares:

```css
--app-font: Arial, 'Helvetica Neue', sans-serif;
```

Arial is first, so Helvetica Neue is only a fallback when Arial is unavailable. These pages retain that stack for consistency. A different font can be selected in one place by changing --app-font in main.css, after installing/loading that font. Cross-platform exact font matching requires a self-hosted licensed webfont, not a system-font fallback list.

The established type scale remains:

| Viewport | Body/controls | Page title |
| --- | --- | --- |
| Desktop, 1145px+ | 14px | 30px |
| Tablet, 600–1144px | 15px | 28px |
| Mobile, below 600px | 16px | 24px |

Supporting table labels and chips intentionally use smaller sizes. The dashboard KPI values stay 30px. Font sizes use rem so browser zoom and user preferences remain effective.

## Validation and limits

All four new Vue single-file components passed Vue 3.5.39 script/template compilation. JavaScript files passed Node syntax checks. Browser rendering and Meteor integration have not been verified; no pixel-perfect claim is made. The designs use actual components and theme tokens, but image-generated details, glyphs and spacing cannot be recovered exactly.

Before integrating real data, check desktop, tablet and mobile widths, light/dark mode, 200% zoom, keyboard use and Arabic RTL. The demo content is English; move literal strings into your existing localisation catalogues. Both pages inherit RTL direction and use logical spacing, but production translations may require further wrapping adjustments.
