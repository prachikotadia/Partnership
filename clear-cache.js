// Force clear browser cache
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
}

// Clear localStorage
localStorage.clear();

// Clear sessionStorage  
sessionStorage.clear();

console.log('Cache cleared! Please refresh the page.');
