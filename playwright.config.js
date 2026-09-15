/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Playwright config for GovRN user-visible flows
 */
import { defineConfig } from '@playwright/test'

const baseURL = 'http://127.0.0.1:3000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  timeout: 120_000,
  expect: {
    timeout: 30_000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright', open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'meteor run',
    cwd: 'apps/nexus-govrn',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 10 * 60 * 1000,
  },
})
