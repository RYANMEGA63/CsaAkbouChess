import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteConfigProvider } from "@/lib/SiteConfigContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useEffect } from "react";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Tournaments from "./pages/Tournaments.tsx";
import Achievements from "./pages/Achievements.tsx";
import Contact from "./pages/Contact.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";

// ── Route secrète admin ─────────────────────────────────────────
const ADMIN_ROUTE = "/gestion-csa-2025"

// ── Tracker de visites localStorage ─────────────────────────────
// Enregistre chaque changement de page (hors admin) dans localStorage
const ADMIN_PATHS = [ADMIN_ROUTE]

function PageTracker() {
  const location = useLocation()

  useEffect(() => {
    // Scroll to top à chaque changement de page
    window.scrollTo({ top: 0, behavior: 'instant' })

    // Ne pas tracker les pages admin
    if (ADMIN_PATHS.some(p => location.pathname.startsWith(p))) return

    try {
      interface VisitEntry { ts: number; path: string; country: string; uid: string }
      const visits: VisitEntry[] = JSON.parse(localStorage.getItem('site_visits') || '[]')
      let uid = localStorage.getItem('visitor_uid')
      if (!uid) { uid = crypto.randomUUID(); localStorage.setItem('visitor_uid', uid) }

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
      const lang = navigator.language || ''
      const country =
        tz.includes('Africa/Algiers') || tz.includes('Africa/Tunis') ? '🇩🇿 Algérie' :
        tz.includes('Europe/Paris') || tz.includes('Europe/Brussels') ? '🇫🇷 France' :
        tz.includes('Europe/London') ? '🇬🇧 Royaume-Uni' :
        tz.includes('Europe/') ? '🌍 Europe' :
        lang.startsWith('ar') ? '🌍 Monde arabe' :
        lang.startsWith('fr') ? '🌍 Francophonie' : '🌐 Autre'

      visits.push({ ts: Date.now(), path: location.pathname, country, uid })
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
      localStorage.setItem('site_visits', JSON.stringify(visits.filter(v => v.ts > cutoff)))
    } catch {}
  }, [location.pathname])

  return null
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SiteConfigProvider>
        <Toaster />
        <Sonner />
        <Analytics />
        <SpeedInsights />
        <BrowserRouter>
          <PageTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/tournois" element={<Tournaments />} />
            <Route path="/realisations" element={<Achievements />} />
            <Route path="/contact" element={<Contact />} />
            <Route path={ADMIN_ROUTE} element={<Admin />} />
            <Route path="/admin" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SiteConfigProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
