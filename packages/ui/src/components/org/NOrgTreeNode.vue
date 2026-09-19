<!--
Author: Karmil Asgarally - INTELLEKTRA © 2026
One org node row plus nested children
-->
<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Org } from '@nexus/org'
import NRemoveIcon from '../dialogs/NRemoveIcon.vue'

defineOptions({ name: 'NOrgTreeNode' })

const props = defineProps({
  node: { type: Object, required: true },
  depth: { type: Number, default: 0 },
  disabled: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
})

const emit = defineEmits(['add-child', 'edit', 'remove'])
const { t, locale } = useI18n()

const label = computed(() => Org.title(props.node, locale.value) || props.node.type)
const inset = computed(() => `${16 + props.depth * 24}px`)
const busy = computed(() => props.disabled || props.saving)
</script>

<template>
  <v-list-item :style="{ paddingInlineStart: inset }">
    <v-list-item-title>{{ label }}</v-list-item-title>
    <v-list-item-subtitle class="d-flex align-center ga-2 mt-1">
      <v-chip size="x-small" variant="tonal">{{ node.type }}</v-chip>
      <v-chip v-if="node.active === false" size="x-small" color="warning">
        {{ t('org.inactive') }}
      </v-chip>
    </v-list-item-subtitle>
    <template #append>
      <v-btn
        icon="mdi-plus"
        variant="text"
        :aria-label="t('org.addChild')"
        :disabled="busy"
        @click="emit('add-child', node)"
      />
      <v-btn
        icon="mdi-pencil"
        variant="text"
        :aria-label="t('org.edit')"
        :disabled="busy"
        @click="emit('edit', node)"
      />
      <n-remove-icon
        :title="t('org.removeTitle')"
        :text="t('org.removeConfirm', { title: label })"
        :disabled="busy"
        :aria-label="t('org.removeTitle')"
        @confirm="emit('remove', node)"
      />
    </template>
  </v-list-item>
  <n-org-tree-node
    v-for="child in node.children"
    :key="child._id"
    :node="child"
    :depth="depth + 1"
    :disabled="disabled"
    :saving="saving"
    @add-child="emit('add-child', $event)"
    @edit="emit('edit', $event)"
    @remove="emit('remove', $event)"
  />
</template>
