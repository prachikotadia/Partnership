import { createRoot } from "react-dom/client";
import { MobileApp } from "./components/MobileApp.tsx";
import "./index.css";

// Service worker registration removed to fix MIME type error

createRoot(document.getElementById("root")!).render(<MobileApp />);
