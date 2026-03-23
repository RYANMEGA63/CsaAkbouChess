import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase, Tournament, Post, GalleryPhoto } from '@/lib/supabase'

// useSiteConfig est dans le contexte global — réexport pour compatibilité
export { useSiteConfig } from '@/lib/SiteConfigContext'

// ── Helper : retry avec backoff ──────────────────────────────────
async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try { return await fn() }
    catch (e) {
      if (i === retries) throw e
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000))
    }
  }
  throw new Error('Max retries exceeded')
}

// ── Tournaments ──────────────────────────────────────────────────
export function useTournaments() {
  const [data, setData] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: rows, error: err } = await withRetry(() =>
        supabase.from('tournaments').select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false })
      )
      if (err) throw err
      setData(rows || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  // Colonnes connues de la table tournaments dans Supabase.
  // Tout champ absent de cette liste est ignoré avant INSERT/UPDATE
  // pour éviter les erreurs "column does not exist" lors des migrations progressives.
  const safeTournamentPayload = (t: Partial<Tournament>) => {
    const KNOWN_COLS = [
      'title','date','date_iso','cadence','type','rounds','location',
      'spots','total','description','price','arbitre','homologue','niveaux','contact',
      'fiches_techniques_urls','photos_urls','is_past','winner','participants',
      'winner_medal','winner_note','podium_1','podium_2','podium_3',
      'display_order','registrations_closed',
    ]
    return Object.fromEntries(
      Object.entries(t).filter(([k]) => KNOWN_COLS.includes(k))
    )
  }

  const create = async (t: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) => {
    const payload = safeTournamentPayload(t)
    const { data: row, error: err } = await supabase.from('tournaments').insert(payload).select().single()
    if (err) throw err
    setData(prev => [row, ...prev])
    return row
  }

  const update = async (id: string, t: Partial<Tournament>) => {
    const payload = safeTournamentPayload(t)
    const { data: row, error: err } = await supabase.from('tournaments').update(payload).eq('id', id).select().single()
    if (err) throw err
    setData(prev => prev.map(x => x.id === id ? row : x))
    return row
  }

  const remove = async (id: string) => {
    const { error: err } = await supabase.from('tournaments').delete().eq('id', id)
    if (err) throw err
    setData(prev => prev.filter(x => x.id !== id))
  }

  return { data, loading, error, create, update, remove, refetch: fetch }
}

// ── Posts (réalisations) ─────────────────────────────────────────
export function usePosts() {
  const [data, setData] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: rows, error: err } = await withRetry(() =>
        supabase.from('posts').select('*')
      )
      if (err) throw err
      // Trier par date effective : custom_date si renseignée, sinon created_at
      // Du plus récent (haut) au plus ancien (bas)
      const sorted = (rows || []).sort((a, b) => {
        const da = new Date(a.custom_date || a.created_at).getTime()
        const db = new Date(b.custom_date || b.created_at).getTime()
        return db - da
      })
      setData(sorted)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const sortByDate = (arr: Post[]) =>
    [...arr].sort((a, b) =>
      new Date(b.custom_date || b.created_at).getTime() -
      new Date(a.custom_date || a.created_at).getTime()
    )

  const create = async (p: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: row, error } = await supabase.from('posts').insert(p).select().single()
    if (error) throw error
    setData(prev => sortByDate([row, ...prev]))
    return row
  }

  const update = async (id: string, p: Partial<Post>) => {
    const { data: row, error } = await supabase.from('posts').update(p).eq('id', id).select().single()
    if (error) throw error
    setData(prev => sortByDate(prev.map(x => x.id === id ? row : x)))
    return row
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) throw error
    setData(prev => prev.filter(x => x.id !== id))
  }

  const incrementLike = async (id: string, current: number) => {
    const newLikes = current + 1
    await supabase.from('posts').update({ likes: newLikes }).eq('id', id)
    setData(prev => prev.map(x => x.id === id ? { ...x, likes: newLikes } : x))
  }

  return { data, loading, error, create, update, remove, incrementLike, refetch: fetch }
}

// ── Gallery ──────────────────────────────────────────────────────
export function useGallery() {
  const [data, setData] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data: rows } = await withRetry(() =>
        supabase.from('gallery').select('*')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false })
      )
      setData(rows || [])
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (photo: Omit<GalleryPhoto, 'id' | 'created_at'>) => {
    const { data: row, error } = await supabase.from('gallery').insert(photo).select().single()
    if (error) throw error
    setData(prev => [...prev, row])
    return row
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from('gallery').delete().eq('id', id)
    if (error) throw error
    setData(prev => prev.filter(x => x.id !== id))
  }

  return { data, loading, create, remove, refetch: fetch }
}

// ── Auth (admin) ─────────────────────────────────────────────────
// Sécurité : rate limiting login côté client
const LOGIN_ATTEMPTS_KEY  = 'admin_login_attempts'
const LOGIN_LOCKOUT_KEY   = 'admin_login_lockout'
const SESSION_FP_KEY      = 'admin_session_fp'
const MAX_ATTEMPTS        = 5
const LOCKOUT_DURATION    = 15 * 60 * 1000 // 15 minutes
const SESSION_TIMEOUT_MS  = 2 * 60 * 60 * 1000 // 2h inactivité

// Génère une empreinte légère de la session (user-agent + heure de connexion)
function generateSessionFingerprint(): string {
  const ua  = navigator.userAgent.slice(0, 50)
  const ts  = String(Math.floor(Date.now() / (1000 * 60 * 60))) // granularité heure
  return btoa(`${ua}::${ts}`).slice(0, 32)
}

