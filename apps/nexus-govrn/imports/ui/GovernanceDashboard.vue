<script setup>
import { ref } from 'vue'
import GovernanceApprovals from './GovernanceApprovals.vue'
import { metrics, attention, approvals, activity, coverage } from './mockGovernance.js'
const notice = ref('')
const noticeOpen = ref(false)
function preview(action) { notice.value = action + ': connect this action to your application.'; noticeOpen.value = true }
</script>
<template>
  <div class="governance-dashboard">
    <header class="app-page-heading"><div><h1 class="app-page-title">Governance overview</h1><p class="app-muted">Wednesday, 16 September 2026</p></div><div class="app-actions"><v-btn color="primary" variant="outlined" prepend-icon="mdi-download" @click="preview('Export')">Export</v-btn><v-btn color="primary" prepend-icon="mdi-plus" @click="preview('New risk')">New risk</v-btn></div></header>
    <section class="governance-metrics" aria-label="Portfolio indicators">
      <v-card v-for="metric in metrics" :key="metric.title" class="governance-metric">
        <v-avatar :color="metric.colour" variant="tonal" size="54"><v-icon :icon="metric.icon" size="26" /></v-avatar>
        <div><h2>{{ metric.title }}</h2><p class="governance-metric__value">{{ metric.value }}</p><p class="governance-metric__trend app-small"><span :class="'text-' + metric.trendColour"><v-icon :icon="metric.direction" size="16" :aria-label="metric.direction === 'mdi-arrow-up' ? 'Increase' : 'Decrease'" role="img" /> {{ metric.change }}</span><span class="app-muted">{{ metric.comparison }}</span></p></div>
      </v-card>
    </section>
    <div class="governance-primary-grid">
      <v-card class="governance-card">
        <header class="governance-card__heading"><h2 class="app-section-title">Attention required</h2><button class="app-link app-small" @click="preview('View all attention items')">View all (24) <v-icon icon="mdi-arrow-right" size="16" /></button></header>
        <div class="app-table-scroll" tabindex="0" role="region" aria-label="Attention required table; scroll horizontally on small screens">
          <table class="governance-table"><thead><tr><th scope="col">Item</th><th scope="col">Owner</th><th scope="col">Due date</th><th scope="col">Status</th></tr></thead><tbody>
            <tr v-for="item in attention" :key="item.id">
              <td><div class="governance-item"><v-avatar :color="item.colour" variant="tonal" size="34" rounded="lg"><v-icon :icon="item.colour === 'primary' ? 'mdi-file-document-outline' : 'mdi-alert-outline'" size="23" /></v-avatar><div><button class="governance-item__link" @click="preview(item.title)">{{ item.title }}</button><p class="app-small app-muted">{{ item.category }}</p></div></div></td>
              <td><div class="governance-owner"><v-avatar size="28" color="primary" variant="tonal"><span class="app-small">{{ item.initials }}</span></v-avatar><div>{{ item.owner }}<p class="app-small app-muted">{{ item.team }}</p></div></div></td>
              <td class="app-small app-muted governance-nowrap">{{ item.due }}</td><td><v-chip class="app-status" :color="item.colour" variant="tonal" size="small">{{ item.status }}</v-chip></td>
            </tr>
          </tbody></table>
        </div>
      </v-card>
      <GovernanceApprovals :items="approvals" @view-all="preview('View all approvals')" />
    </div>
    <div class="governance-secondary-grid">
      <v-card class="governance-card">
        <header class="governance-card__heading"><h2 class="app-section-title">Recent activity</h2><button class="app-link app-small" @click="preview('View all activity')">View all activity <v-icon icon="mdi-arrow-right" size="16" /></button></header>
        <ul class="governance-activity"><li v-for="event in activity" :key="event.id"><v-icon :icon="event.icon" :color="event.colour" size="24" /><div class="governance-activity__main"><p>{{ event.title }}</p><p class="app-small app-muted">{{ event.detail }}</p></div><span class="app-small app-muted governance-activity__by">{{ event.by }}</span><span class="app-small app-muted governance-activity__when">{{ event.when }}</span></li></ul>
      </v-card>
      <v-card class="governance-card">
        <header class="governance-card__heading"><h2 class="app-section-title">Control coverage</h2><button class="app-link app-small" @click="preview('View controls')">View controls <v-icon icon="mdi-arrow-right" size="16" /></button></header>
        <div class="app-table-scroll" tabindex="0" role="region" aria-label="Control coverage table; scroll horizontally on small screens"><table class="governance-table governance-coverage"><thead><tr><th scope="col">Control domain</th><th scope="col">Coverage</th><th scope="col">Status</th></tr></thead><tbody><tr v-for="item in coverage" :key="item.domain"><td>{{ item.domain }}</td><td><div class="governance-progress"><v-progress-linear :model-value="item.value" color="secondary" bg-color="surface-light" :bg-opacity="1" height="10" rounded :aria-label="item.domain + ' coverage'" /><span class="app-small">{{ item.value }}%</span></div></td><td><v-chip class="app-status" :color="item.colour" variant="tonal" size="small">{{ item.status }}</v-chip></td></tr></tbody></table></div>
      </v-card>
    </div>
    <v-snackbar v-model="noticeOpen">{{ notice }}<template #actions><v-btn variant="text" @click="noticeOpen = false">Close</v-btn></template></v-snackbar>
  </div>
