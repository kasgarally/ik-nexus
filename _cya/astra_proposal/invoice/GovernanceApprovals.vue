<script setup>
import { ref } from "vue";
defineProps({ items: { type: Array, default: () => [] } });
const emit = defineEmits(["view-all"]);
const selected = ref(null);
const action = ref("");
const dialog = ref(false);
const confirmed = ref(false);
function preview(item, choice) {
  selected.value = item;
  action.value = choice;
  dialog.value = true;
}
</script>
<template>
  <v-card class="governance-approvals">
    <header class="governance-approvals__header">
      <h2 class="app-section-title">My approvals</h2>
      <button class="app-link app-small" @click="emit('view-all')">
        View all (12) <v-icon icon="mdi-arrow-right" size="16" />
      </button>
    </header>
    <article v-for="item in items" :key="item.id" class="governance-approval">
      <div class="governance-approval__icon">
        <v-icon icon="mdi-file-document-outline" color="primary" size="22" />
      </div>
      <div class="governance-approval__body">
        <h3>{{ item.title }}</h3>
        <p class="app-small app-muted">{{ item.category }}</p>
        <p class="app-small app-muted mt-1">Submitted by {{ item.by }}</p>
        <div class="governance-approval__footer">
          <span class="app-small app-muted">{{ item.date }}</span>
          <div class="d-flex ga-2">
            <v-btn
              color="primary"
              size="small"
              @click="preview(item, 'Approve')"
              >Approve</v-btn
            ><v-btn
              variant="outlined"
              size="small"
              @click="preview(item, 'Reject')"
              >Reject</v-btn
            >
          </div>
        </div>
      </div>
    </article>
    <v-dialog v-model="dialog" max-width="480"
      ><v-card :title="action + ' — preview'"
        ><v-card-text
          ><p class="font-weight-medium mb-3">{{ selected?.title }}</p>
          <p>
            This demonstration does not change an approval record. Connect your
            permission checks, review screen and approval workflow here.
          </p></v-card-text
        ><v-card-actions
          ><v-spacer /><v-btn variant="text" @click="dialog = false"
            >Cancel</v-btn
          ><v-btn
            color="primary"
            @click="
              dialog = false;
              confirmed = true;
            "
            >Close preview</v-btn
          ></v-card-actions
        ></v-card
      ></v-dialog
    >
    <v-snackbar v-model="confirmed"
      >Preview closed. No approval decision was recorded.<template #actions
        ><v-btn variant="text" @click="confirmed = false"
          >Close</v-btn
        ></template
      ></v-snackbar
    >
  </v-card>
</template>
<style scoped>
.governance-approvals {
  padding: 20px;
  height: 100%;
}
.governance-approvals__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
}
.governance-approval {
  display: flex;
  gap: 12px;
  padding: 14px 10px;
  border: 1px solid rgb(var(--v-theme-outline));
  border-radius: 5px;
  margin-bottom: 10px;
}
.governance-approval:last-of-type {
  margin-bottom: 0;
}
.governance-approval__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 5px;
  background: rgba(var(--v-theme-primary), 0.07);
}
.governance-approval__body {
  flex: 1;
  min-width: 0;
}
.governance-approval h3 {
  font-size: var(--app-body);
  font-weight: 500;
  line-height: 1.4;
  margin: 0 0 3px;
}
.governance-approval__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
</style>
