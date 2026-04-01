import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Plus, Pencil, Trash2, X, Save, ImagePlus, Eye,
  Trophy, LogOut, ChevronDown, ChevronUp, FileImage,
  Settings, Image, Megaphone, Loader2,
  LayoutDashboard, ClipboardList, UserCheck, Building2, Calendar, Search, Phone,
  BarChart2, Globe, TrendingUp, Lock, Unlock
} from "lucide-react"
import { useAuth, useTournaments, usePosts, useGallery, useRegistrations, usePlayers, Registration } from "@/hooks/useSupabase"
import { useSiteConfig } from "@/lib/SiteConfigContext"
import { supabase, uploadFile, uploadMultiple, Tournament, Post, Player } from "@/lib/supabase"
import { toast } from "sonner"
import logoClub from "@/assets/logo-club.jpg"

// ── Helpers ───────────────────────────────────────────────────────
const readAsDataURL = (file: File): Promise<string> =>
  new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(file) })

const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
const labelCls = "text-xs font-semibold mb-1 block text-muted-foreground uppercase tracking-wide"

// ── LOGIN ─────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin, clubName, isLockedOut, lockoutMinutes }: {
  onLogin: (email: string, password: string) => Promise<void>
  clubName: string
  isLockedOut: boolean
  lockoutMinutes: number
}) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(lockoutMinutes)

  // Compte à rebours pour le déverrouillage
  useEffect(() => {
    if (!isLockedOut) return
    setCountdown(lockoutMinutes)
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); window.location.reload(); return 0 }
        return c - 1
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [isLockedOut, lockoutMinutes])

  const submit = async () => {
    if (isLockedOut) return
    setError(""); setLoading(true)
    try { await onLogin(email, password) }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Erreur de connexion") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
      <div className="bg-card rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg border-2 border-white/20">
            <img src={logoClub} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-xl font-bold">Administration</h1>
          <p className="text-sm text-muted-foreground mt-1">{clubName}</p>
        </div>

        {isLockedOut ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center space-y-2">
            <p className="text-sm font-semibold text-red-700">🔒 Accès temporairement bloqué</p>
            <p className="text-xs text-red-600">Trop de tentatives échouées.</p>
            <p className="text-xs text-red-600">Réessayez dans <span className="font-bold">{countdown}</span> minute{countdown > 1 ? 's' : ''}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="admin@club.fr" autoComplete="email"
                className={`${inputCls} ${error ? "border-red-400" : ""}`} />
            </div>
            <div>
              <label className={labelCls}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="••••••••" autoComplete="current-password"
                className={`${inputCls} ${error ? "border-red-400" : ""}`} />
              {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
            </div>
            <button onClick={submit} disabled={loading}
              className="w-full rounded-xl py-3 font-semibold text-sm text-white disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, hsl(var(--chess-gold-dark)), hsl(var(--chess-gold)))" }}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              Se connecter
            </button>
            <p className="text-xs text-muted-foreground text-center">Authentification sécurisée via Supabase</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── BANNIERE CONNEXION ────────────────────────────────────────────
const ConnectionBanner = ({ status, onRetry }: { status: string; onRetry: () => void }) => {
  if (status === 'connected') return null
  return (
    <div className={`px-4 py-2 text-xs font-medium flex items-center justify-between gap-3 ${
      status === 'offline' ? 'bg-amber-50 text-amber-800 border-b border-amber-200' :
      status === 'error'   ? 'bg-red-50 text-red-700 border-b border-red-200' :
      'bg-blue-50 text-blue-700 border-b border-blue-200'
    }`}>
      <span className="flex items-center gap-2">
        {status === 'loading' && <Loader2 size={12} className="animate-spin" />}
        {status === 'offline' && '⚠️ Mode hors-ligne — données depuis le cache. Les modifications seront synchronisées à la reconnexion.'}
        {status === 'error'   && '❌ Impossible de joindre Supabase. Vérifiez votre connexion.'}
        {status === 'loading' && 'Connexion à Supabase…'}
      </span>
      {(status === 'offline' || status === 'error') && (
        <button onClick={onRetry} className="underline shrink-0 hover:no-underline">Réessayer</button>
      )}
    </div>
  )
}

// ── Analytics (tracking via Supabase — table page_views) ─────────────
function useAnalytics() {
  const [stats, setStats] = useState<{
    total: number; unique: number; today: number; todayUnique: number
    byCountry: { name: string; count: number }[]
    byDay: { date: string; visits: number }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        const { data, error } = await supabase
          .from('page_views')
          .select('created_at, path, country, uid')
          .gte('created_at', since30)
          .order('created_at', { ascending: true })

        if (error) throw error
        const rows = data || []

        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
        const todayRows = rows.filter(r => new Date(r.created_at) >= todayStart)

        const cMap: Record<string, number> = {}
        rows.forEach(r => { if (r.country) cMap[r.country] = (cMap[r.country] || 0) + 1 })
        const byCountry = Object.entries(cMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count).slice(0, 6)

        const days7: Record<string, number> = {}
        for (let i = 6; i >= 0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
          days7[d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })] = 0
        }
        const since7 = Date.now() - 7 * 24 * 60 * 60 * 1000
        rows.filter(r => new Date(r.created_at).getTime() >= since7).forEach(r => {
          const key = new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
          if (key in days7) days7[key]++
        })

        setStats({
          total: rows.length,
          unique: new Set(rows.map(r => r.uid)).size,
          today: todayRows.length,
          todayUnique: new Set(todayRows.map(r => r.uid)).size,
          byCountry,
          byDay: Object.entries(days7).map(([date, visits]) => ({ date, visits })),
        })
      } catch {
        setStats({ total: 0, unique: 0, today: 0, todayUnique: 0, byCountry: [], byDay: [] })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { stats, loading }
}