</template>
<style scoped>
.governance-dashboard { display: grid; gap: 18px; }
.governance-dashboard .app-page-heading { margin-bottom: 2px; }
.governance-metrics { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 16px; }
.governance-metric { display: flex; align-items: flex-start; gap: 16px; padding: 24px 20px; }
.governance-metric h2 { font-size: var(--app-body); font-weight: 400; margin: 1px 0 6px; }
.governance-metric__value { font-size: 1.875rem; font-weight: 700; line-height: 1.2; margin-bottom: 14px; font-variant-numeric: tabular-nums; }
.governance-metric__trend { display: flex; flex-wrap: wrap; gap: 4px 10px; }
.governance-primary-grid { display: grid; grid-template-columns: minmax(0,1.85fr) minmax(340px,1fr); gap: 18px; }
.governance-secondary-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px; }
.governance-primary-grid > *, .governance-secondary-grid > * { min-width: 0; }
.governance-card { padding: 20px; }
.governance-card__heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.governance-table { width: 100%; border-collapse: collapse; }
.governance-table th { text-align: start; background: rgb(var(--v-theme-background)); font-size: var(--app-small); font-weight: 500; padding: 10px; white-space: nowrap; }
.governance-table td { padding: 11px 10px; border-bottom: 1px solid rgb(var(--v-theme-outline)); }
.governance-table tr:last-child td { border-bottom: 0; }
.governance-item { display: flex; align-items: center; gap: 12px; min-width: 250px; }
.governance-item__link { font: inherit; background: none; border: 0; text-align: start; color: inherit; cursor: pointer; }
.governance-item__link:hover { color: rgb(var(--v-theme-primary)); text-decoration: underline; }
.governance-item__link:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
.governance-owner { display: flex; align-items: center; gap: 8px; min-width: 125px; }
.governance-nowrap { white-space: nowrap; }
.governance-activity { list-style: none; padding: 0; margin: 0; }
.governance-activity li { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgb(var(--v-theme-outline)); }
.governance-activity li:last-child { border-bottom: 0; }
.governance-activity__main { flex: 1; }
.governance-activity__when { min-width: 76px; text-align: end; }
.governance-coverage { font-size: var(--app-small); }
.governance-coverage td:first-child { min-width: 155px; }
.governance-progress { display: flex; align-items: center; gap: 12px; min-width: 135px; }
.governance-progress > .v-progress-linear { flex: 1; }
.governance-progress > span { min-width: 32px; text-align: end; font-variant-numeric: tabular-nums; }
@media (max-width: 1439px) { .governance-metrics { grid-template-columns: repeat(2,minmax(0,1fr)); } .governance-primary-grid { grid-template-columns: minmax(0,1fr); } }
@media (max-width: 1199px) { .governance-secondary-grid { grid-template-columns: minmax(0,1fr); } }
@media (max-width: 599px) { .governance-metric { padding: 16px 12px; gap: 10px; } .governance-metric > .v-avatar { display: none; } .governance-metric h2 { font-size: .875rem; } .governance-card { padding: 16px; } .governance-activity__by { display: none; } .governance-activity li { gap: 8px; } }
@media (max-width: 359px) { .governance-metrics { grid-template-columns: minmax(0,1fr); } }
</style>
