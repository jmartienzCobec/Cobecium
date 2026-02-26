import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProcurementGrid } from "@/components/ProcurementGrid";
import { Style1Page } from "@/pages/Style1Page";
import { Style5Page } from "@/pages/Style5Page";

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<ProcurementGrid />} />
          <Route path="/1" element={<Style1Page />} />
          <Route path="/5" element={<Style5Page />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