function validateSessionFingerprint(): boolean {
  try {
    const stored = localStorage.getItem(SESSION_FP_KEY)
    if (!stored) return true // première connexion
    return stored === generateSessionFingerprint()
  } catch { return true }
}

// Délai aléatoire pour neutraliser les timing attacks (empêche de deviner si email existe)
const randomDelay = () => new Promise(r => setTimeout(r, 500 + Math.random() * 500))

function getLoginAttempts(): number {
  try { return parseInt(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '0') } catch { return 0 }
}
function incrementLoginAttempts(): number {
  const n = getLoginAttempts() + 1
  try { localStorage.setItem(LOGIN_ATTEMPTS_KEY, String(n)) } catch {}
  return n
}
function resetLoginAttempts() {
  try {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
    localStorage.removeItem(LOGIN_LOCKOUT_KEY)
  } catch {}
}
function getLockoutEnd(): number {
  try { return parseInt(localStorage.getItem(LOGIN_LOCKOUT_KEY) || '0') } catch { return 0 }
}
function setLockout() {
  try { localStorage.setItem(LOGIN_LOCKOUT_KEY, String(Date.now() + LOCKOUT_DURATION)) } catch {}
}
function isLockedOut(): boolean {
  const end = getLockoutEnd()
  if (!end) return false
  if (Date.now() > end) { try { localStorage.removeItem(LOGIN_LOCKOUT_KEY) } catch {}; return false }
  return true
}
function lockoutRemainingMinutes(): number {
  return Math.ceil((getLockoutEnd() - Date.now()) / 60000)
}

export function useAuth() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const activityTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetActivityTimer = useCallback(() => {
    if (activityTimer.current) clearTimeout(activityTimer.current)
    activityTimer.current = setTimeout(async () => {
      await supabase.auth.signOut()
      setUser(null)
    }, SESSION_TIMEOUT_MS)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Vérifier l'empreinte de session
        if (!validateSessionFingerprint()) {
          supabase.auth.signOut()
          setUser(null)
        } else {
          setUser({ email: session.user.email! })
          resetActivityTimer()
        }
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email! } : null)
      if (session?.user) resetActivityTimer()
      else if (activityTimer.current) clearTimeout(activityTimer.current)
    })

    // Reset timer sur activité utilisateur
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const
    events.forEach(e => window.addEventListener(e, resetActivityTimer, { passive: true }))

    return () => {
      subscription.unsubscribe()
      if (activityTimer.current) clearTimeout(activityTimer.current)
      events.forEach(e => window.removeEventListener(e, resetActivityTimer))
    }
  }, [resetActivityTimer])

  const signIn = async (email: string, password: string) => {
    // 1. Délai anti-timing attack (toujours le même temps apparent)
    const startTime = Date.now()

    // 2. Vérifier le verrouillage
    if (isLockedOut()) {
      await randomDelay()
      throw new Error(`Accès verrouillé. Réessayez dans ${lockoutRemainingMinutes()} minute(s).`)
    }

    // 3. Validation basique format email
    if (!email.includes('@') || email.length < 5) {
      await randomDelay()
      throw new Error(`Identifiants invalides. ${MAX_ATTEMPTS - getLoginAttempts()} tentative(s) restante(s).`)
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      // 4. Délai minimal pour égaliser le timing (succès ou échec ≈ même durée)
      const elapsed = Date.now() - startTime
      if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed))

      if (error) {
        const attempts = incrementLoginAttempts()
        if (attempts >= MAX_ATTEMPTS) {
          setLockout()
          throw new Error(`Compte verrouillé 15 min après ${MAX_ATTEMPTS} tentatives échouées.`)
        }
        throw new Error(`Identifiants incorrects. ${MAX_ATTEMPTS - attempts} tentative(s) restante(s).`)
      }

      // 5. Succès : stocker empreinte + reset compteur
      try { localStorage.setItem(SESSION_FP_KEY, generateSessionFingerprint()) } catch {}
      resetLoginAttempts()
      resetActivityTimer()

    } catch (e) {
      // Garantir le délai même en cas d'exception réseau
      const elapsed = Date.now() - startTime
      if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed))
      throw e
    }
  }

  const signOut = async () => {
    if (activityTimer.current) clearTimeout(activityTimer.current)
    try { localStorage.removeItem(SESSION_FP_KEY) } catch {}
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signIn, signOut, isLockedOut: isLockedOut(), lockoutMinutes: lockoutRemainingMinutes() }
}

// ── Registrations ────────────────────────────────────────────────
export interface Registration {
  id: string
  tournament_id: string
  type: 'solo' | 'club'
  nom?: string
  prenom?: string
  fide_id?: string
  club?: string
  nom_club?: string
  responsable?: string
  telephone?: string
  joueurs?: { nom: string; prenom: string; fideId: string }[]
  created_at: string
}

export async function submitRegistration(data: Omit<Registration, 'id' | 'created_at'>) {
  const { error } = await supabase.from('registrations').insert(data)
  if (error) throw error
}

export function useRegistrations(tournamentId?: string) {
  const [data, setData] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      let q = supabase.from('registrations').select('*').order('created_at', { ascending: false })
      if (tournamentId) q = q.eq('tournament_id', tournamentId)
      const { data: rows } = await withRetry(() => q)
      setData(rows || [])
    } catch {} finally { setLoading(false) }
  }, [tournamentId])

  useEffect(() => { fetch() }, [fetch])

  const remove = async (id: string) => {
    await supabase.from('registrations').delete().eq('id', id)
    setData(prev => prev.filter(x => x.id !== id))
  }

  return { data, loading, remove, refetch: fetch }
}
