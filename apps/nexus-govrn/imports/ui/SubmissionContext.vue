<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  submissions,
  statusColour,
  defaultSelection,
} from "./mockSubmissions.js";
const route = useRoute();
const tab = ref("summary");
const notice = ref(false);
const sampleAttachments = [
  ["Return.pdf", "mdi-file-pdf-box", "error", "1.2 MB"],
  ["Supporting-data.xlsx", "mdi-file-excel-box", "success", "840 KB"],
];
const record = computed(() =>
  submissions.find(
    (row) => row.id === (route.query.submission || defaultSelection),
  ),
);
watch(
  () => route.query.submission,
  () => {
    tab.value = "summary";
  },
);
</script>
<template>
  <v-card class="app-context-card">
    <h2 id="submission-context-title" class="app-section-title" tabindex="-1">
      Submission details
    </h2>
    <template v-if="record">
      <p class="font-weight-medium mb-3">{{ record.id }}</p>
      <v-chip
        class="app-status"
        :color="statusColour(record.status)"
        variant="tonal"
        size="small"
      >
        {{ record.status }}
      </v-chip>
      <dl class="app-detail-list">
        <dt>Firm</dt>
        <dd>{{ record.firm }}</dd>
        <dt>Return type</dt>
        <dd>{{ record.type }}</dd>
        <dt>Reporting period</dt>
        <dd>{{ record.period }}</dd>
        <dt>Due date</dt>
        <dd>{{ record.due }}</dd>
        <dt>Assigned reviewer</dt>
        <dd>Nadia Salem</dd>
      </dl>
      <v-tabs v-model="tab" color="primary" grow density="compact">
        <v-tab value="summary">Summary</v-tab>
        <v-tab value="documents">Documents</v-tab>
        <v-tab value="activity">Activity</v-tab>
      </v-tabs>
      <v-tabs-window v-model="tab" class="app-context-body">
        <v-tabs-window-item value="summary">
          <h3 class="text-body-2 font-weight-bold mb-2">Submission summary</h3>
          <p class="app-muted">
            {{ record.type }} for {{ record.firm }} covering
            {{ record.period }}. Review the supporting documents and record your
            assessment.
          </p>
          <h3 class="text-body-2 font-weight-bold mt-6 mb-2">
            Attachments (2)
          </h3>
          <div
            v-for="[name, icon, colour, size] in sampleAttachments"
            :key="name"
            class="app-attachment"
          >
            <v-icon :icon="icon" :color="colour" size="28" />
            <div>
              <div>{{ record.firm }}_{{ name }}</div>
              <div class="app-small app-muted">
                {{ size }} · Sample attachment
              </div>
            </div>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="documents">
          <div
            v-for="[name, icon, colour, size] in sampleAttachments"
            :key="name"
            class="app-attachment"
          >
            <v-icon :icon="icon" :color="colour" size="28" />
            <div>
              <div>{{ record.firm }}_{{ name }}</div>
              <div class="app-small app-muted">
                {{ size }} · Sample attachment
              </div>
            </div>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="activity">
          <h3 class="text-body-2 font-weight-bold mb-3">Sample activity</h3>
          <p>Record assigned to Nadia Salem.</p>
          <p class="app-muted mt-2">Supporting documents received.</p>
        </v-tabs-window-item>
      </v-tabs-window>
      <v-btn block color="primary" height="44" @click="notice = true">
        Review submission
      </v-btn>
      <v-snackbar v-model="notice">
        Static preview: connect your review workflow here.
        <template #actions>
          <v-btn variant="text" @click="notice = false">Close</v-btn>
        </template>
      </v-snackbar>
    </template>
    <p v-else class="app-muted mt-4">
      Submission not found. Select a reference from the register.
    </p>
  </v-card>
</template>
