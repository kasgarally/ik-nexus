<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
Tabs and translate control for a localized map field
-->
<script setup>
import { useI18n } from 'vue-i18n'

defineProps({
  tabItems: { type: Array, required: true },
  showTranslate: { type: Boolean, default: false },
  fillEmptyDisabled: { type: Boolean, default: false },
  replaceAllDisabled: { type: Boolean, default: false },
  translating: { type: Boolean, default: false },
})

const activeTab = defineModel({ type: String, required: true })
const emit = defineEmits(['fill-empty', 'replace-all'])
const { t } = useI18n()
</script>

<template>
  <div class="n-translatable-toolbar d-flex align-center justify-end mb-1">
    <v-tabs
      v-model="activeTab"
      density="compact"
      color="primary"
      align-tabs="end"
      height="22"
    >
      <v-tab
        v-for="item in tabItems"
        :key="item.code"
        :value="item.code"
        min-width="28"
        height="22"
        class="px-1"
      >
        {{ item.label }}
      </v-tab>
    </v-tabs>
    <div v-if="showTranslate" class="d-flex align-center">
      <v-btn
        icon="mdi-translate"
        variant="text"
        size="x-small"
        :disabled="fillEmptyDisabled"
        :loading="translating"
        :aria-label="t('locale.translateAria')"
        :title="t('locale.translate')"
        @click="emit('fill-empty')"
      />
      <v-menu>
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            icon="mdi-menu-down"
            variant="text"
            size="x-small"
            :disabled="replaceAllDisabled"
            :aria-label="t('locale.translateReplaceAll')"
          />
        </template>
        <v-list density="compact">
          <v-list-item
            :title="t('locale.translateReplaceAll')"
            :disabled="replaceAllDisabled"
            @click="emit('replace-all')"
          />
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<style scoped>
.n-translatable-toolbar :deep(.v-tabs) {
  min-height: 22px;
}

.n-translatable-toolbar :deep(.v-tab) {
  font-size: 0.6875rem;
  letter-spacing: 0.02em;
  min-height: 22px;
  padding-inline: 6px;
}

.n-translatable-toolbar :deep(.v-btn--icon) {
  width: 22px;
  height: 22px;
}

.n-translatable-toolbar :deep(.v-btn--icon .v-icon) {
  font-size: 0.9rem;
}

.n-translatable-toolbar :deep(.v-tabs--density-compact.v-tabs.v-slide-group--horizontal .v-tab--selected .v-tab__slider) {
  height: 1px;
}
</style>
