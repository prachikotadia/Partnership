import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MinimalApp } from "@/components/MinimalApp";
import { DemoDashboard } from "@/components/DemoDashboard";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MinimalApp />} />
        <Route path="/demo-dashboard" element={<DemoDashboard />} />
        <Route path="*" element={<MinimalApp />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
