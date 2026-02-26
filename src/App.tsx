import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProcurementGrid } from "@/components/ProcurementGrid";
import { Style1Page } from "@/pages/Style1Page";
import { Style5Page } from "@/pages/Style5Page";
import { Style10Page } from "@/pages/Style10Page";

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<ProcurementGrid />} />
          <Route path="/1" element={<Style1Page />} />
          <Route path="/2" element={<Style10Page />} />
          <Route path="/3" element={<Style5Page />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
