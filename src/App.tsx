import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { ProcurementGrid } from "@/components/ProcurementGrid";
import { SystemPromptsGrid } from "@/components/SystemPromptsGrid";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { AdminPage } from "@/pages/AdminPage";
import { LandingPage } from "@/pages/LandingPage";
import { AdminOnlyRoute } from "@/components/AdminOnlyRoute";
import { AppFooter } from "@/components/AppFooter";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { Style1Page } from "@/pages/Style1Page";
import { Style5Page } from "@/pages/Style5Page";
import { Style10Page } from "@/pages/Style10Page";
import { Style6Page } from "@/pages/Style6Page";
import { Style7Page } from "@/pages/Style7Page";
import { Style8Page } from "@/pages/Style8Page";
import { Style9Page } from "@/pages/Style9Page";
import { StylePath10Page } from "@/pages/StylePath10Page";

function HomeOrRedirect() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return <Navigate to="/app" replace />;
  return <LandingPage />;
}

function App() {
  useStoreUserEffect();

  return (
    <BrowserRouter>
      <main className="min-h-screen flex flex-col bg-background text-foreground">
        <div className="flex-1 flex flex-col">
          <Routes>
          <Route path="/" element={<HomeOrRedirect />} />
          <Route path="/welcome" element={<LandingPage />} />
          <Route path="/app" element={<ProcurementGrid />} />
          <Route
            path="/system-prompts"
            element={
              <AdminOnlyRoute>
                <SystemPromptsGrid />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <AdminOnlyRoute>
                <AnalyticsPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminOnlyRoute>
                <AdminPage />
              </AdminOnlyRoute>
            }
          />
          <Route path="/1" element={<Style1Page />} />
          <Route path="/2" element={<Style10Page />} />
          <Route path="/3" element={<Style5Page />} />
          <Route path="/6" element={<Style6Page />} />
          <Route path="/7" element={<Style7Page />} />
          <Route path="/8" element={<Style8Page />} />
          <Route path="/9" element={<Style9Page />} />
          <Route path="/10" element={<StylePath10Page />} />
          </Routes>
        </div>
        <AppFooter />
      </main>
    </BrowserRouter>
  );
}

export default App;
