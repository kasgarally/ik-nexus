/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Normalized public.locales for this Meteor app.
 *
 * Import the locales helper file (not @nexus/ui) so the server does not load Vue SFCs.
 * defaultData must be en; data must include en (minimum ["en"]).
 */
import { Meteor } from 'meteor/meteor'
import {
  coerceLocalized,
  emptyLocalizedMap,
  normalizeLocales,
  resolveLocalized,
} from '@nexus/ui/src/i18n/locales.js'

export { coerceLocalized, emptyLocalizedMap, resolveLocalized }

export const appLocales = normalizeLocales(Meteor.settings.public?.locales)
