/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Vitest config for packages/* (verbose + HTML report)
 */
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    include: ['packages/*/tests/**/*.test.js'],
    reporters: [
      'default',
      'verbose',
      ['html', { outputFile: 'reports/vitest/index.html' }],
    ],
    setupFiles: ['vitest.setup.js'],
  },
})
