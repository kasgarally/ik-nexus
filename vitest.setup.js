/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Shared Vitest DOM shims (Vuetify overlay/layout)
 */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserverStub
