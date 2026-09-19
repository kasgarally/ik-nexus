<script setup>
import { computed, ref } from "vue";
import { NDatePicker } from "@nexus/ui";
import InvoiceSummary from "./InvoiceSummary.vue";
// Mock form only. Replace preview submission with your application command.
const form = ref(null);
const customer = ref("Atlas Consulting");
const invoiceDate = ref("2026-09-16");
const dueDate = ref("2026-10-16");
const currency = ref("MAD");
const reference = ref("INV-2026-0042");
const notes = ref("");
const files = ref([]);
const notice = ref("");
const noticeOpen = ref(false);
const confirmReset = ref(false);
const taxRate = 20; // Illustration only; not a jurisdictional tax rule.
let nextId = 3;
const initialLines = () => [
  { id: 1, description: "Consulting services", quantity: 1, price: "10000.00" },
  { id: 2, description: "Support services", quantity: 1, price: "2000.00" },
];
const lines = ref(initialLines());
const required = (value) =>
  String(value ?? "").trim().length > 0 || "This field is required.";
// Demo supports whole quantities and at most two price decimal places.
const quantityRule = (value) =>
  (/^\d+$/.test(String(value)) &&
    Number(value) > 0 &&
    Number(value) <= 1000000) ||
  "Use a whole quantity from 1 to 1,000,000.";
const priceRule = (value) =>
  /^\d{1,8}(\.\d{1,2})?$/.test(String(value)) ||
  "Use a non-negative price with up to 2 decimal places.";
const dueDateRule = (value) =>
  (!!value && value >= invoiceDate.value) ||
  "Due date must be on or after invoice date.";
const lineMinor = (row) =>
  quantityRule(row.quantity) === true && priceRule(row.price) === true
    ? Math.round(Number(row.price) * 100) * Number(row.quantity)
    : 0;
const subtotalMinor = computed(() =>
  lines.value.reduce((sum, row) => sum + lineMinor(row), 0),
);
const taxMinor = computed(() =>
  Math.round((subtotalMinor.value * taxRate) / 100),
);
const money = (minor) =>
  new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minor / 100);
function showNotice(message) {
  notice.value = message;
  noticeOpen.value = true;
}
function addLine() {
  lines.value.push({
    id: nextId++,
    description: "",
    quantity: 1,
    price: "0.00",
  });
}
function reset() {
  customer.value = "Atlas Consulting";
  invoiceDate.value = "2026-09-16";
  dueDate.value = "2026-10-16";
  currency.value = "MAD";
  reference.value = "INV-2026-0042";
  notes.value = "";
  files.value = [];
  lines.value = initialLines();
  nextId = 3;
  confirmReset.value = false;
  form.value?.resetValidation();
}
async function submit() {
  const result = await form.value?.validate();
  if (result?.valid)
    showNotice(
      "Preview validated. No invoice was saved or sent. Connect your submission workflow here.",
    );
}
</script>
<template>
  <div class="invoice-page">
    <nav class="invoice-breadcrumb app-small app-muted" aria-label="Breadcrumb">
      Receivables
      <span aria-hidden="true">/</span>
      Invoices
      <span aria-hidden="true">/</span>
      <span aria-current="page">New invoice</span>
    </nav>
    <header class="invoice-heading">
      <h1 class="app-page-title">New invoice</h1>
      <v-chip size="small" variant="tonal" class="app-status">Draft</v-chip>
    </header>
    <v-form ref="form" @submit.prevent="submit">
      <div class="invoice-grid">
        <v-card class="invoice-form-card">
          <h2 class="app-section-title mb-7">Invoice details</h2>
          <div class="invoice-fields">
            <div class="invoice-field invoice-field--customer">
              <label for="invoice-customer">
                Customer
                <span class="text-error">*</span>
              </label>
              <v-select
                id="invoice-customer"
                v-model="customer"
                :items="[
                  'Atlas Consulting',
                  'Northbridge Services',
                  'Cedar Advisory',
                ]"
                :rules="[required]"
                required
                hide-details="auto"
              />
            </div>
            <div class="invoice-field">
              <label for="invoice-date">
                Invoice date
                <span class="text-error">*</span>
              </label>
              <n-date-picker
                id="invoice-date"
                v-model="invoiceDate"
                :rules="[required]"
                required
                hide-details="auto"
              />
            </div>
            <div class="invoice-field">
              <label for="invoice-due-date">
                Due date
                <span class="text-error">*</span>
              </label>
              <n-date-picker
                id="invoice-due-date"
                v-model="dueDate"
                :min="invoiceDate"
                :rules="[required, dueDateRule]"
                required
                hide-details="auto"
              />
            </div>
            <div class="invoice-field">
              <label for="invoice-currency">
                Currency
                <span class="text-error">*</span>
              </label>
              <v-select
                id="invoice-currency"
                v-model="currency"
                :items="['MAD', 'QAR', 'EUR', 'USD', 'GBP']"
                :rules="[required]"
                required
                hide-details="auto"
              />
            </div>
            <div class="invoice-field invoice-field--reference">
              <label for="invoice-reference">
                Reference
                <span class="text-error">*</span>
              </label>
              <v-text-field
                id="invoice-reference"
                v-model="reference"
                :rules="[required]"
                maxlength="64"
                required
                hide-details="auto"
              />
            </div>
          </div>
          <v-divider class="my-8" />
          <h2 class="app-section-title mb-5">Line items</h2>
          <div
            class="app-table-scroll invoice-line-scroll"
            role="region"
            aria-label="Editable invoice lines; scroll horizontally on small screens"
            tabindex="0"
          >
            <table class="invoice-lines">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Description</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Unit price ({{ currency }})</th>
                  <th scope="col">Amount ({{ currency }})</th>
                  <th scope="col">
                    <span class="invoice-sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(line, index) in lines" :key="line.id">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <v-text-field
                      v-model="line.description"
                      :aria-label="'Description for line ' + (index + 1)"
                      :rules="[required]"
                      required
                      density="compact"
                      hide-details="auto"
                    />
                  </td>
                  <td>
                    <v-text-field
                      v-model="line.quantity"
                      :aria-label="'Quantity for line ' + (index + 1)"
                      inputmode="numeric"
                      :rules="[quantityRule]"
                      required
                      density="compact"
                      hide-details="auto"
                    />
                  </td>
                  <td>
                    <v-text-field
                      v-model="line.price"
                      :aria-label="'Unit price for line ' + (index + 1)"
                      inputmode="decimal"
                      :rules="[priceRule]"
                      required
                      density="compact"
                      hide-details="auto"
                    />
                  </td>
                  <td class="invoice-line-amount">
                    {{ money(lineMinor(line)) }}
                  </td>
                  <td>
                    <v-btn
                      icon="mdi-trash-can-outline"
                      variant="text"
                      size="small"
                      :aria-label="'Remove line ' + (index + 1)"
                      :disabled="lines.length === 1"
                      @click="lines.splice(index, 1)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <v-btn
            variant="text"
            color="primary"
            prepend-icon="mdi-plus-circle-outline"
            class="mt-3"
            @click="addLine"
          >
            Add line
          </v-btn>
          <div class="invoice-field mt-8">
            <label for="invoice-notes">Notes</label>
            <v-textarea
              id="invoice-notes"
              v-model="notes"
              placeholder="Add any additional information…"
              rows="3"
              hide-details="auto"
            />
          </div>
        </v-card>
        <div class="invoice-context">
          <InvoiceSummary
            :subtotal-minor="subtotalMinor"
            :tax-minor="taxMinor"
            :currency="currency"
            :tax-rate="taxRate"
          >
            <template #attachments>
              <v-card class="invoice-attachments">
                <h2 class="app-section-title mb-5">
                  <v-icon icon="mdi-paperclip" size="24" class="me-2" />
                  Attachments
                </h2>
                <v-file-input
                  v-model="files"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  label="Select attachments"
                  prepend-icon=""
                  prepend-inner-icon="mdi-cloud-upload-outline"
                  show-size
                  chips
                  hide-details="auto"
                />
                <p class="app-small app-muted mt-3">
                  PDF, JPG or PNG. Files remain in this browser preview; nothing
                  is uploaded.
                </p>
                <div class="app-attachment">
                  <v-icon icon="mdi-file-pdf-box" color="error" />
                  <div>
                    project-proposal.pdf
                    <div class="app-small app-muted">
                      234 KB · Example attachment
                    </div>
                  </div>
                </div>
              </v-card>
            </template>
          </InvoiceSummary>
        </div>
      </div>
      <footer class="invoice-footer">
        <v-btn variant="outlined" @click="confirmReset = true">Cancel</v-btn>
        <v-btn type="submit" variant="tonal" color="primary">Submit</v-btn>
      </footer>
    </v-form>
    <v-dialog v-model="confirmReset" max-width="420">
      <v-card title="Reset invoice preview?">
        <v-card-text>
          Your local edits will be replaced with the sample invoice.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="confirmReset = false">
            Keep editing
          </v-btn>
          <v-btn color="primary" @click="reset">Reset preview</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="noticeOpen" :timeout="7000">
      {{ notice }}
      <template #actions>
        <v-btn variant="text" @click="noticeOpen = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<style scoped>
