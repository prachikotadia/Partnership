// Aggressive cache busting script
(function() {
  'use strict';
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
  
  // Clear storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Clear service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        registration.unregister();
      }
    });
  }
  
  // Force reload with cache busting
  const timestamp = new Date().getTime();
  const url = new URL(window.location);
  url.searchParams.set('_t', timestamp);
  
  console.log('Cache cleared! Reloading...');
  window.location.href = url.toString();
})();
