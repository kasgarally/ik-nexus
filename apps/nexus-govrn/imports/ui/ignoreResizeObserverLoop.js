/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Ignore Chrome ResizeObserver loop errors so the Rspack overlay does not cover the page
 *
 * Chrome reports "ResizeObserver loop completed with undelivered notifications"
 * as a window error when Vuetify tables/selects measure during a layout swap
 * (auth → web + /lists-test). It is not an application failure. Capture-phase
 * stop keeps the bundler overlay from treating it as a fatal runtime error.
 */
function isResizeObserverLoopError(message) {
  return typeof message === 'string' && /ResizeObserver loop/i.test(message)
}

function resizeObserverMessage(event) {
  return event?.message || event?.error?.message || ''
}

window.addEventListener(
  'error',
  (event) => {
    const message = resizeObserverMessage(event)
    if (!isResizeObserverLoopError(message)) {
      return
    }

    event.stopImmediatePropagation()
    event.preventDefault()
  },
  true,
)
