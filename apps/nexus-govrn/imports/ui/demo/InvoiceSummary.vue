<script setup>
import { computed } from 'vue'
const props = defineProps({
  subtotalMinor: { type: Number, default: 1200000 },
  taxMinor: { type: Number, default: 240000 },
  currency: { type: String, default: 'MAD' },
  taxRate: { type: Number, default: 20 },
})
const totalMinor = computed(() => props.subtotalMinor + props.taxMinor)
const money = value => new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(value / 100)
</script>
<template>
  <aside class="invoice-summary" aria-label="Invoice summary">
    <v-card class="invoice-summary__card">
      <h2 class="app-section-title">Summary</h2>
      <dl class="invoice-summary__totals">
        <dt>Subtotal</dt><dd>{{ currency }} {{ money(subtotalMinor) }}</dd>
        <dt>Tax (illustrative {{ taxRate }}%)</dt><dd>{{ currency }} {{ money(taxMinor) }}</dd>
      </dl>
      <v-divider />
      <div class="invoice-summary__total" aria-live="polite" aria-atomic="true"><strong>Total</strong><strong>{{ currency }} {{ money(totalMinor) }}</strong></div>
    </v-card>
    <slot name="attachments" />
    <v-alert type="warning" variant="tonal" border="start" class="invoice-summary__alert">
      <div class="font-weight-bold mb-1">Approval required</div>
      <p class="app-small">This invoice requires approval before it can be sent to the customer.</p>
    </v-alert>
  </aside>
</template>
<style scoped>
.invoice-summary { display: grid; gap: 24px; align-content: start; }
.invoice-summary__card { padding: 24px; }
.invoice-summary__totals { display: grid; grid-template-columns: 1fr auto; gap: 22px 16px; margin-block: 30px; }
.invoice-summary__totals dd { margin: 0; text-align: end; font-variant-numeric: tabular-nums; }
.invoice-summary__total { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; padding-block-start: 24px; font-size: 1.125rem; font-variant-numeric: tabular-nums; }
.invoice-summary__alert { border-radius: 6px; }
@media (max-width: 599px) { .invoice-summary__card { padding: 20px; } }
</style>
