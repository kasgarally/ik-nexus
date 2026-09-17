<script setup>
import { computed, nextTick, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  submissions,
  statusColour,
  defaultSelection,
} from "./mockSubmissions.js";
const route = useRoute();
const router = useRouter();
const search = ref("");
const status = ref("All statuses");
const firm = ref("All firms");
const period = ref("All periods");
const tab = ref("all");
const selected = computed(() =>
  typeof route.query.submission === "string"
    ? route.query.submission
    : defaultSelection,
);
const firms = ["All firms", ...submissions.map((row) => row.firm)];
const filtered = computed(() =>
  submissions.filter(
    (row) =>
      (!search.value ||
        [row.id, row.firm, row.type]
          .join(" ")
          .toLowerCase()
          .includes(search.value.toLowerCase())) &&
      (status.value === "All statuses" || row.status === status.value) &&
      (firm.value === "All firms" || row.firm === firm.value) &&
      (period.value === "All periods" || row.period === period.value) &&
      (tab.value === "all" ||
        (tab.value === "pending"
          ? row.status === "Pending review"
          : row.status === "Overdue")),
  ),
);
async function select(row) {
  await router.replace({ query: { ...route.query, submission: row.id } });
  await nextTick();
  const heading = document.getElementById("submission-context-title");
  heading?.focus({ preventScroll: true });
  if (window.innerWidth < 1440)
    heading?.scrollIntoView({ block: "start", behavior: "auto" });
}
</script>
<template>
  <div class="app-register">
    <v-tabs v-model="tab" color="primary">
      <v-tab value="all">All submissions</v-tab>
      <v-tab value="pending">Pending review</v-tab>
      <v-tab value="overdue">Overdue</v-tab>
    </v-tabs>
    <div class="app-filter-bar">
      <v-text-field
        v-model="search"
        aria-label="Search submissions"
        placeholder="Search submissions…"
        prepend-inner-icon="mdi-magnify"
        density="compact"
        hide-details
        clearable
        @click:clear="search = ''"
      />
      <div>
        <label for="status-filter" class="app-filter-label">Status</label>
        <v-select
          id="status-filter"
          v-model="status"
          :items="[
            'All statuses',
            'Submitted',
            'Pending review',
            'In review',
            'Overdue',
          ]"
          density="compact"
          hide-details
        />
      </div>
      <div>
        <label for="firm-filter" class="app-filter-label">Firm</label>
        <v-select
          id="firm-filter"
          v-model="firm"
          :items="firms"
          density="compact"
          hide-details
        />
      </div>
      <div>
        <label for="period-filter" class="app-filter-label">Period</label>
        <v-select
          id="period-filter"
          v-model="period"
          :items="['All periods', 'Q1 2026', 'Q2 2026']"
          density="compact"
          hide-details
        />
      </div>
    </div>
    <v-card>
      <div
        class="app-table-scroll"
        tabindex="0"
        role="region"
        aria-label="Submissions table; scroll horizontally on small screens"
      >
        <table class="app-table">
          <thead>
            <tr>
              <th scope="col">Reference</th>
              <th scope="col">Firm</th>
              <th scope="col">Return</th>
              <th scope="col">Due date</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in filtered"
              :key="row.id"
              :class="{ 'is-selected': selected === row.id }"
            >
              <td>
                <button
                  class="app-link"
                  :aria-current="selected === row.id ? 'true' : undefined"
                  :aria-label="'View submission ' + row.id"
                  @click="select(row)"
                >
                  {{ row.id }}
                </button>
              </td>
              <td>{{ row.firm }}</td>
              <td>{{ row.type }}</td>
              <td>{{ row.due }}</td>
              <td>
                <v-chip
                  class="app-status"
                  :color="statusColour(row.status)"
                  variant="tonal"
                  size="small"
                >
                  {{ row.status }}
                </v-chip>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="5">No submissions match your filters.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="app-table-footer">
        <span class="app-muted" role="status">
          Showing {{ filtered.length ? "1–" + filtered.length : "0" }} of
          {{ filtered.length }} submissions
        </span>
        <div class="app-actions">
          <v-btn
            icon="mdi-chevron-left"
            size="small"
            variant="text"
            disabled
            aria-label="Previous page"
          />
          <v-btn color="primary" size="small" aria-current="page">1</v-btn>
          <v-btn
            icon="mdi-chevron-right"
            size="small"
            variant="text"
            disabled
            aria-label="Next page"
          />
        </div>
      </div>
    </v-card>
  </div>
</template>
