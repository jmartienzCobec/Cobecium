import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProcurementGrid } from "@/components/ProcurementGrid";
import { SystemPromptsGrid } from "@/components/SystemPromptsGrid";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { Style1Page } from "@/pages/Style1Page";
import { Style5Page } from "@/pages/Style5Page";
import { Style10Page } from "@/pages/Style10Page";
import { Style6Page } from "@/pages/Style6Page";
import { Style7Page } from "@/pages/Style7Page";
import { Style8Page } from "@/pages/Style8Page";
import { Style9Page } from "@/pages/Style9Page";
import { StylePath10Page } from "@/pages/StylePath10Page";

function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<ProcurementGrid />} />
          <Route path="/system-prompts" element={<SystemPromptsGrid />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/1" element={<Style1Page />} />
          <Route path="/2" element={<Style10Page />} />
          <Route path="/3" element={<Style5Page />} />
          <Route path="/6" element={<Style6Page />} />
          <Route path="/7" element={<Style7Page />} />
          <Route path="/8" element={<Style8Page />} />
          <Route path="/9" element={<Style9Page />} />
          <Route path="/10" element={<StylePath10Page />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
