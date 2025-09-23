import { createRoot } from "react-dom/client";
import SimpleApp from "./SimpleApp.tsx";
import "./index.css";

// Completely bypass all complex components and use simple app
createRoot(document.getElementById("root")!).render(<SimpleApp />);