// ── DASHBOARD ANALYTICS WIDGET ───────────────────────────────────────────────
const AnalyticsWidget = () => {
  const { stats, loading } = useAnalytics()

  if (loading || !stats) return (
    <div className="bg-card border rounded-2xl p-5 shadow-sm flex items-center justify-center h-32">
      <Loader2 size={22} className="animate-spin text-muted-foreground" />
    </div>
  )

  const maxDay = Math.max(...stats.byDay.map(d => d.visits), 1)

  return (
    <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <BarChart2 size={16} style={{ color: "hsl(var(--chess-blue))" }} />
        <h3 className="font-semibold text-sm">Audience du site</h3>
        <span className="text-xs text-muted-foreground font-normal">— 30 derniers jours</span>
      </div>

      {/* Métriques */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Visites totales",    value: stats.total,            sub: `+${stats.today} aujourd'hui`,                      color: "hsl(var(--chess-blue))" },
          { label: "Visiteurs uniques",  value: stats.unique,           sub: `+${stats.todayUnique} aujourd'hui`,                color: "hsl(var(--chess-gold-dark))" },
          { label: "Aujourd'hui",        value: stats.today,            sub: `${stats.todayUnique} unique${stats.todayUnique > 1 ? 's' : ''}`, color: "hsl(var(--chess-blue))" },
          { label: "Pays détectés",      value: stats.byCountry.length, sub: stats.byCountry[0]?.name || '—',                     color: "#10b981" },
        ].map(s => (
          <div key={s.label} className="bg-muted/30 rounded-xl p-3 space-y-1">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-medium">{s.label}</p>
            <p className="text-[10px] text-muted-foreground truncate">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Graphique 7 jours */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <TrendingUp size={11} /> Visites — 7 derniers jours
        </p>
        <div className="flex items-end gap-1.5 h-24">
          {stats.byDay.map(d => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] font-semibold text-muted-foreground">{d.visits > 0 ? d.visits : ''}</span>
              <div className="w-full rounded-t-md transition-all" style={{
                height: `${Math.max((d.visits / maxDay) * 56, d.visits > 0 ? 4 : 2)}px`,
                background: d.visits > 0 ? "hsl(var(--chess-blue)/0.75)" : "hsl(var(--muted))"
              }} />
              <span className="text-[9px] text-muted-foreground text-center leading-tight">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Provenance */}
      {stats.byCountry.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Globe size={11} /> Provenance
          </p>
          <div className="space-y-2">
            {stats.byCountry.map(c => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="text-xs w-36 truncate font-medium">{c.name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.round((c.count / stats.total) * 100)}%`,
                    background: "linear-gradient(90deg, hsl(var(--chess-blue)), hsl(var(--chess-gold)))"
                  }} />
                </div>
                <span className="text-xs text-muted-foreground w-6 text-right font-medium">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Aucune visite enregistrée pour les 30 derniers jours.
        </p>
      )}

      <p className="text-[10px] text-muted-foreground border-t pt-2">
        ⓘ Données en temps réel depuis Supabase — toutes les visites, tous les navigateurs.
      </p>
    </div>
  )
}

// ── Calcul automatique du statut selon la date ───────────────────
function getTournamentStatus(t: Tournament): 'bientot' | 'en_cours' | 'finis' {
  if (t.is_past) return 'finis'
  if (!t.date_iso) return 'bientot'
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(t.date_iso); d.setHours(0, 0, 0, 0)
  const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'finis'
  if (diff === 0) return 'en_cours'
  return 'bientot'
}

const STATUS_LABELS = {
  bientot:  { label: 'Bientôt',      cls: 'bg-blue-100 text-blue-700' },
  en_cours: { label: "Aujourd'hui",  cls: 'bg-green-100 text-green-700' },
  finis:    { label: 'Finis',        cls: 'bg-gray-100 text-gray-500' },
}

// ── TOURNAMENT FORM ───────────────────────────────────────────────
const emptyT = (): Omit<Tournament, 'id' | 'created_at' | 'updated_at'> => ({
  title: "", date: "", date_iso: "", cadence: "", type: "Blitz", rounds: 7,
  location: "", description: "",
  fiches_techniques_urls: [],
  is_past: false, display_order: 0,
  registrations_closed: false,
  homologue: false,
  niveaux: "",
})

const TournamentForm = ({ initial, onSave, onClose }: {
  initial: Tournament | null
  onSave: (data: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onClose: () => void
}) => {
  const [form, setForm] = useState(initial ? {
    title: initial.title, date: initial.date, date_iso: initial.date_iso || "",
    cadence: initial.cadence, type: initial.type,
    rounds: initial.rounds, location: initial.location,
    description: initial.description,
    homologue: initial.homologue, niveaux: initial.niveaux,
    fiches_techniques_urls: initial.fiches_techniques_urls || [],
    is_past: initial.is_past, display_order: initial.display_order || 0,
    registrations_closed: initial.registrations_closed || false,
  } : { ...emptyT() })

  // Places supplémentaires (4e, 5e, …) stockées comme tableau [{rank, name}]
  const parseExtraPlaces = (t: Tournament | null): { rank: number; name: string; category: string }[] => {
    try {
      const raw = (t as unknown as Record<string, unknown>)?.['extra_places']
      if (Array.isArray(raw)) return raw as { rank: number; name: string; category: string }[]
    } catch {}
    return []
  }
  const [extraPlaces, setExtraPlaces] = useState<{ rank: number; name: string; category: string }[]>(parseExtraPlaces(initial))

  const [saving, setSaving] = useState(false)
  const fichesRef = useRef<HTMLInputElement>(null)
  const [fichePreviews, setFichePreviews] = useState<string[]>(form.fiches_techniques_urls)
  const [ficheFiles, setFicheFiles] = useState<File[]>([])

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  // Quand on change la date ISO, auto-générer le label lisible en français
  const handleDateISO = (iso: string) => {
    set('date_iso', iso)
    if (!iso) { set('date', ''); return }
    const d = new Date(iso + 'T12:00:00')
    const label = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    set('date', label)
  }

  const handleFiches = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const previews = await Promise.all(files.map(readAsDataURL))
    setFicheFiles(prev => [...prev, ...files])
    setFichePreviews(prev => [...prev, ...previews])
  }

  const removeFiche = (i: number) => {
    setFichePreviews(prev => prev.filter((_, idx) => idx !== i))
    const existingCount = form.fiches_techniques_urls.length
    if (i >= existingCount) setFicheFiles(prev => prev.filter((_, idx) => idx !== i - existingCount))
    else set('fiches_techniques_urls', form.fiches_techniques_urls.filter((_, idx) => idx !== i))
  }

  const handleSave = async () => {
    if (!form.title || !form.date) { toast.error("Titre et date requis"); return }
    setSaving(true)
    try {
      const newFicheUrls = ficheFiles.length ? await uploadMultiple('tournament-fiches', ficheFiles) : []
      const finalFiches = [...form.fiches_techniques_urls, ...newFicheUrls]
      await onSave({ ...form, fiches_techniques_urls: finalFiches, extra_places: extraPlaces } as never)
      toast.success(initial ? "Tournoi mis à jour !" : "Tournoi créé !")
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur lors de l'enregistrement"
      toast.error(msg)
    }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full sm:max-w-2xl max-h-[96vh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
          <div>
            <h2 className="font-bold text-base text-white">{initial ? `Modifier — ${initial.title}` : "Nouveau tournoi"}</h2>
            <p className="text-white/50 text-xs mt-0.5">Renseignez les champs et enregistrez</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white p-1"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 sm:col-span-2"><label className={labelCls}>Titre *</label><input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} /></div>

            {/* Date avec date picker + label auto */}
            <div className="col-span-1 sm:col-span-2">
              <label className={labelCls}>Date *</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className={`${inputCls} flex-1`}
                  value={form.date_iso || ''}
                  onChange={e => handleDateISO(e.target.value)}
                />
                <div className="flex items-center px-3 py-2 bg-muted rounded-lg text-sm text-muted-foreground min-w-0 flex-1 truncate">
                  {form.date || <span className="italic opacity-50">Label auto-généré</span>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sélectionnez la date — le label en français est généré automatiquement</p>
            </div>

            <div><label className={labelCls}>Type</label>
              <select className={inputCls} value={form.type} onChange={e => set('type', e.target.value)}>
                {["Blitz", "Rapide", "Classique", "Exhibition"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Cadence</label><input className={inputCls} value={form.cadence} onChange={e => set('cadence', e.target.value)} placeholder="3+2" /></div>
            <div><label className={labelCls}>Rondes</label><input type="number" className={inputCls} value={form.rounds} onChange={e => set('rounds', +e.target.value)} /></div>
            <div><label className={labelCls}>Niveaux</label><input className={inputCls} value={form.niveaux} onChange={e => set('niveaux', e.target.value)} placeholder="Tous niveaux" /></div>
            <div className="col-span-1 sm:col-span-2"><label className={labelCls}>Lieu</label><input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} /></div>
            <div><label className={labelCls}>Ordre d'affichage</label><input type="number" className={inputCls} value={form.display_order} onChange={e => set('display_order', +e.target.value)} /></div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id="hom" checked={form.homologue} onChange={e => set('homologue', e.target.checked)} className="w-4 h-4 accent-primary" />
              <label htmlFor="hom" className="text-sm font-medium cursor-pointer">Homologué FFE</label>
            </div>
          </div>

<div><label className={labelCls}>Description</label><textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.description} onChange={e => set('description', e.target.value)} /></div>

          {/* Clôture des inscriptions */}
          <div className={`rounded-xl border-2 p-4 transition-all ${form.registrations_closed ? 'border-red-300 bg-red-50/50' : 'border-border'}`}>
            <div className="flex items-center gap-3 mb-1">
              <input type="checkbox" id="regClosed" checked={form.registrations_closed} onChange={e => set('registrations_closed', e.target.checked)} className="w-4 h-4 accent-red-500" />
              <label htmlFor="regClosed" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                🔒 Clôturer les inscriptions
              </label>
            </div>
            <p className="text-xs text-muted-foreground ml-7">
              Le bouton d'inscription sera remplacé par un message "Inscriptions clôturées" sur le site.
            </p>
          </div>

          {/* Marquer comme finis */}
          <div className="rounded-xl border-2 p-4 transition-all" style={{
            borderColor: form.is_past ? "hsl(var(--chess-gold))" : "hsl(var(--border))",
            background: form.is_past ? "hsl(var(--chess-gold)/0.05)" : "transparent"
          }}>
            <div className="flex items-center gap-3 mb-1">
              <input type="checkbox" id="past" checked={form.is_past} onChange={e => set('is_past', e.target.checked)} className="w-4 h-4 accent-primary" />
              <label htmlFor="past" className="text-sm font-semibold cursor-pointer">Marquer comme tournoi finis</label>
            </div>
            <p className="text-xs text-muted-foreground ml-7">Le tournoi passera dans la section "Derniers résultats"</p>

            {form.is_past && (() => {
              const CATEGORIES = [
                { id: '1er',      label: '1ère place',   icon: '🥇' },
                { id: '2eme',     label: '2ème place',   icon: '🥈' },
                { id: '3eme',     label: '3ème place',   icon: '🥉' },
                { id: '4eme',     label: '4ème place',   icon: '4️⃣' },
                { id: '5eme',     label: '5ème place',   icon: '5️⃣' },
                { id: 'feminin',  label: 'Féminin',      icon: '♀️' },
                { id: 'u8',       label: 'U8',           icon: 'U8' },
                { id: 'u10',      label: 'U10',          icon: 'U10' },
                { id: 'u12',      label: 'U12',          icon: 'U12' },
                { id: 'u14',      label: 'U14',          icon: 'U14' },
                { id: 'u16',      label: 'U16',          icon: 'U16' },
                { id: 'u18',      label: 'U18',          icon: 'U18' },
                { id: 'u20',      label: 'U20',          icon: 'U20' },
                { id: 'veterans', label: 'Vétérans',     icon: '🏛️' },
              ]
              return (
                <div className="space-y-4 mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Classement & palmarès</p>
                    <span className="text-[10px] text-muted-foreground">{extraPlaces.length} entrée{extraPlaces.length > 1 ? 's' : ''}</span>
                  </div>

                  {/* Entrées existantes */}
                  {extraPlaces.length > 0 && (
                    <div className="space-y-2">
                      {extraPlaces.map((p, i) => {
                        const cat = CATEGORIES.find(c => c.id === p.category) || CATEGORIES[0]
                        return (
                          <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-xl px-3 py-2">
                            <span className="text-lg w-7 text-center shrink-0">{cat.icon}</span>
                            <select
                              className="text-xs border rounded-lg px-2 py-1.5 bg-background shrink-0 font-medium"
                              value={p.category || '1er'}
                              onChange={e => setExtraPlaces(prev => prev.map((x, j) => j === i ? { ...x, category: e.target.value } : x))}>
                              {CATEGORIES.map(c => (
                                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                              ))}
                            </select>
                            <input
                              className={`${inputCls} flex-1`}
                              placeholder="Nom du joueur / équipe"
                              value={p.name}
                              onChange={e => setExtraPlaces(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                            />
                            <button
                              onClick={() => setExtraPlaces(prev => prev.filter((_, j) => j !== i))}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                              <X size={13} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {extraPlaces.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-xl">
                      Aucune entrée — cliquez sur une catégorie pour ajouter
                    </p>
                  )}

                  {/* Grille de catégories cliquables */}
                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ajouter une entrée</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setExtraPlaces(prev => [...prev, { rank: prev.length + 1, name: '', category: c.id }])}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all bg-card">
                          <span>{c.icon}</span>
                          <span>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>


                </div>
              )
            })()}
          </div>

          {/* Fiches techniques */}
          <div>
            <label className={labelCls}><span className="flex items-center gap-1.5"><FileImage size={12} />Fiches techniques (côte à côte)</span></label>
            <input ref={fichesRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiches} />
            <div className="flex flex-wrap gap-3 mb-2">
              {fichePreviews.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="h-32 w-auto object-cover rounded-lg border shadow-sm" style={{ maxWidth: 200 }} />
                  <button onClick={() => removeFiche(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full items-center justify-center shadow hidden group-hover:flex">
                    <X size={12} />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">Fiche {i + 1}</span>
                </div>
              ))}
              <button onClick={() => fichesRef.current?.click()}
                className="h-32 w-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                <ImagePlus size={20} /><span className="text-xs mt-1.5 text-center">Ajouter</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-4 sm:px-6 py-4 border-t bg-muted/10 shrink-0">
          <button onClick={onClose} className="flex-1 border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={15} />}
            {initial ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Palette couleurs pour les types (CSS inline — pas de Tailwind dynamique) ──
const TYPE_COLOR_PALETTE: { label: string; bg: string; text: string }[] = [
  { label: 'Bleu',   bg: '#dbeafe', text: '#1d4ed8' },
  { label: 'Vert',   bg: '#dcfce7', text: '#15803d' },
  { label: 'Or',     bg: '#fef9c3', text: '#a16207' },
  { label: 'Violet', bg: '#f3e8ff', text: '#7e22ce' },
  { label: 'Rose',   bg: '#fce7f3', text: '#be185d' },
  { label: 'Orange', bg: '#ffedd5', text: '#c2410c' },
  { label: 'Teal',   bg: '#ccfbf1', text: '#0f766e' },
  { label: 'Rouge',  bg: '#fee2e2', text: '#b91c1c' },
  { label: 'Indigo', bg: '#e0e7ff', text: '#4338ca' },
  { label: 'Gris',   bg: '#f3f4f6', text: '#374151' },
]

// badge avec couleur inline
const TagBadgeInline = ({ tag, tagColor }: { tag: string; tagColor: string }) => {
  // tagColor est maintenant stocké comme "bg:#hex;text:#hex"
  const parsed = parseTagColor(tagColor)
  return (
    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
      style={{ background: parsed.bg, color: parsed.text }}>
      {tag}
    </span>
  )
}

function parseTagColor(tagColor: string): { bg: string; text: string } {
  // Nouveau format : "bg:#dbeafe;text:#1d4ed8"
  if (tagColor?.startsWith('bg:')) {
    const parts = tagColor.split(';')
    const bg   = parts[0]?.replace('bg:', '') || '#dbeafe'
    const text = parts[1]?.replace('text:', '') || '#1d4ed8'
    return { bg, text }
  }
  // Ancien format Tailwind (legacy) — fallback gris
  return { bg: '#f3f4f6', text: '#374151' }
}

function makeTagColor(bg: string, text: string): string {
  return `bg:${bg};text:${text}`
}

// ── POST FORM ─────────────────────────────────────────────────────
const PostForm = ({ initial, onSave, onClose }: {
  initial: Post | null
  onSave: (data: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onClose: () => void
}) => {
  const { get } = useSiteConfig()

  // Types depuis Supabase uniquement
  const rawCustomTypes = get('post_types', []) as { label: string; color: string }[]
  const customTypes    = Array.isArray(rawCustomTypes) ? rawCustomTypes : []

  // Retrouver le type initial
  const getInitialType = () => {
    if (!initial) return customTypes[0] || null
    return customTypes.find(t => t.label === initial.tag) || customTypes[0] || null
  }

  const [selectedType, setSelectedType] = useState<{ label: string; color: string } | null>(getInitialType)
  const [form, setForm] = useState({
    author:        initial?.author       || 'CSA Akbou Chess',
    author_role:   initial?.author_role  || 'Président',
    title:         initial?.title        || '',
    content:       initial?.content      || '',
    images_urls:   initial?.images_urls  || [],
    published:     initial?.published    ?? true,
    display_order: initial?.display_order || 0,
    custom_date:   initial?.custom_date  || '',
  })
  const [saving, setSaving]               = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>(form.images_urls)
  const [imageFiles, setImageFiles]       = useState<File[]>([])
  const imgRef = useRef<HTMLInputElement>(null)
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const previews = await Promise.all(files.map(readAsDataURL))
    setImageFiles(prev => [...prev, ...files])
    setImagePreviews(prev => [...prev, ...previews])
  }

  const handleSave = async () => {
    if (!form.author.trim())  { toast.error("L'auteur est requis"); return }
    if (!form.content.trim()) { toast.error("Le contenu est requis"); return }
    if (!selectedType)        { toast.error("Sélectionnez un type"); return }

    const payload = {
      ...form,
      type:      selectedType.label,
      tag:       selectedType.label,
      tag_color: selectedType.color,
    }

    setSaving(true)
    try {
      const newImageUrls = imageFiles.length ? await uploadMultiple('post-images', imageFiles) : []
      await onSave({ ...payload, images_urls: [...payload.images_urls, ...newImageUrls] })
      toast.success(initial ? "Publication mise à jour !" : "Publication créée !")
      onClose()
    } catch (e) {
      console.error(e)
      toast.error("Erreur lors de l'enregistrement")
    }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full sm:max-w-2xl max-h-[96vh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 text-white"
          style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
          <div>
            <h2 className="font-bold text-base">{initial ? "Modifier la publication" : "Nouvelle publication"}</h2>
            <p className="text-white/50 text-xs mt-0.5">Renseignez les champs et enregistrez</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Type personnalisé */}
          <div>
            <label className={labelCls}>Type de publication</label>
            {customTypes.length === 0 ? (
              <div className="border border-dashed rounded-xl p-4 text-center text-sm text-muted-foreground">
                Aucun type défini. Créez-en dans{' '}
                <span className="font-semibold text-foreground">Contenu du site → Publications</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {customTypes.map(t => {
                  const active  = selectedType?.label === t.label
                  const parsed  = parseTagColor(t.color)
                  return (
                    <button key={t.label}
                      onClick={() => setSelectedType(t)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border-2 transition-all"
                      style={{
                        background:   active ? parsed.bg   : 'transparent',
                        color:        active ? parsed.text : '#888',
                        borderColor:  active ? parsed.text : '#e5e7eb',
                      }}>
                      {t.label}
                    </button>
                  )
                })}
              </div>
            )}
            {selectedType && (
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                Aperçu du badge :
                <TagBadgeInline tag={selectedType.label} tagColor={selectedType.color} />
              </p>
            )}
          </div>

          {/* Auteur */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Auteur *</label>
              <input className={inputCls} placeholder="Nom de l'auteur" value={form.author} onChange={e => set('author', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Rôle</label>
              <input className={inputCls} placeholder="Ex: Président" value={form.author_role} onChange={e => set('author_role', e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Titre <span className="font-normal text-muted-foreground normal-case">(optionnel)</span></label>
            <input className={inputCls} placeholder="Titre de la publication" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Contenu *</label>
            <textarea className={`${inputCls} min-h-[120px] resize-y`} placeholder="Texte de la publication…" value={form.content} onChange={e => set('content', e.target.value)} />
          </div>

          {/* Photos */}
          <div>
            <label className={labelCls}>Photos</label>
            <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
            <div className="flex flex-wrap gap-2">
              {imagePreviews.map((url, i) => (
                <div key={i} className="relative group">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl border shadow-sm" />
                  <button onClick={() => { setImagePreviews(p => p.filter((_, j) => j !== i)); setImageFiles(f => f.filter((_, j) => j !== i)) }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full hidden group-hover:flex items-center justify-center shadow">
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button onClick={() => imgRef.current?.click()}
                className="w-20 h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">
                <ImagePlus size={18} /><span className="text-xs mt-1">Ajouter</span>
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className={labelCls}>Date d'affichage</label>
            <input type="date" className={inputCls}
              value={form.custom_date ? form.custom_date.slice(0, 10) : ''}
              onChange={e => set('custom_date', e.target.value ? `${e.target.value}T12:00:00.000Z` : '')} />
          </div>

          {/* Publié */}
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border hover:bg-muted/30 transition-colors">
            <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} className="w-4 h-4 accent-primary" />
            <div>
              <p className="text-sm font-medium">Publié</p>
              <p className="text-xs text-muted-foreground">Visible sur la page Réalisations</p>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t bg-muted/10 shrink-0">
          <button onClick={onClose} className="flex-1 border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={saving || customTypes.length === 0}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, hsl(var(--chess-gold-dark)), hsl(var(--chess-gold)))" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {initial ? "Enregistrer" : "Publier"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── PLAYER FORM ───────────────────────────────────────────────
const PlayerForm = ({ initial, mode: providedMode, onSave, onClose }: {
  initial: Player | null
  mode: 'athlete' | 'member'
  onSave: (data: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onClose: () => void
}) => {
  // Détecter le mode si on est en édition
  const mode = initial 
    ? (['joueur', 'athlète'].includes(initial.role?.toLowerCase() || '') ? 'athlete' : 'member')
    : providedMode;

  const [form, setForm] = useState({
    nom:            initial?.nom            || '',
    prenom:         initial?.prenom         || '',
    date_naissance: initial?.date_naissance || '',
    categorie:      initial?.categorie      || '',
    fide_id:        initial?.fide_id        || '',
    role:           initial?.role           || '',
    telephone:      initial?.telephone      || '',
    niveaux:        initial?.niveaux        || '',
    display_order:  initial?.display_order  || 0,
  })

  // Pre-remplissage pour les nouveaux athlètes
  useEffect(() => {
    if (!initial && mode === 'athlete' && !form.role) {
      setForm(f => ({ ...f, role: 'Athlète' }))
    }
  }, [initial, mode])

  const [saving, setSaving] = useState(false)
  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.nom.trim() || !form.prenom.trim()) { toast.error("Nom et prénom requis"); return }
    setSaving(true)
    const finalForm = { ...form }
    if (finalForm.role?.toLowerCase().includes('membre ag')) {
      finalForm.role = 'Membre'
    }

    try {
      await onSave(finalForm)
      toast.success(initial ? "Enregistré avec succès !" : "Ajouté avec succès !")
      onClose()
    } catch {
      toast.error("Erreur lors de l'enregistrement")
    }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 text-white"
          style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
          <div>
            <h2 className="font-bold text-base">
              {initial ? "Modifier" : "Ajouter"} {mode === 'athlete' ? "un athlète" : "un adhérent"}
            </h2>
            <p className="text-white/50 text-xs mt-0.5">Renseignez les informations de {mode === 'athlete' ? "l'athlète" : "l'adhérent"}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Nom *</label><input className={inputCls} value={form.nom} onChange={e => set('nom', e.target.value)} /></div>
            <div><label className={labelCls}>Prénom *</label><input className={inputCls} value={form.prenom} onChange={e => set('prenom', e.target.value)} /></div>
          </div>
          <div>
            <label className={labelCls}>Date de naissance</label>
            <input type="text" placeholder="JJ/MM/AAAA" className={inputCls} value={form.date_naissance || ''} onChange={e => set('date_naissance', e.target.value)} />
          </div>
          {mode === 'athlete' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Catégorie</label>
                <input className={inputCls} placeholder="Ex: U14..." value={form.categorie || ''} onChange={e => set('categorie', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Niveau</label>
                <input className={inputCls} placeholder="Ex: Régional..." value={form.niveaux || ''} onChange={e => set('niveaux', e.target.value)} />
              </div>
            </div>
          )}
          
          <div>
            <label className={labelCls}>ID FIDE</label>
            <input className={inputCls} placeholder="Numéro ID FIDE" value={form.fide_id || ''} onChange={e => set('fide_id', e.target.value)} />
          </div>

          {mode === 'member' && (
            <>
              <div>
                <label className={labelCls}>Fonction / Rôle</label>
                <input className={inputCls} placeholder="Ex: Président, Trésorier..." value={form.role || ''} onChange={e => set('role', e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Numéro de Téléphone</label>
                <input className={inputCls} placeholder="Ex: 0555 00 00 00" value={form.telephone || ''} onChange={e => set('telephone', e.target.value)} />
              </div>
            </>
          )}

          <div>
            <label className={labelCls}>Ordre d'affichage</label>
            <input type="number" className={inputCls} value={form.display_order} onChange={e => set('display_order', +e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t bg-muted/10 shrink-0">
          <button onClick={onClose} className="flex-1 border rounded-xl py-2.5 text-sm font-medium hover:bg-muted transition-colors">Annuler</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:brightness-110"
            style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ATHLETES PANEL ─────────────────────────────────────────────
const PlayersPanel = ({ players, loading, onEdit, onDelete, onNew }: {
  players: Player[]
  loading: boolean
  onEdit: (p: Player) => void
  onDelete: (id: string) => void
  onNew: (mode: 'athlete' | 'member') => void
}) => {
  const [q, setQ] = useState('')
  const [delConf, setDelConf] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'adherents' | 'athletes'>('adherents')
  const [catFilter, setCatFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')

  // Filtrage : Adhérents (rôle spécifique) vs Athlètes (sans rôle ou 'Athlète'/'Joueur')
  const adherentsList = players.filter(p => p.role && p.role.trim() !== '' && !['joueur', 'athlète'].includes(p.role.toLowerCase()))
  const clubAthletes   = players.filter(p => !p.role || p.role.trim() === '' || ['joueur', 'athlète'].includes(p.role.toLowerCase()))

  const currentList = activeTab === 'adherents' ? adherentsList : clubAthletes

  const categories = Array.from(new Set(clubAthletes.map(p => p.categorie).filter(Boolean))).sort()
  const levels     = Array.from(new Set(clubAthletes.map(p => p.niveaux).filter(Boolean))).sort()

  const filtered = currentList.filter(p => {
    const matchSearch = `${p.nom} ${p.prenom}`.toLowerCase().includes(q.toLowerCase()) || 
                       p.fide_id?.toLowerCase().includes(q.toLowerCase()) ||
                       p.telephone?.toLowerCase().includes(q.toLowerCase()) ||
                       p.niveaux?.toLowerCase().includes(q.toLowerCase())

    if (activeTab === 'athletes') {
      const matchCat = catFilter === 'all' || p.categorie === catFilter
      const matchLevel = levelFilter === 'all' || p.niveaux === levelFilter
      return matchSearch && matchCat && matchLevel
    }
    return matchSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold">Membres & Athlètes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{players.length} personne{players.length > 1 ? 's' : ''} au total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNew('member')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
            style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
            <Plus size={16} /> Adhérent
          </button>
          <button onClick={() => onNew('athlete')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
            <Plus size={16} /> Athlète
          </button>
        </div>
      </div>

      <div className="flex p-1 bg-muted rounded-2xl w-fit">
        <button onClick={() => { setActiveTab('adherents'); setQ('') }}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'adherents' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          Adhérents du Club
        </button>
        <button onClick={() => { setActiveTab('athletes'); setQ('') }}
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'athletes' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          Athlètes du Club
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 w-full max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder={`Rechercher un ${activeTab === 'adherents' ? 'membre' : 'athlète'}...`} value={q} onChange={e => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl bg-background outline-none transition-shadow focus:ring-2 focus:ring-primary/20" />
        </div>

        {activeTab === 'athletes' && (
          <div className="flex gap-2 w-full sm:w-auto">
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              className="flex-1 sm:flex-none h-10 px-3 py-1.5 text-xs border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary/20">
              <option value="all">Toutes catégories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
              className="flex-1 sm:flex-none h-10 px-3 py-1.5 text-xs border rounded-xl bg-background outline-none focus:ring-2 focus:ring-primary/20">
              <option value="all">Tous niveaux</option>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground">
          <UserCheck size={28} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{q ? "Aucun résultat trouvé" : "Liste vide"}</p>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="grid gap-3 sm:hidden">
            {filtered.map(p => (
              <div key={p.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-base leading-snug">{p.nom} {p.prenom}</p>
                    <div className="flex gap-2 mt-1">
                      {p.role && <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">{p.role}</span>}
                      {p.categorie && activeTab === 'athletes' && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">{p.categorie}</span>}
                      {p.niveaux && activeTab === 'athletes' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-chess-blue/10 text-chess-blue">{p.niveaux}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => onEdit(p)} className="p-2 rounded-lg bg-muted text-muted-foreground transition-colors hover:text-foreground"><Pencil size={15} /></button>
                    {delConf === p.id ? (
                      <div className="flex gap-1 animate-in slide-in-from-right-2">
                        <button onClick={() => { onDelete(p.id); toast.success("Supprimé") }} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold shadow-sm">Oui</button>
                        <button onClick={() => setDelConf(null)} className="px-3 py-1 border rounded-lg text-xs hover:bg-muted transition-colors">Non</button>
                      </div>
                    ) : (
                      <button onClick={() => setDelConf(p.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><Trash2 size={15} /></button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                  {activeTab === 'adherents' && p.telephone && (
                    <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded-md">
                      <Phone size={10} className="text-green-600" /> {p.telephone}
                    </div>
                  )}
                  {p.fide_id && (
                    <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded-md">
                      <Trophy size={10} className="text-amber-500" /> ID: {p.fide_id}
                    </div>
                  )}
                  {activeTab === 'athletes' && p.date_naissance && (
                    <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded-md col-span-2">
                      <Calendar size={10} /> Né(e) le : {p.date_naissance}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden sm:block bg-card border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Nom / FIDE</th>
                    {activeTab === 'adherents' ? (
                      <>
                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Fonction</th>
                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Téléphone</th>
                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Naissance</th>
                      </>
                    ) : (
                      <>
                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Catégorie</th>
                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground space-x-1">Niveau</th>
                        <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground">Naissance</th>
                      </>
                    )}
                    <th className="px-5 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(p => (
                    <tr key={p.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-sm group-hover:text-primary transition-colors">{p.nom} {p.prenom}</p>
                        {p.fide_id && <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5"><Trophy size={9} className="text-amber-500" /> ID: {p.fide_id}</span>}
                      </td>
                      {activeTab === 'adherents' ? (
                        <>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-primary/5 text-primary border border-primary/10 whitespace-nowrap">{p.role}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-2"><Phone size={11} className="text-green-600" /> {p.telephone || '—'}</span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-muted-foreground">
                            {p.date_naissance || '—'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3.5">
                            {p.categorie ? <span className="text-xs font-medium px-2 py-1 rounded-md bg-orange-50 text-orange-600 border border-orange-100">{p.categorie}</span> : <span className="text-xs text-muted-foreground opacity-30">—</span>}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-bold text-chess-blue">{p.niveaux || '—'}</span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-muted-foreground">
                            {p.date_naissance || '—'}
                          </td>
                        </>
                      )}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onEdit(p)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"><Pencil size={14} /></button>
                          {delConf === p.id ? (
                            <div className="flex gap-1 animate-in fade-in zoom-in duration-200">
                              <button onClick={() => { onDelete(p.id); toast.success("Supprimé") }} className="px-2 py-1 bg-red-500 text-white rounded text-[10px] font-bold">Oui</button>
                              <button onClick={() => setDelConf(null)} className="px-2 py-1 border rounded text-[10px]">Non</button>
                            </div>
                          ) : (
                            <button onClick={() => setDelConf(p.id)} className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── CONFIG FIELD COMPONENTS (définis hors ConfigPanel pour éviter la perte de focus) ──
interface FieldProps { k: string; label: string; multiline?: boolean; vals: Record<string, string>; onChange: (k: string, v: string) => void; onSave: (k: string) => void; saving: string | null }
const ConfigField = ({ k, label, multiline = false, vals, onChange, onSave, saving }: FieldProps) => (
  <div className="bg-card border rounded-xl p-4 shadow-sm">
    <label className={labelCls}>{label}</label>
    {multiline
      ? <textarea className={`${inputCls} min-h-[80px] resize-y`} value={vals[k] || ''} onChange={e => onChange(k, e.target.value)} />
      : <input className={inputCls} value={vals[k] || ''} onChange={e => onChange(k, e.target.value)} />
    }
    <button onClick={() => onSave(k)} disabled={saving === k}
      className="mt-2 text-xs text-white px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-60"
      style={{ background: "hsl(var(--chess-blue))" }}>
      {saving === k ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Sauvegarder
    </button>
  </div>
)

interface ImgFieldProps { k: string; label: string; vals: Record<string, string>; onSaveImg: (k: string, file: File) => void; saving: string | null; fileRef: React.RefObject<HTMLInputElement> }
const ConfigImgField = ({ k, label, vals, onSaveImg, saving, fileRef }: ImgFieldProps) => (
  <div className="bg-card border rounded-xl p-4 shadow-sm col-span-1 sm:col-span-2">
    <label className={labelCls}>{label}</label>
    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) onSaveImg(k, e.target.files[0]) }} />
    <div className="flex items-center gap-3 mt-1">
      {vals[k] && vals[k] !== 'null' && vals[k] !== '' && (
        <img src={vals[k]} alt="" className="h-20 w-auto rounded-lg border object-cover shadow-sm" />
      )}
      <button onClick={() => fileRef.current?.click()} disabled={saving === k}
        className="flex items-center gap-2 text-xs text-white px-3 py-2 rounded-lg disabled:opacity-60"
        style={{ background: "hsl(var(--chess-blue))" }}>
        {saving === k ? <Loader2 size={11} className="animate-spin" /> : <ImagePlus size={11} />}
        {vals[k] && vals[k] !== 'null' && vals[k] !== '' ? "Changer" : "Choisir"} une photo
      </button>
    </div>
  </div>
)

// ── SITE CONFIG PANEL ─────────────────────────────────────────────
const ConfigPanel = () => {
  const { config, update } = useSiteConfig()
  const [saving, setSaving] = useState<string | null>(null)
  const [vals, setVals] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'general' | 'about' | 'horaires' | 'media' | 'feed'>('general')
  const storyImgRef = useRef<HTMLInputElement>(null)
  const venueImgRef = useRef<HTMLInputElement>(null)
  const heroImgRef = useRef<HTMLInputElement>(null)
  const [newType, setNewType] = useState('')
  const [newTypeColor, setNewTypeColor] = useState('bg:#dbeafe;text:#1d4ed8')

  // États visuels pour les éditeurs user-friendly
  const [schedule, setSchedule] = useState<{day: string; hours: string}[]>([])
  const [faqItems, setFaqItems] = useState<{q: string; a: string}[]>([])
  const [seasonStats, setSeasonStats] = useState<{label: string; value: string}[]>([])
  const [postTypes, setPostTypes] = useState<{label: string; color: string}[]>([])

  // Sync vals depuis config (une seule fois au chargement)
  useEffect(() => {
    if (Object.keys(config).length === 0) return
    const initial: Record<string, string> = {}
    Object.keys(config).forEach(k => {
      const v = config[k]
      initial[k] = typeof v === 'string' ? v : JSON.stringify(v, null, 2)
    })
    setVals(initial)

    // Sync les états visuels une fois les données chargées
    try { const s = config['schedule']; if (Array.isArray(s)) setSchedule(s as {day:string;hours:string}[]) } catch {}
    try { const f = config['faq']; if (Array.isArray(f)) setFaqItems(f as {q:string;a:string}[]) } catch {}
    try {
      const ss = config['season_stats']
      if (Array.isArray(ss)) setSeasonStats(ss as {label:string;value:string}[])
      else setSeasonStats([
        { label: "Tournois joués", value: "8" },
        { label: "Victoires", value: "3" },
        { label: "Podiums équipe", value: "2" },
        { label: "Séances", value: "42" },
      ])
    } catch {}    try { const t = config['post_types']; if (Array.isArray(t)) setPostTypes(t as {label:string;color:string}[]) } catch {}
  }, [config])

  const handleChange = (k: string, v: string) => setVals(prev => ({ ...prev, [k]: v }))

  const save = async (key: string) => {
    setSaving(key)
    try {
      let parsed: unknown = vals[key]
      try { parsed = JSON.parse(vals[key]) } catch {}
      await update(key, parsed)
      toast.success("Enregistré !")
    } catch { toast.error("Erreur lors de la sauvegarde") }
    finally { setSaving(null) }
  }

  const saveImg = async (key: string, file: File) => {
    if (!file.size) { await update(key, null); setVals(v => ({ ...v, [key]: '' })); return }
    setSaving(key)
    try {
      const url = await uploadFile('gallery', file)
      await update(key, url)
      setVals(v => ({ ...v, [key]: url || '' }))
      toast.success("Image mise à jour !")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur upload")
    }
    finally { setSaving(null) }
  }

  const saveSchedule = async () => {
    setSaving('schedule')
    try { await update('schedule', schedule); toast.success("Horaires enregistrés !") }
    catch { toast.error("Erreur") } finally { setSaving(null) }
  }
  const saveFaq = async () => {
    setSaving('faq')
    try { await update('faq', faqItems); toast.success("FAQ enregistrée !") }
    catch { toast.error("Erreur") } finally { setSaving(null) }
  }
  const saveSeasonStats = async () => {
    setSaving('season_stats')
    try { await update('season_stats', seasonStats); toast.success("Saison enregistrée !") }
    catch { toast.error("Erreur") } finally { setSaving(null) }
  }
  const savePostTypes = async (types: {label: string; color: string}[]) => {
    setSaving('post_types')
    try { await update('post_types', types); toast.success("Types enregistrés !") }
    catch { toast.error("Erreur") } finally { setSaving(null) }
  }

  const TABS = [
    { id: 'general' as const, label: 'Général & Contact' },
    { id: 'about'   as const, label: 'Page À propos' },
    { id: 'horaires'as const, label: 'Horaires & FAQ' },
    { id: 'media'   as const, label: 'Photos & Médias' },
    { id: 'feed'    as const, label: 'Publications' },
  ]


  // ── Valeurs du club (state visuel) ──
  const [values, setValues] = useState<{title: string; desc: string}[]>([])
  const [storyParagraphs, setStoryParagraphs] = useState<string[]>([])
  const presentationImgRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try { const v = config['values']; if (Array.isArray(v)) setValues(v as {title:string;desc:string}[]) } catch {}
  }, [config])
  useEffect(() => {
    try { const p = config['about_story_paragraphs']; if (Array.isArray(p)) setStoryParagraphs(p as string[]) } catch {}
  }, [config])

  const saveValues = async () => {
    setSaving('values')
    try { await update('values', values); toast.success("Valeurs enregistrées !") }
    catch { toast.error("Erreur") } finally { setSaving(null) }
  }
  const saveStoryParagraphs = async () => {
    setSaving('about_story_paragraphs')
    try { await update('about_story_paragraphs', storyParagraphs); toast.success("Paragraphes enregistrés !") }
    catch { toast.error("Erreur") } finally { setSaving(null) }
  }

  const fp = { vals, onChange: handleChange, onSave: save, saving }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold">Contenu du site</h2>
      <p className="text-sm text-muted-foreground">Toutes les modifications sont instantanément visibles sur le site.</p>

      <div className="flex overflow-x-auto gap-2 border-b pb-2 -mx-1 px-1 scrollbar-none">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === t.id ? 'text-white' : 'text-muted-foreground hover:bg-muted'}`}
            style={activeTab === t.id ? { background: "hsl(var(--chess-blue))" } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* GÉNÉRAL */}
      {activeTab === 'general' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <ConfigField {...fp} k="club_name"        label="Nom du club" />
          <ConfigField {...fp} k="club_subtitle"    label="Sous-titre" />
          <ConfigField {...fp} k="club_founded"           label="Année de fondation" />
          <ConfigField {...fp} k="club_members"           label="Nombre de membres" />
          <ConfigField {...fp} k="club_teams"             label="Nombre d'équipes" />
          <ConfigField {...fp} k="club_tournaments_per_year" label="Tournois par an" />
          <ConfigField {...fp} k="club_address"     label="Adresse" />
          <ConfigField {...fp} k="club_email"       label="Email de contact" />
          <ConfigField {...fp} k="club_phone"       label="Téléphone" />
          <ConfigField {...fp} k="club_description" label="Description courte" multiline />
          <ConfigField {...fp} k="hero_title"       label="Titre hero (accueil)" />
          <ConfigField {...fp} k="hero_subtitle"    label="Sous-titre hero" multiline />

          {/* Réseaux sociaux */}
          <div className="col-span-1 sm:col-span-2 bg-card border rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-semibold text-sm mb-1">Réseaux sociaux</h3>
              <p className="text-xs text-muted-foreground">Laissez vide pour ne pas afficher. Entrez l'URL complète.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { k: 'social_facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/votre-page' },
                { k: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/votre-compte' },
                { k: 'social_whatsapp',  label: 'WhatsApp',  placeholder: 'https://wa.me/33612345678' },
                { k: 'social_youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@votre-chaine' },
              ].map(({ k, label, placeholder }) => (
                <div key={k} className="bg-muted/20 border rounded-xl p-3">
                  <label className={labelCls}>{label}</label>
                  <input
                    className={inputCls}
                    placeholder={placeholder}
                    value={vals[k] || ''}
                    onChange={e => handleChange(k, e.target.value)}
                  />
                  <button onClick={() => save(k)} disabled={saving === k}
                    className="mt-2 text-xs text-white px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-60"
                    style={{ background: "hsl(var(--chess-blue))" }}>
                    {saving === k ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />} Sauvegarder
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* À PROPOS */}
      {activeTab === 'about' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ConfigField {...fp} k="about_hero_title"    label="Titre principal de la page" />
            <ConfigField {...fp} k="about_story_title"   label="Étiquette section histoire" />
          </div>

          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Paragraphes — section histoire</h3>
              <button onClick={() => setStoryParagraphs([...storyParagraphs, ''])}
                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg text-white"
                style={{ background: "hsl(var(--chess-blue))" }}>
                <Plus size={12} /> Ajouter un paragraphe
              </button>
            </div>
            <div className="space-y-2">
              {storyParagraphs.map((p, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className="text-xs font-bold text-muted-foreground mt-2.5 w-4 shrink-0">{i + 1}</span>
                  <textarea rows={2} value={p}
                    onChange={e => setStoryParagraphs(storyParagraphs.map((x, j) => j === i ? e.target.value : x))}
                    className={`${inputCls} flex-1 resize-none`} placeholder="Texte du paragraphe..." />
                  <button onClick={() => setStoryParagraphs(storyParagraphs.filter((_, j) => j !== i))}
                    className="p-1.5 mt-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              {storyParagraphs.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-lg">Cliquez "Ajouter un paragraphe"</p>
              )}
            </div>
            <button onClick={saveStoryParagraphs} disabled={saving === 'about_story_paragraphs'}
              className="mt-3 text-xs text-white px-4 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-60"
              style={{ background: "hsl(var(--chess-blue))" }}>
              {saving === 'about_story_paragraphs' ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
              Enregistrer les paragraphes
            </button>
          </div>

          <ConfigImgField k="about_story_image_url" label="Photo histoire (à gauche)" vals={vals} onSaveImg={saveImg} saving={saving} fileRef={storyImgRef} />

          <div className="grid gap-4 sm:grid-cols-2">
            <ConfigField {...fp} k="about_venue_subtitle" label="Étiquette section salle" />
            <ConfigField {...fp} k="about_venue_title"    label="Titre section salle" />
            <ConfigField {...fp} k="about_venue_text"     label="Texte section salle" multiline />
          </div>
          <ConfigImgField k="about_venue_image_url" label="Photo salle (à droite)" vals={vals} onSaveImg={saveImg} saving={saving} fileRef={venueImgRef} />

          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Nos valeurs</h3>
              <button onClick={() => setValues([...values, { title: '', desc: '' }])}
                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg text-white"
                style={{ background: "hsl(var(--chess-blue))" }}>
                <Plus size={12} /> Ajouter une valeur
              </button>
            </div>
            <div className="space-y-3">
              {values.map((v, i) => (
                <div key={i} className="border rounded-xl p-3 bg-muted/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <input placeholder="Titre (ex: Fair-play)" value={v.title}
                      onChange={e => setValues(values.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                      className={`${inputCls} font-semibold flex-1`} />
                    <button onClick={() => setValues(values.filter((_, j) => j !== i))}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <textarea rows={2} placeholder="Description..." value={v.desc}
                    onChange={e => setValues(values.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))}
                    className={`${inputCls} resize-none w-full`} />
                </div>
              ))}
              {values.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-3 border border-dashed rounded-lg">Cliquez "Ajouter une valeur"</p>
              )}
            </div>
            <button onClick={saveValues} disabled={saving === 'values'}
              className="mt-3 text-xs text-white px-4 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-60"
              style={{ background: "hsl(var(--chess-blue))" }}>
              {saving === 'values' ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
              Enregistrer les valeurs
            </button>
          </div>
        </div>
      )}

      {/* HORAIRES & FAQ */}
      {activeTab === 'horaires' && (
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Horaires des séances</h3>
              <button onClick={() => setSchedule([...schedule, { day: '', hours: '' }])}
                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg text-white"
                style={{ background: "hsl(var(--chess-blue))" }}>
                <Plus size={12} /> Ajouter un jour
              </button>
            </div>
            <div className="space-y-2">
              {schedule.map((h, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input placeholder="Jour (ex: Mardi)" value={h.day}
                    onChange={e => setSchedule(schedule.map((x, j) => j === i ? { ...x, day: e.target.value } : x))}
                    className={`${inputCls} flex-1`} />
                  <input placeholder="Horaires (ex: 18h – 21h)" value={h.hours}
                    onChange={e => setSchedule(schedule.map((x, j) => j === i ? { ...x, hours: e.target.value } : x))}
                    className={`${inputCls} flex-1`} />
                  <button onClick={() => setSchedule(schedule.filter((_, j) => j !== i))}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {schedule.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">Aucun horaire — cliquez "Ajouter un jour"</p>
              )}
            </div>
            <button onClick={saveSchedule} disabled={saving === 'schedule'}
              className="mt-4 text-xs text-white px-4 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-60"
              style={{ background: "hsl(var(--chess-blue))" }}>
              {saving === 'schedule' ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
              Enregistrer les horaires
            </button>
          </div>

          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Questions fréquentes</h3>
              <button onClick={() => setFaqItems([...faqItems, { q: '', a: '' }])}
                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg text-white"
                style={{ background: "hsl(var(--chess-blue))" }}>
                <Plus size={12} /> Ajouter une question
              </button>
            </div>
            <div className="space-y-3">
              {faqItems.map((f, i) => (
                <div key={i} className="border rounded-xl p-3 space-y-2 bg-muted/20">
                  <div className="flex gap-2 items-start">
                    <span className="text-xs font-bold text-muted-foreground mt-2.5 w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 space-y-2">
                      <input placeholder="Question" value={f.q}
                        onChange={e => setFaqItems(faqItems.map((x, j) => j === i ? { ...x, q: e.target.value } : x))}
                        className={`${inputCls} font-medium`} />
                      <textarea placeholder="Réponse" rows={2} value={f.a}
                        onChange={e => setFaqItems(faqItems.map((x, j) => j === i ? { ...x, a: e.target.value } : x))}
                        className={`${inputCls} resize-none`} />
                    </div>
                    <button onClick={() => setFaqItems(faqItems.filter((_, j) => j !== i))}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors mt-0.5 shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {faqItems.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">Aucune question — cliquez "Ajouter une question"</p>
              )}
            </div>
            <button onClick={saveFaq} disabled={saving === 'faq'}
              className="mt-4 text-xs text-white px-4 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-60"
              style={{ background: "hsl(var(--chess-blue))" }}>
              {saving === 'faq' ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
              Enregistrer la FAQ
            </button>
          </div>
        </div>
      )}

      {/* PHOTOS & MÉDIAS */}
      {activeTab === 'media' && (
        <div className="space-y-5">
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-1">Photo de fond — Accueil (hero)</h3>
            <p className="text-xs text-muted-foreground mb-4">Apparaît en fond de la grande section d'accueil.</p>
            <input ref={heroImgRef} type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files?.[0]) saveImg('hero_image_url', e.target.files[0]) }} />
            <div className="flex items-center gap-4">
              {vals['hero_image_url'] && vals['hero_image_url'] !== 'null' && vals['hero_image_url'] !== '' && (
                <img src={vals['hero_image_url']} alt="" className="h-24 w-auto rounded-xl border object-cover shadow-sm" />
              )}
              <button onClick={() => heroImgRef.current?.click()} disabled={saving === 'hero_image_url'}
                className="flex items-center gap-2 text-sm text-white px-4 py-2.5 rounded-xl disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
                {saving === 'hero_image_url' ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                {vals['hero_image_url'] && vals['hero_image_url'] !== 'null' && vals['hero_image_url'] !== '' ? "Changer" : "Choisir une photo"}
              </button>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-1">Photo — Section présentation (accueil)</h3>
            <p className="text-xs text-muted-foreground mb-4">Apparaît à gauche des horaires et stats sur la page d'accueil.</p>
            <input ref={presentationImgRef} type="file" accept="image/*" className="hidden"
              onChange={e => { if (e.target.files?.[0]) saveImg('presentation_image_url', e.target.files[0]) }} />
            <div className="flex items-center gap-4">
              {vals['presentation_image_url'] && vals['presentation_image_url'] !== 'null' && vals['presentation_image_url'] !== '' && (
                <img src={vals['presentation_image_url']} alt="" className="h-24 w-auto rounded-xl border object-cover shadow-sm" />
              )}
              <button onClick={() => presentationImgRef.current?.click()} disabled={saving === 'presentation_image_url'}
                className="flex items-center gap-2 text-sm text-white px-4 py-2.5 rounded-xl disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
                {saving === 'presentation_image_url' ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                {vals['presentation_image_url'] && vals['presentation_image_url'] !== 'null' && vals['presentation_image_url'] !== '' ? "Changer" : "Choisir une photo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLICATIONS */}
      {activeTab === 'feed' && (
        <div className="space-y-6">

          {/* ── Types personnalisés ── */}
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-1">Types de publications personnalisés</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Créez vos propres types en plus des types fixes (Annonce, Photo, Résultat). Ils apparaissent dans le formulaire de publication.
            </p>

            {/* Liste types existants */}
            <div className="space-y-2 mb-4">
              {postTypes.length === 0 && (
                <p className="text-xs text-muted-foreground italic py-2">Aucun type personnalisé</p>
              )}
              {postTypes.map((t, i) => {
                const parts = t.color?.startsWith('bg:') ? t.color.split(';') : []
                const bg    = parts[0]?.replace('bg:', '') || '#f3f4f6'
                const col   = parts[1]?.replace('text:', '') || '#374151'
                return (
                  <div key={i} className="flex items-center gap-3 border rounded-xl p-3 bg-muted/20">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: bg, color: col }}>{t.label}</span>
                    <span className="text-xs text-muted-foreground flex-1 truncate">{t.color}</span>
                    <button onClick={() => { const u = postTypes.filter((_, j) => j !== i); setPostTypes(u); savePostTypes(u) }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Formulaire ajout */}
            <div className="border rounded-xl p-4 bg-muted/10 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ajouter un type</p>
              <div>
                <label className={labelCls}>Nom du type *</label>
                <input
                  placeholder="Ex: Conférence, Simul, Cours…"
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newType.trim()) {
                      const u = [...postTypes, { label: newType.trim(), color: newTypeColor }]
                      setPostTypes(u); savePostTypes(u); setNewType('')
                    }
                  }}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Couleur du badge</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Bleu',   bg: '#dbeafe', text: '#1d4ed8' },
                    { label: 'Vert',   bg: '#dcfce7', text: '#15803d' },
                    { label: 'Or',     bg: '#fef9c3', text: '#a16207' },
                    { label: 'Violet', bg: '#f3e8ff', text: '#7e22ce' },
                    { label: 'Rose',   bg: '#fce7f3', text: '#be185d' },
                    { label: 'Orange', bg: '#ffedd5', text: '#c2410c' },
                    { label: 'Teal',   bg: '#ccfbf1', text: '#0f766e' },
                    { label: 'Rouge',  bg: '#fee2e2', text: '#b91c1c' },
                    { label: 'Indigo', bg: '#e0e7ff', text: '#4338ca' },
                    { label: 'Gris',   bg: '#f3f4f6', text: '#374151' },
                  ].map(({ label, bg, text }) => {
                    const colorVal = `bg:${bg};text:${text}`
                    const isActive = newTypeColor === colorVal
                    return (
                      <button key={label}
                        onClick={() => setNewTypeColor(colorVal)}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold border-2 transition-all"
                        style={{
                          background:  bg,
                          color:       text,
                          borderColor: isActive ? text : 'transparent',
                          opacity:     isActive ? 1 : 0.6,
                          boxShadow:   isActive ? `0 0 0 1px ${text}` : 'none',
                        }}>
                        {label}
                      </button>
                    )
                  })}
                </div>
                {/* Aperçu */}
                {newType && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Aperçu :</span>
                    {(() => {
                      const parts = newTypeColor.split(';')
                      const bg = parts[0]?.replace('bg:', '') || '#dbeafe'
                      const col = parts[1]?.replace('text:', '') || '#1d4ed8'
                      return (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ background: bg, color: col }}>
                          {newType}
                        </span>
                      )
                    })()}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (!newType.trim()) return
                  const u = [...postTypes, { label: newType.trim(), color: newTypeColor }]
                  setPostTypes(u); savePostTypes(u); setNewType('')
                }}
                disabled={!newType.trim() || saving === 'post_types'}
                className="flex items-center gap-1.5 text-xs text-white px-4 py-2 rounded-lg disabled:opacity-40 transition-colors"
                style={{ background: "hsl(var(--chess-blue))" }}>
                {saving === 'post_types' ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                Ajouter ce type
              </button>
            </div>
          </div>
                    <div className="bg-card border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm">Saison en chiffres</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Affichés dans la sidebar de la page Réalisations.</p>
              </div>
              <button onClick={() => setSeasonStats([...seasonStats, { label: '', value: '' }])}
                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg text-white"
                style={{ background: "hsl(var(--chess-blue))" }}>
                <Plus size={12} /> Ajouter
              </button>
            </div>
            <div className="space-y-3">
              {seasonStats.map((s, i) => (
                <div key={i} className="border rounded-xl p-3 bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted-foreground">Stat {i + 1}</span>
                    <button onClick={() => setSeasonStats(seasonStats.filter((_, j) => j !== i))}
                      className="p-1 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input placeholder="Label (ex: Tournois joués)" value={s.label}
                      onChange={e => setSeasonStats(seasonStats.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
                      className={`${inputCls} w-full`} />
                    <input placeholder="Valeur (ex: 8)" value={s.value}
                      onChange={e => setSeasonStats(seasonStats.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                      className={`${inputCls} w-full`} />
                  </div>
                </div>
              ))}
              {seasonStats.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">Aucun chiffre — cliquez "Ajouter"</p>
              )}
            </div>
            <button onClick={saveSeasonStats} disabled={saving === 'season_stats'}
              className="mt-4 text-xs text-white px-4 py-2 rounded-lg flex items-center gap-1.5 disabled:opacity-60"
              style={{ background: "hsl(var(--chess-blue))" }}>
              {saving === 'season_stats' ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
              Enregistrer la saison
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── GALLERY PANEL ─────────────────────────────────────────────────
const GalleryPanel = () => {
  const { data, loading, create, remove } = useGallery()
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState("")
  const [dateLabel, setDateLabel] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile('gallery', file)
      if (!url) throw new Error("Upload failed")
      await create({ url, caption, date_label: dateLabel, display_order: data.length })
      setCaption(""); setDateLabel("")
      toast.success("Photo ajoutée !")
    } catch { toast.error("Erreur lors de l'upload") }
    finally { setUploading(false) }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Galerie (page d'accueil)</h2>
      <div className="bg-card border rounded-xl p-4 shadow-sm space-y-3">
        <p className="text-sm font-semibold">Ajouter une photo</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Légende</label><input className={inputCls} value={caption} onChange={e => setCaption(e.target.value)} /></div>
          <div><label className={labelCls}>Date</label><input className={inputCls} value={dateLabel} onChange={e => setDateLabel(e.target.value)} placeholder="Mars 2026" /></div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="flex items-center gap-2 text-sm text-white px-4 py-2 rounded-lg disabled:opacity-60"
          style={{ background: "hsl(var(--chess-blue))" }}>
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          Choisir une photo
        </button>
      </div>
      {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.map(photo => (
            <div key={photo.id} className="group relative rounded-xl border overflow-hidden shadow-sm">
              <img src={photo.url} alt="" className="w-full h-32 object-cover" />
              <div className="p-2 bg-card">
                <p className="text-xs font-medium truncate">{photo.caption || "(sans légende)"}</p>
                <p className="text-[10px] text-muted-foreground">{photo.date_label}</p>
              </div>
              <button onClick={() => { if (confirm("Supprimer ?")) remove(photo.id) }}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── POSTS PANEL ──────────────────────────────────────────────────
interface PostsPanelProps {
  posts: Post[]
  filteredPosts: Post[]
  loading: boolean
  pSearch: string
  setPSearch: (v: string) => void
  deleteConfirm: string | null
  setDeleteConfirm: (v: string | null) => void
  onEdit: (p: Post) => void
  onDelete: (id: string) => Promise<void>
  onNew: () => void
}

const PostsPanel = ({ posts, filteredPosts, loading, pSearch, setPSearch, deleteConfirm, setDeleteConfirm, onEdit, onDelete, onNew }: PostsPanelProps) => {
  const { get: getConfig } = useSiteConfig()
  const postTypes = (getConfig('post_types', []) as { label: string; color: string }[])
  const [pTypeFilter, setPTypeFilter] = useState('')

  const fullyFiltered = filteredPosts.filter(p =>
    !pTypeFilter || p.type === pTypeFilter || p.tag === pTypeFilter
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold shrink-0">Publications</h2>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher…" value={pSearch}
            onChange={e => setPSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-sm border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
          {pSearch && <button onClick={() => setPSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={13} /></button>}
        </div>
        <button onClick={onNew}
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-xl shadow shrink-0"
          style={{ background: "hsl(var(--chess-gold))" }}>
          <Plus size={15} /> <span className="hidden sm:inline">Nouvelle</span>
        </button>
      </div>

      {/* Filtre par type */}
      {postTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setPTypeFilter('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${!pTypeFilter ? 'text-white border-transparent' : 'border-border text-muted-foreground hover:bg-muted'}`}
            style={!pTypeFilter ? { background: "hsl(var(--chess-blue))" } : {}}>
            Tous
          </button>
          {postTypes.map(t => {
            const parts  = t.color?.startsWith('bg:') ? t.color.split(';') : []
            const bg     = parts[0]?.replace('bg:', '') || '#f3f4f6'
            const col    = parts[1]?.replace('text:', '') || '#374151'
            const active = pTypeFilter === t.label
            return (
              <button key={t.label} onClick={() => setPTypeFilter(active ? '' : t.label)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                style={{ background: active ? bg : 'transparent', color: active ? col : '#888', borderColor: active ? col : '#e5e7eb' }}>
                {t.label}
              </button>
            )
          })}
        </div>
      )}

      {(pSearch || pTypeFilter) && (
        <p className="text-xs text-muted-foreground">
          {fullyFiltered.length} résultat{fullyFiltered.length > 1 ? 's' : ''} sur {posts.length}
        </p>
      )}

      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div> : (
        <div className="space-y-3">
          {fullyFiltered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune publication ne correspond</p>
            </div>
          ) : fullyFiltered.map(p => {
            const parts  = p.tag_color?.startsWith('bg:') ? p.tag_color.split(';') : []
            const tagBg  = parts[0]?.replace('bg:', '') || '#f3f4f6'
            const tagCol = parts[1]?.replace('text:', '') || '#374151'
            return (
              <div key={p.id} className="bg-card border rounded-2xl shadow-sm p-3 sm:p-4 flex items-start gap-3">
                {p.images_urls?.[0] && (
                  <img src={p.images_urls[0]} alt="" className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {p.tag && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: tagBg, color: tagCol }}>
                        {p.tag}
                      </span>
                    )}
                    {!p.published && <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded-full">Brouillon</span>}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(p.custom_date || p.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {p.title && <p className="font-semibold text-sm">{p.title}</p>}
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">Par {p.author}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => onEdit(p)} className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"><Pencil size={14} /></button>
                  {deleteConfirm === `post-${p.id}` ? (
                    <div className="flex gap-1">
                      <button onClick={async () => { await onDelete(p.id); setDeleteConfirm(null); toast.success("Supprimé") }} className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg">Oui</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs border px-2 py-1 rounded-lg">Non</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(`post-${p.id}`)} className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── TOURNAMENTS PANEL ────────────────────────────────────────────
interface TournamentsPanelProps {
  allTournaments: Tournament[]
  loading: boolean
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  deleteConfirm: string | null
  setDeleteConfirm: (id: string | null) => void
  onEdit: (t: Tournament) => void
  onDelete: (id: string) => Promise<void>
  onNew: () => void
  onToggleRegistrations: (t: Tournament) => Promise<void>
}

const TournamentsPanel = ({ allTournaments, loading, expandedId, setExpandedId, deleteConfirm, setDeleteConfirm, onEdit, onDelete, onNew, onToggleRegistrations }: TournamentsPanelProps) => {
  const [subTab, setSubTab] = useState<'active' | 'past'>('active')
  const [search, setSearch] = useState('')

  const activeT   = allTournaments.filter(t => !t.is_past)
  const finishedT = allTournaments.filter(t => t.is_past)

  const filterList = (list: Tournament[]) => search.trim() === '' ? list : list.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.location?.toLowerCase().includes(search.toLowerCase()) ||
    t.type?.toLowerCase().includes(search.toLowerCase()) ||
    t.date?.toLowerCase().includes(search.toLowerCase())
  )

  const displayList = filterList(subTab === 'active' ? activeT : finishedT)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold shrink-0">Tournois</h2>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Rechercher…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-sm border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={13} /></button>}
        </div>
        <button onClick={onNew}
          className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-xl shadow shrink-0"
          style={{ background: "hsl(var(--chess-blue))" }}>
          <Plus size={15} /> <span className="hidden sm:inline">Nouveau</span>
        </button>
      </div>

      {/* Sous-onglets */}
      <div className="flex overflow-x-auto gap-2 border-b pb-3 scrollbar-none">
        {([
          { id: 'active' as const, label: 'Bientôt & en cours', count: activeT.length },
          { id: 'past'   as const, label: 'Finis',              count: finishedT.length },
        ]).map(st => (
          <button key={st.id} onClick={() => { setSubTab(st.id); setSearch('') }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${subTab === st.id ? 'text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
            style={subTab === st.id ? { background: "hsl(var(--chess-blue))" } : {}}>
            {st.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${subTab === st.id ? 'bg-white/20 text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
              {st.count}
            </span>
          </button>
        ))}
      </div>

      {search && <p className="text-xs text-muted-foreground">{displayList.length} résultat{displayList.length > 1 ? 's' : ''}</p>}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={28} /></div>
      ) : displayList.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy size={24} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">
            {search ? "Aucun tournoi ne correspond" : subTab === 'active' ? "Aucun tournoi à venir" : "Aucun tournoi fini"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map(t => (
            <div key={t.id} className="bg-card border rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-start gap-3 p-4">
                {t.fiches_techniques_urls?.[0] ? (
                  <div className="relative shrink-0">
                    <img src={t.fiches_techniques_urls[0]} alt="" className="w-14 h-14 object-cover rounded-xl border" />
                    {t.fiches_techniques_urls.length > 1 && (
                      <span className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        +{t.fiches_techniques_urls.length - 1}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-muted rounded-xl border flex items-center justify-center shrink-0">
                    <Trophy size={20} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs mb-1">
                    <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">{t.type}</span>
                    {t.homologue && <span className="text-green-600 font-medium">✓ Homologué</span>}
                    {t.registrations_closed && !t.is_past && (
                      <span className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                        <Lock size={10} /> Inscriptions clôturées
                      </span>
                    )}
                    {(() => {
                      const s = getTournamentStatus(t)
                      const { label, cls } = STATUS_LABELS[s]
                      return <span className={`px-2 py-0.5 rounded-full font-semibold ${cls}`}>{label}</span>
                    })()}
                  </div>
                  <p className="font-semibold text-sm truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.date}{t.location ? ` · ${t.location}` : ''}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                  <button onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    {expandedId === t.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  {/* Bouton clôture/réouverture inscriptions (uniquement tournois non finis) */}
                  {!t.is_past && (
                    <button
                      onClick={() => onToggleRegistrations(t)}
                      title={t.registrations_closed ? "Rouvrir les inscriptions" : "Clôturer les inscriptions"}
                      className={`p-2 rounded-lg transition-colors ${t.registrations_closed
                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                        : 'hover:bg-amber-50 hover:text-amber-600 text-muted-foreground'}`}>
                      {t.registrations_closed ? <Lock size={15} /> : <Unlock size={15} />}
                    </button>
                  )}
                  <button onClick={() => onEdit(t)} className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"><Pencil size={15} /></button>
                  {deleteConfirm === t.id ? (
                    <div className="flex gap-1">
                      <button onClick={async () => { await onDelete(t.id); setDeleteConfirm(null); toast.success("Supprimé") }} className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg">Confirmer</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-xs border px-2 py-1 rounded-lg">Non</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirm(t.id)} className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors"><Trash2 size={15} /></button>
                  )}
                </div>
              </div>
              {expandedId === t.id && (
                <div className="border-t px-4 py-3 bg-muted/20 text-xs space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[["Cadence", t.cadence], ["Rondes", t.rounds], ["Niveaux", t.niveaux]].map(([l, v]) => (
                      <div key={l as string}><span className="text-muted-foreground">{l} : </span><span className="font-medium">{v || "—"}</span></div>
                    ))}
                  </div>
                  {subTab === 'past' && (() => {
                    const extras = (t as unknown as Record<string,unknown>).extra_places as {rank:number;name:string;category:string}[] | undefined
                    if (!extras || extras.length === 0) return null
                    const CAT_ICONS: Record<string,string> = {
                      '1er':'🥇','2eme':'🥈','3eme':'🥉','4eme':'4️⃣','5eme':'5️⃣',
                      'feminin':'♀️','u8':'U8','u10':'U10','u12':'U12','u14':'U14',
                      'u16':'U16','u18':'U18','u20':'U20','veterans':'🏛️'
                    }
                    const CAT_LABELS: Record<string,string> = {
                      '1er':'1er','2eme':'2ème','3eme':'3ème','4eme':'4ème','5eme':'5ème',
                      'feminin':'Féminin','u8':'U8','u10':'U10','u12':'U12','u14':'U14',
                      'u16':'U16','u18':'U18','u20':'U20','veterans':'Vétérans'
                    }
                    return (
                      <div className="flex gap-2 flex-wrap pt-1">
                        {extras.filter(p => p.name).sort((a, b) => a.rank - b.rank).map((p, i) => (
                          <span key={i} className="bg-card border px-2 py-1 rounded-lg text-xs">
                            {CAT_ICONS[p.category] || '🏅'} {CAT_LABELS[p.category] || p.category} — {p.name}
                          </span>
                        ))}
                      </div>
                    )
                  })()}
                  {t.fiches_techniques_urls?.length > 0 && (
                    <div className="flex gap-2 pt-2 overflow-x-auto">
                      {t.fiches_techniques_urls.map((url, i) => (
                        <img key={i} src={url} alt="" className="h-20 w-auto object-cover rounded-lg border shrink-0" />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── REGISTRATIONS PANEL ──────────────────────────────────────────
interface RegPanelProps {
  allTournaments: Tournament[]
  allRegistrations: Registration[]
  loading: boolean
  deleteConfirm: string | null
  setDeleteConfirm: (id: string | null) => void
  onDelete: (id: string) => Promise<void>
}

// Surligne les occurrences du terme de recherche dans un texte
const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query.trim() || !text) return <>{text}</>
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5 font-semibold not-italic">{part}</mark>
          : part
      )}
    </>
  )
}

const RegistrationsPanel = ({ allTournaments, allRegistrations, loading, deleteConfirm, setDeleteConfirm, onDelete }: RegPanelProps) => {
  const [subTab, setSubTab] = useState<'active' | 'history'>('active')
  const [regSearch, setRegSearch] = useState('')

  const activeTournaments   = allTournaments.filter(t => !t.is_past)
  const finishedTournaments = allTournaments.filter(t => t.is_past)

  const q = regSearch.trim().toLowerCase()

  // Filtrer les tournois + leurs inscriptions selon la recherche
  const filterTournaments = (tournaments: typeof allTournaments) => {
    if (!q) return tournaments
    return tournaments.filter(t => {
      if (t.title.toLowerCase().includes(q) || t.date?.toLowerCase().includes(q)) return true
      const regs = allRegistrations.filter(r => r.tournament_id === t.id)
      return regs.some(r =>
        r.nom?.toLowerCase().includes(q) ||
        r.prenom?.toLowerCase().includes(q) ||
        r.nom_club?.toLowerCase().includes(q) ||
        r.responsable?.toLowerCase().includes(q) ||
        (r.joueurs as {nom:string;prenom:string}[] | null)?.some(j =>
          j.nom?.toLowerCase().includes(q) || j.prenom?.toLowerCase().includes(q)
        )
      )
    })
  }

  const displayTournaments = filterTournaments(subTab === 'active' ? activeTournaments : finishedTournaments)

  // Compte total de résultats trouvés pour afficher le badge
  const totalMatches = q ? allRegistrations.filter(r =>
    r.nom?.toLowerCase().includes(q) ||
    r.prenom?.toLowerCase().includes(q) ||
    r.nom_club?.toLowerCase().includes(q) ||
    r.responsable?.toLowerCase().includes(q) ||
    (r.joueurs as {nom:string;prenom:string}[] | null)?.some(j =>
      j.nom?.toLowerCase().includes(q) || j.prenom?.toLowerCase().includes(q)
    )
  ).length : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold shrink-0">Inscriptions</h2>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Joueur, club, tournoi…" value={regSearch}
            onChange={e => setRegSearch(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-sm border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
          {regSearch && <button onClick={() => setRegSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={13} /></button>}
        </div>
        {q ? (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "hsl(var(--chess-gold)/0.15)", color: "hsl(var(--chess-gold-dark))" }}>
            {totalMatches} correspondance{totalMatches > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground shrink-0">{allRegistrations.length} inscription{allRegistrations.length > 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Sous-nav */}
      <div className="flex overflow-x-auto gap-2 border-b pb-3 scrollbar-none">
        {[
          { id: 'active' as const, label: 'Bientôt & en cours', count: activeTournaments.length },
          { id: 'history' as const, label: 'Historique (finis)', count: finishedTournaments.length },
        ].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap shrink-0 ${subTab === t.id ? 'text-white shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}
            style={subTab === t.id ? { background: "hsl(var(--chess-blue))" } : {}}>
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${subTab === t.id ? 'bg-white/20 text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-primary" /></div>
      ) : displayTournaments.length === 0 ? (
        <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground">
          <Trophy size={28} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{q ? `Aucun résultat pour "${regSearch}"` : "Aucun tournoi dans cette catégorie"}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayTournaments.map(tournament => {
            const regs = allRegistrations.filter(r => r.tournament_id === tournament.id)
            const soloRegs = regs.filter(r => r.type === 'solo')
            const clubRegs = regs.filter(r => r.type === 'club')

            // Vérifie si ce tournoi a des matches directs (vs match via inscription)
            const tournamentNameMatches = q && (tournament.title.toLowerCase().includes(q) || tournament.date?.toLowerCase().includes(q))

            return (
              <div key={tournament.id} className="bg-card border rounded-2xl shadow-sm overflow-hidden">
                {/* Header tournoi */}
                <div className="px-5 py-4 border-b flex items-center justify-between"
                  style={{ background: tournamentNameMatches ? "hsl(var(--chess-gold)/0.08)" : "hsl(var(--chess-blue)/0.04)" }}>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-bold text-sm">
                        <Highlight text={tournament.title} query={regSearch} />
                      </h3>
                      {tournament.homologue && (
                        <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">✓ Homologué</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar size={11} /> {tournament.date}
                      {tournament.location && <><span>·</span><span>{tournament.location}</span></>}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-xl sm:text-2xl font-bold" style={{ color: "hsl(var(--chess-blue))" }}>{regs.length}</p>
                    <p className="text-xs text-muted-foreground">inscription{regs.length > 1 ? 's' : ''}</p>
                  </div>
                </div>

                {regs.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">Aucune inscription pour ce tournoi</p>
                ) : (
                  <div className="p-4 space-y-5">

                    {/* ── Individuels ── */}
                    {soloRegs.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <UserCheck size={14} style={{ color: "hsl(var(--chess-blue))" }} />
                          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "hsl(var(--chess-blue))" }}>
                            Inscriptions individuelles — {soloRegs.length} joueur{soloRegs.length > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="border rounded-xl overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b" style={{ background: "hsl(var(--chess-blue)/0.04)" }}>
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Joueur</th>
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden sm:table-cell">FIDE ID</th>
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Club</th>
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Naissance</th>
                                <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Inscrit le</th>
                                <th className="px-4 py-2.5 w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {soloRegs.map((r, i) => {
                                const rowMatches = q && (
                                  r.nom?.toLowerCase().includes(q) ||
                                  r.prenom?.toLowerCase().includes(q) ||
                                  r.club?.toLowerCase().includes(q)
                                )
                                return (
                                  <tr key={r.id} className={`border-b last:border-0 transition-colors ${rowMatches ? 'bg-yellow-50' : i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                                    <td className="px-4 py-3 font-medium">
                                      <Highlight text={`${r.prenom || ''} ${r.nom || ''}`.trim()} query={regSearch} />
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell text-xs">{r.fide_id || '—'}</td>
                                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">
                                      <Highlight text={r.club || '—'} query={regSearch} />
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">
                                      {(r as any).date_naissance ? new Date((r as any).date_naissance).toLocaleDateString('fr-FR') : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                      {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    </td>
                                    <td className="px-4 py-3">
                                      {deleteConfirm === r.id ? (
                                        <div className="flex gap-1">
                                          <button onClick={async () => { await onDelete(r.id); setDeleteConfirm(null); toast.success("Supprimé") }}
                                            className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg">Oui</button>
                                          <button onClick={() => setDeleteConfirm(null)} className="text-[10px] border px-2 py-1 rounded-lg">Non</button>
                                        </div>
                                      ) : (
                                        <button onClick={() => setDeleteConfirm(r.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded">
                                          <Trash2 size={13} />
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ── Clubs ── */}
                    {clubRegs.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2.5">
                          <Building2 size={14} style={{ color: "hsl(var(--chess-gold-dark))" }} />
                          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "hsl(var(--chess-gold-dark))" }}>
                            Inscriptions clubs — {clubRegs.length} club{clubRegs.length > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="space-y-3">
                          {clubRegs.map(r => {
                            const joueurs = (r.joueurs as { nom: string; prenom: string; fideId: string }[]) || []
                            const clubMatches = q && (
                              r.nom_club?.toLowerCase().includes(q) ||
                              r.responsable?.toLowerCase().includes(q)
                            )
                            return (
                              <div key={r.id} className={`border rounded-xl overflow-hidden transition-all ${clubMatches ? 'ring-2 ring-yellow-300' : ''}`}>
                                <div className="flex items-center justify-between px-4 py-3 border-b"
                                  style={{ background: clubMatches ? "hsl(50 100% 93%)" : "hsl(var(--chess-gold)/0.06)" }}>
                                  <div>
                                    <p className="font-bold text-sm flex items-center gap-2">
                                      <Building2 size={13} style={{ color: "hsl(var(--chess-gold-dark))" }} />
                                      <Highlight text={r.nom_club || ''} query={regSearch} />
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      Responsable : <span className="font-medium"><Highlight text={r.responsable || ''} query={regSearch} /></span>
                                      {r.telephone && <span className="ml-2 text-muted-foreground">· {r.telephone}</span>}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3 ml-3 shrink-0">
                                    <div className="text-right">
                                      <p className="text-xl font-bold" style={{ color: "hsl(var(--chess-gold-dark))" }}>{joueurs.length}</p>
                                      <p className="text-[10px] text-muted-foreground">joueur{joueurs.length > 1 ? 's' : ''}</p>
                                    </div>
                                    {deleteConfirm === r.id ? (
                                      <div className="flex gap-1">
                                        <button onClick={async () => { await onDelete(r.id); setDeleteConfirm(null); toast.success("Supprimé") }}
                                          className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-lg">Oui</button>
                                        <button onClick={() => setDeleteConfirm(null)} className="text-[10px] border px-2 py-1 rounded-lg">Non</button>
                                      </div>
                                    ) : (
                                      <button onClick={() => setDeleteConfirm(r.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50">
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {joueurs.length > 0 && (
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b bg-muted/20">
                                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground w-8">#</th>
                                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground">Joueur</th>
                                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground hidden sm:table-cell">FIDE ID</th>
                                        <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground hidden md:table-cell">Naissance</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {joueurs.map((j, idx) => {
                                        const joueurMatches = q && (
                                          j.nom?.toLowerCase().includes(q) ||
                                          j.prenom?.toLowerCase().includes(q)
                                        )
                                        return (
                                          <tr key={idx} className={`border-b last:border-0 transition-colors ${joueurMatches ? 'bg-yellow-50' : idx % 2 === 1 ? 'bg-muted/10' : ''}`}>
                                            <td className="px-4 py-2.5 text-xs text-muted-foreground font-bold">{idx + 1}</td>
                                            <td className="px-4 py-2.5 font-medium">
                                              <Highlight text={`${j.prenom || ''} ${j.nom || ''}`.trim()} query={regSearch} />
                                            </td>
                                            <td className="px-4 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">{j.fideId || '—'}</td>
                                            <td className="px-4 py-2.5 text-xs text-muted-foreground hidden md:table-cell">{(j as any).dateNaissance ? new Date((j as any).dateNaissance).toLocaleDateString('fr-FR') : '—'}</td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                )}
                                <div className="px-4 py-2 bg-muted/10 text-right border-t">
                                  <span className="text-[10px] text-muted-foreground">
                                    Inscrit le {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── MAIN ADMIN ────────────────────────────────────────────────────
type Tab = 'dashboard' | 'tournaments' | 'registrations' | 'players' | 'posts' | 'gallery' | 'config'

const Admin = () => {
  const { user, loading: authLoading, signIn, signOut, isLockedOut, lockoutMinutes } = useAuth()
  const { connectionStatus, refetch: refetchConfig } = useSiteConfig()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [editTournament, setEditTournament] = useState<Tournament | null | 'new'>(null)
  const [editPost, setEditPost] = useState<Post | null | 'new'>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: allTournaments, loading: tLoading, create: createT, update: updateT, remove: removeT } = useTournaments()
  const { data: posts, loading: pLoading, create: createPost, update: updatePost, remove: removePost } = usePosts()
  const { data: allRegistrations, loading: rLoading, remove: removeReg } = useRegistrations()
  const { data: allPlayers, loading: playersLoading, create: createPlayer, update: updatePlayer, remove: removePlayer } = usePlayers()
  const [editPlayer, setEditPlayer] = useState<Player | null | 'new'>(null)
  const [playerFormMode, setPlayerFormMode] = useState<'athlete' | 'member'>('athlete')

  const [tSearch, setTSearch] = useState('')
  const [pSearch, setPSearch] = useState('')

  const { get } = useSiteConfig()
  const clubName = String(get('club_name', ''))

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  )

  if (!user) return <LoginScreen onLogin={signIn} clubName={clubName} isLockedOut={isLockedOut} lockoutMinutes={lockoutMinutes} />

  const upcoming = allTournaments.filter(t => !t.is_past)
  const past = allTournaments.filter(t => t.is_past)

  const filteredTournaments = tSearch.trim() === '' ? allTournaments : allTournaments.filter(t =>
    t.title.toLowerCase().includes(tSearch.toLowerCase()) ||
    t.location?.toLowerCase().includes(tSearch.toLowerCase()) ||
    t.type?.toLowerCase().includes(tSearch.toLowerCase()) ||
    t.date?.toLowerCase().includes(tSearch.toLowerCase())
  )

  const filteredPosts = pSearch.trim() === '' ? posts : posts.filter(p =>
    p.title?.toLowerCase().includes(pSearch.toLowerCase()) ||
    p.content?.toLowerCase().includes(pSearch.toLowerCase()) ||
    p.author?.toLowerCase().includes(pSearch.toLowerCase()) ||
    p.tag?.toLowerCase().includes(pSearch.toLowerCase())
  )

  const handleSaveTournament = async (data: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) => {
    if (editTournament && editTournament !== 'new') await updateT(editTournament.id, data)
    else await createT(data)
  }

  const handleToggleRegistrations = async (t: Tournament) => {
    const newValue = !t.registrations_closed
    await updateT(t.id, { registrations_closed: newValue })
    toast.success(newValue ? "Inscriptions clôturées 🔒" : "Inscriptions rouvertes ✅")
  }

  const handleSavePost = async (data: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    if (editPost && editPost !== 'new') await updatePost(editPost.id, data)
    else await createPost(data)
  }

  const TABS: { id: Tab; label: string; icon: typeof Trophy }[] = [
    { id: 'dashboard',     label: 'Tableau de bord',  icon: LayoutDashboard },
    { id: 'tournaments',   label: 'Tournois',          icon: Trophy },
    { id: 'registrations', label: 'Inscriptions',      icon: ClipboardList },
    { id: 'players',       label: 'Adhérents',         icon: UserCheck },
    { id: 'posts',         label: 'Publications',      icon: Megaphone },
    { id: 'gallery',       label: 'Galerie',           icon: Image },
    { id: 'config',        label: 'Contenu du site',   icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <ConnectionBanner status={connectionStatus} onRetry={refetchConfig} />
      {editTournament !== null && (
        <TournamentForm
          initial={editTournament === 'new' ? null : editTournament}
          onSave={handleSaveTournament}
          onClose={() => setEditTournament(null)}
        />
      )}
      {editPost !== null && (
        <PostForm
          initial={editPost === 'new' ? null : editPost}
          onSave={handleSavePost}
          onClose={() => setEditPost(null)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 shadow-lg"
        style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow border border-white/20">
              <img src={logoClub} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-bold text-white">{clubName}</span>
              <span className="text-white/40 text-xs ml-2 hidden sm:inline">— Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors">
              <Eye size={13} /> Voir le site
            </Link>
            {/* Indicateur statut connexion */}
            <div className={`w-2 h-2 rounded-full hidden sm:block ${connectionStatus === 'connected' ? 'bg-green-400' : connectionStatus === 'offline' ? 'bg-amber-400' : 'bg-red-400'}`}
              title={connectionStatus === 'connected' ? 'Connecté' : connectionStatus === 'offline' ? 'Hors-ligne (cache)' : 'Erreur de connexion'} />
            <button onClick={signOut} className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors">
              <LogOut size={13} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 max-w-6xl mx-auto w-full min-h-0">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex flex-col w-52 p-4 shrink-0 border-r bg-card/50">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all mb-1 ${tab === t.id ? 'text-white shadow-sm' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'}`}
              style={tab === t.id ? { background: "hsl(var(--chess-blue))" } : {}}>
              <t.icon size={15} />
              {t.label}
              {t.id === 'registrations' && allRegistrations.length > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full">{allRegistrations.length}</span>
              )}
            </button>
          ))}
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden flex overflow-x-auto gap-1 p-2 border-b bg-card w-full shrink-0 sticky top-16 z-30 scrollbar-none">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${tab === t.id ? 'text-white' : 'text-muted-foreground hover:bg-muted'}`}
              style={tab === t.id ? { background: "hsl(var(--chess-blue))" } : {}}>
              <t.icon size={13} />
              {t.label}
            </button>
          ))}
        </div>

        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto min-w-0">

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Tableau de bord</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: "Tournois à venir", value: upcoming.length, color: "hsl(var(--chess-blue))" },
                  { label: "Tournois finis", value: past.length, color: "hsl(var(--chess-silver))" },
                  { label: "Inscriptions reçues", value: allRegistrations.length, color: "hsl(var(--chess-gold))" },
                  { label: "Membres inscrits", value: allPlayers.length, color: "hsl(var(--chess-blue))" },
                ].map(s => (
                  <div key={s.label} className="bg-card border rounded-2xl p-4 sm:p-5 shadow-sm">
                    <p className="text-2xl sm:text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-card border rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-sm mb-3">Actions rapides</h3>
                  <div className="space-y-2">
                    <button onClick={() => { setTab('tournaments'); setEditTournament('new') }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors">
                      <Plus size={14} className="text-primary" /> Nouveau tournoi
                    </button>
                    <button onClick={() => { setTab('posts'); setEditPost('new') }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors">
                      <Plus size={14} className="text-primary" /> Nouvelle publication
                    </button>
                    <button onClick={() => setTab('registrations')}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors">
                      <ClipboardList size={14} className="text-primary" /> Voir les inscriptions
                    </button>
                    <button onClick={() => setTab('config')}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors">
                      <Settings size={14} className="text-primary" /> Modifier le contenu du site
                    </button>
                  </div>
                </div>
                <div className="bg-card border rounded-2xl p-5 shadow-sm">
                  <h3 className="font-semibold text-sm mb-3">Prochains tournois</h3>
                  {upcoming.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Aucun tournoi à venir</p>
                  ) : upcoming.slice(0, 4).map(t => {
                    const regCount = allRegistrations.filter(r => r.tournament_id === t.id).length
                    return (
                      <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate font-medium">{t.title}</span>
                          {t.registrations_closed && <Lock size={11} className="text-red-400 shrink-0" />}
                        </div>
                        <span className="text-muted-foreground text-xs ml-2 shrink-0">{regCount} inscrit{regCount > 1 ? 's' : ''}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Analytics audience */}
              <AnalyticsWidget />
            </div>
          )}

          {/* ── INSCRIPTIONS ── */}
          {tab === 'registrations' && (
            <RegistrationsPanel
              allTournaments={allTournaments}
              allRegistrations={allRegistrations}
              loading={rLoading}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              onDelete={removeReg}
            />
          )}

          {/* ── TOURNAMENTS ── */}
          {tab === 'tournaments' && (
            <TournamentsPanel
              allTournaments={allTournaments}
              loading={tLoading}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              onEdit={setEditTournament}
              onDelete={removeT}
              onNew={() => setEditTournament('new')}
              onToggleRegistrations={handleToggleRegistrations}
            />
          )}

          {/* ── POSTS ── */}
          {tab === 'posts' && (
            <PostsPanel
              posts={posts}
              filteredPosts={filteredPosts}
              loading={pLoading}
              pSearch={pSearch}
              setPSearch={setPSearch}
              deleteConfirm={deleteConfirm}
              setDeleteConfirm={setDeleteConfirm}
              onEdit={setEditPost}
              onDelete={removePost}
              onNew={() => setEditPost('new')}
            />
          )}

          {/* ── GALLERY ── */}
          {tab === 'gallery' && <GalleryPanel />}

          {/* ── CONFIG ── */}
          {tab === 'config' && <ConfigPanel />}

          {/* ── PLAYERS ── */}
          {tab === 'players' && (
            <PlayersPanel
              players={allPlayers}
              loading={playersLoading}
              onEdit={setEditPlayer}
              onDelete={removePlayer}
              onNew={(mode) => { setPlayerFormMode(mode); setEditPlayer('new') }}
            />
          )}

        </main>
      </div>

      {editPlayer !== null && (
        <PlayerForm
          initial={editPlayer === 'new' ? null : editPlayer}
          mode={playerFormMode}
          onSave={async (data) => {
            if (editPlayer && editPlayer !== 'new') await updatePlayer(editPlayer.id, data)
            else await createPlayer(data)
          }}
          onClose={() => setEditPlayer(null)}
        />
      )}
    </div>
  )
}

export default Admin
