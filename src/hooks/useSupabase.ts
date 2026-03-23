import { useEffect, useState, useCallback } from 'react'
import { supabase, Tournament, Post, GalleryPhoto } from '@/lib/supabase'

// useSiteConfig est maintenant dans le contexte global — réexport pour compatibilité
export { useSiteConfig } from '@/lib/SiteConfigContext'

// ── Tournaments ──────────────────────────────────────────────────
// Un seul hook qui charge TOUS les tournois.
// Le filtrage is_past/upcoming se fait côté client pour éviter les bugs
// quand on change is_past sur un tournoi existant.
export function useTournaments() {
  const [data, setData] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: rows, error: err } = await supabase
      .from('tournaments')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setData(rows || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (t: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: row, error: err } = await supabase.from('tournaments').insert(t).select().single()
    if (err) throw err
    setData(prev => [row, ...prev])
    return row
  }

  const update = async (id: string, t: Partial<Tournament>) => {
    const { data: row, error: err } = await supabase.from('tournaments').update(t).eq('id', id).select().single()
    if (err) throw err
    // Met à jour dans la liste locale, quel que soit le changement de is_past
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

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: rows } = await supabase
      .from('posts')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
    setData(rows || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (p: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
    const { data: row, error } = await supabase.from('posts').insert(p).select().single()
    if (error) throw error
    setData(prev => [row, ...prev])
    return row
  }

  const update = async (id: string, p: Partial<Post>) => {
    const { data: row, error } = await supabase.from('posts').update(p).eq('id', id).select().single()
    if (error) throw error
    setData(prev => prev.map(x => x.id === id ? row : x))
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

  return { data, loading, create, update, remove, incrementLike, refetch: fetch }
}

// ── Gallery ──────────────────────────────────────────────────────
export function useGallery() {
  const [data, setData] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data: rows } = await supabase
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
    setData(rows || [])
    setLoading(false)
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
export function useAuth() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { email: session.user.email! } : null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email! } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signIn, signOut }
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
    let q = supabase.from('registrations').select('*').order('created_at', { ascending: false })
    if (tournamentId) q = q.eq('tournament_id', tournamentId)
    const { data: rows } = await q
    setData(rows || [])
    setLoading(false)
  }, [tournamentId])

  useEffect(() => { fetch() }, [fetch])

  const remove = async (id: string) => {
    await supabase.from('registrations').delete().eq('id', id)
    setData(prev => prev.filter(x => x.id !== id))
  }

  return { data, loading, remove, refetch: fetch }
}
