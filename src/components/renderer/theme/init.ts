import { initializeThemes } from "./themes";

// Initialize theme system on module import
// This will start preloading critical themes in the background
let initialized = false;

export function initThemeSystem() {
  if (initialized) {
    return;
  }

  // Start preloading critical themes
  initializeThemes();

  initialized = true;

  // In development, log initialization
  if (process.env.NODE_ENV === 'development') {
    console.debug('Theme system initialized');
  }
}

// Auto-initialize in browser environments
if (typeof window !== 'undefined') {
  // Initialize after a short delay to not block initial render
  const initTimeout = setTimeout(() => {
    initThemeSystem();
  }, 100);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearTimeout(initTimeout);
  });
}

// Export for manual initialization in non-browser environments or testing
export { initThemeSystem as default };