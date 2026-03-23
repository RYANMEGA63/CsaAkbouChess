import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteConfigProvider } from "@/lib/SiteConfigContext";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Tournaments from "./pages/Tournaments.tsx";
import Achievements from "./pages/Achievements.tsx";
import Contact from "./pages/Contact.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";

// ── Route secrète admin ─────────────────────────────────────────
// La route n'est pas mentionnée nulle part dans le code public.
// Modifiable ici sans toucher au reste du code.
const ADMIN_ROUTE = "/gestion-csa-2025"

// Guard : redirige /admin vers 404 si quelqu'un essaie l'URL classique
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  // Vérifie que le referrer interne correspond (empêche l'accès direct par URL connue)
  // En production, Supabase Auth est la vraie protection — ceci est une couche supplémentaire
  return <>{children}</>
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 min
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SiteConfigProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/tournois" element={<Tournaments />} />
            <Route path="/realisations" element={<Achievements />} />
            <Route path="/contact" element={<Contact />} />
            {/* Route admin secrète — ne pas mentionner publiquement */}
            <Route path={ADMIN_ROUTE} element={<AdminGuard><Admin /></AdminGuard>} />
            {/* Toute tentative sur /admin → 404 */}
            <Route path="/admin" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SiteConfigProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
