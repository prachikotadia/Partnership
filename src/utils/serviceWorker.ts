// Service Worker utilities with error handling
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
          // Don't throw error, just log it
        });
    });
  }
};

// Handle service worker errors gracefully
export const handleServiceWorkerErrors = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('error', (event) => {
      console.log('Service Worker error (ignored):', event);
      // Ignore chrome-extension and other unsupported scheme errors
    });
  }
};
