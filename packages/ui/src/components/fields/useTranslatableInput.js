/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Shared state for translatable text field and textarea
 */
import { computed, inject, reactive, ref, useAttrs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  coerceLocalized,
  defaultLocales,
  emptyLocalizedMap,
  localeDisplayName,
  NEXUS_LOCALES_KEY,
  NEXUS_TRANSLATE_KEY,
} from '../../i18n/locales.js'

export function useTranslatableInput(props, emit) {
  const locales = inject(NEXUS_LOCALES_KEY, defaultLocales())
  const translateFn = inject(NEXUS_TRANSLATE_KEY, null)
  const attrs = useAttrs()
  const { t, te } = useI18n()

  const draft = reactive(emptyLocalizedMap(locales.data))
  const activeTab = ref(locales.defaultData)
  const translating = ref(false)
  const translateError = ref('')

  watch(
    () => props.modelValue,
    (value) => {
      Object.assign(draft, coerceLocalized(value, locales))
    },
    { immediate: true, deep: true },
  )

  const sourceText = computed(() => String(draft[activeTab.value] || '').trim())
  const otherCodes = computed(() => locales.data.filter((code) => code !== activeTab.value))
  const emptyCodes = computed(() =>
    otherCodes.value.filter((code) => !String(draft[code] || '').trim()),
  )

  const showTabs = computed(() => locales.data.length > 1)
  const showTranslate = computed(() => typeof translateFn === 'function' && showTabs.value)
  const sourceEmpty = computed(() => !sourceText.value)
  const fillEmptyDisabled = computed(
    () => sourceEmpty.value || translating.value || emptyCodes.value.length === 0,
  )
  const replaceAllDisabled = computed(() => sourceEmpty.value || translating.value)

  const tabItems = computed(() =>
    locales.data.map((code) => ({
      code,
      label: tabLabel(code),
    })),
  )

  const fieldRules = computed(() => {
    const fromAttrs = Array.isArray(attrs.rules) ? attrs.rules : []
    if (!props.required) {
      return fromAttrs
    }
    return [
      ...fromAttrs,
      () => {
        const value = String(draft[locales.defaultData] || '').trim()
        if (value) {
          return true
        }
        return t('locale.valueRequired', {
          locale: localeDisplayName(locales.defaultData, t, te),
        })
      },
    ]
  })

  const fieldRequired = computed(
    () => props.required && activeTab.value === locales.defaultData,
  )

  const fieldAttrs = computed(() => {
    const next = { ...attrs }
    delete next.class
    delete next.style
    delete next.rules
    delete next.required
    return next
  })

  function emitMap() {
    emit('update:modelValue', { ...draft })
  }

  function setActiveValue(value) {
    draft[activeTab.value] = value == null ? '' : String(value)
    emitMap()
  }

  async function fillEmpty() {
    return runTranslate(emptyCodes.value)
  }

  async function replaceAll() {
    return runTranslate(otherCodes.value)
  }

  async function runTranslate(to) {
    if (locales.data.length < 2) {
      return
    }
    if (!to.length || sourceEmpty.value || typeof translateFn !== 'function') {
      return
    }

    translating.value = true
    translateError.value = ''
    try {
      const result = await translateFn({
        text: sourceText.value,
        from: activeTab.value,
        to,
      })
      if (!result || typeof result !== 'object') {
        return
      }
      for (const code of to) {
        if (typeof result[code] === 'string') {
          draft[code] = result[code]
        }
      }
      emitMap()
    } catch (error) {
      translateError.value = error.reason || error.message || t('locale.translateFailed')
    } finally {
      translating.value = false
    }
  }

  return {
    activeTab,
    draft,
    emptyCodes,
    fieldAttrs,
    fieldRequired,
    fieldRules,
    fillEmpty,
    fillEmptyDisabled,
    locales,
    replaceAll,
    replaceAllDisabled,
    setActiveValue,
    showTabs,
    showTranslate,
    sourceEmpty,
    tabItems,
    translateError,
    translating,
    wrapperClass: computed(() => attrs.class),
    wrapperStyle: computed(() => attrs.style),
  }
}

function tabLabel(code) {
  if (typeof code !== 'string' || !code) {
    return ''
  }
  return code.slice(0, 1).toUpperCase() + code.slice(1).toLowerCase()
}