.invoice-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
}
.invoice-heading {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}
.invoice-heading .app-page-title {
  margin: 0;
}
.invoice-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}
.invoice-grid > * {
  min-width: 0;
}
.invoice-form-card {
  padding: 24px;
}
.invoice-fields {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 24px 20px;
}
.invoice-field > label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}
.invoice-field--reference {
  grid-column: span 2;
}
.invoice-context {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.invoice-attachments {
  padding: 24px;
}
.invoice-lines {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
}
.invoice-lines th {
  background: rgb(var(--v-theme-background));
  text-align: start;
  font-size: var(--app-small);
  font-weight: 500;
  padding: 14px 10px;
  white-space: nowrap;
}
.invoice-lines td {
  padding: 14px 10px;
  vertical-align: top;
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}
.invoice-lines td:first-child {
  padding-top: 24px;
}
.invoice-lines td:nth-child(2) {
  min-width: 210px;
}
.invoice-lines td:nth-child(3) {
  width: 100px;
  min-width: 85px;
}
.invoice-lines td:nth-child(4) {
  min-width: 130px;
}
.invoice-line-amount {
  padding-top: 24px !important;
  text-align: end;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.invoice-lines :deep(input) {
  font-variant-numeric: tabular-nums;
}
.invoice-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding: 18px 24px;
  border-top: 1px solid rgb(var(--v-theme-outline));
  background: rgb(var(--v-theme-surface));
}
.invoice-footer .v-btn {
  min-width: 100px;
}
.invoice-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (max-width: 1199px) {
  .invoice-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .invoice-context {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}
@media (max-width: 839px) {
  .invoice-fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .invoice-field--customer {
    grid-column: 1 / -1;
  }
  .invoice-field--reference {
    grid-column: auto;
  }
}
@media (max-width: 599px) {
  .invoice-form-card,
  .invoice-attachments {
    padding: 20px 16px;
  }
  .invoice-fields,
  .invoice-context {
    grid-template-columns: minmax(0, 1fr);
  }
  .invoice-field--customer {
    grid-column: auto;
  }
  .invoice-footer {
    padding-inline: 16px;
  }
}
</style>
