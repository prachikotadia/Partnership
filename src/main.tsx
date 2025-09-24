import { createRoot } from "react-dom/client";
import SimpleApp from "./SimpleApp.tsx";
import "./index.css";
import { handleServiceWorkerErrors } from "./utils/serviceWorker";

// Handle service worker errors gracefully
handleServiceWorkerErrors();

// Global error handler for service worker issues
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('chrome-extension')) {
    console.log('Ignoring chrome-extension error:', event.message);
    event.preventDefault();
    return false;
  }
});

// Completely bypass all complex components and use simple app
createRoot(document.getElementById("root")!).render(<SimpleApp />);
