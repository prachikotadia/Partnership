import { createRoot } from "react-dom/client";
import { MobileApp } from "./components/MobileApp.tsx";
import "./index.css";

// Register service worker for PWA and push notifications
// Temporarily disabled to troubleshoot network issues
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
*/

createRoot(document.getElementById("root")!).render(<MobileApp />);
