<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
v-textarea for a data-locale string map
-->
<script setup>
import { useTranslatableInput } from './useTranslatableInput.js'
import NTranslatableToolbar from './NTranslatableToolbar.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  modelValue: { type: [Object, String], default: () => ({}) },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const {
  activeTab,
  draft,
  fieldAttrs,
  fieldRequired,
  fieldRules,
  fillEmpty,
  fillEmptyDisabled,
  replaceAll,
  replaceAllDisabled,
  setActiveValue,
  showTabs,
  showTranslate,
  tabItems,
  translateError,
  translating,
  wrapperClass,
  wrapperStyle,
} = useTranslatableInput(props, emit)
</script>

<template>
  <div class="n-translatable-textarea" :class="wrapperClass" :style="wrapperStyle">
    <n-translatable-toolbar
      v-if="showTabs"
      v-model="activeTab"
      :tab-items="tabItems"
      :show-translate="showTranslate"
      :fill-empty-disabled="fillEmptyDisabled"
      :replace-all-disabled="replaceAllDisabled"
      :translating="translating"
      @fill-empty="fillEmpty"
      @replace-all="replaceAll"
    />
    <v-textarea
      :model-value="draft[activeTab]"
      v-bind="fieldAttrs"
      :required="fieldRequired"
      :rules="fieldRules"
      :error-messages="translateError || undefined"
      @update:model-value="setActiveValue"
    >
      <template v-for="(_, name) in $slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}" />
      </template>
    </v-textarea>
  </div>
</template>
