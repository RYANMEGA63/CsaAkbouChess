import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteConfigProvider } from "@/lib/SiteConfigContext";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Tournaments from "./pages/Tournaments.tsx";
import Achievements from "./pages/Achievements.tsx";
import Contact from "./pages/Contact.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";

// ── Route secrete admin ─────────────────────────────────────────────
const ADMIN_ROUTE = "/gestion-csa-2025"
const ADMIN_PATHS = [ADMIN_ROUTE]

// ── Detection pays par timezone/langue ───────────────────────────
function detectCountry(): string {
  const tz   = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  const lang = navigator.language || ''
  if (tz.includes('Africa/Algiers') || tz.includes('Africa/Tunis')) return '🇩🇿 Algérie'
  if (tz.includes('Europe/Paris') || tz.includes('Europe/Brussels'))  return '🇫🇷 France'
  if (tz.includes('Europe/London'))  return '🇬🇧 Royaume-Uni'
  if (tz.includes('Europe/'))        return '🌍 Europe'
  if (lang.startsWith('ar'))         return '🌍 Monde arabe'
  if (lang.startsWith('fr'))         return '🌍 Francophonie'
  return '🌐 Autre'
}

// ── UID visiteur persiste dans localStorage ───────────────────────
function getVisitorUid(): string {
  try {
    let uid = localStorage.getItem('visitor_uid')
    if (!uid) { uid = crypto.randomUUID(); localStorage.setItem('visitor_uid', uid) }
    return uid
  } catch { return crypto.randomUUID() }
}

// ── Tracker de visites → Supabase ──────────────────────────────────
function PageTracker() {
  const location = useLocation()

  useEffect(() => {
    // Scroll to top a chaque changement de page
    window.scrollTo({ top: 0, behavior: 'instant' })

    // Ne pas tracker les pages admin
    if (ADMIN_PATHS.some(p => location.pathname.startsWith(p))) return

    // Insertion en base — fire & forget, sans bloquer le rendu
    supabase.from('page_views').insert({
      path:    location.pathname,
      country: detectCountry(),
      uid:     getVisitorUid(),
    }).then(() => {})
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
