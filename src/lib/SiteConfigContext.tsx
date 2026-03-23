import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

type Config = Record<string, unknown>

// ── Clé localStorage pour le cache ──────────────────────────────
const CACHE_KEY = 'site_config_cache'
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

function readCache(): Config | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null }
    return data
  } catch { return null }
}

function writeCache(data: Config) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

export type ConnectionStatus = 'connected' | 'offline' | 'loading' | 'error'

interface SiteConfigCtx {
  config: Config
  loading: boolean
  connectionStatus: ConnectionStatus
  get: (key: string, fallback?: unknown) => unknown
  update: (key: string, value: unknown) => Promise<void>
  refetch: () => Promise<void>
}

const SiteConfigContext = createContext<SiteConfigCtx>({
  config: {}, loading: true, connectionStatus: 'loading',
  get: (_k, fb = '') => fb,
  update: async () => {},
  refetch: async () => {},
})

export const SiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<Config>(() => readCache() ?? {})
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('loading')
  const [retryCount, setRetryCount] = useState(0)

  const refetch = useCallback(async () => {
    setConnectionStatus('loading')
    try {
      const { data, error } = await supabase.from('site_config').select('key, value')
      if (error) throw error
      if (data) {
        const map: Config = {}
        data.forEach(({ key, value }) => { map[key] = value })
        setConfig(map)
        writeCache(map)
        setConnectionStatus('connected')
        setRetryCount(0)
      }
    } catch {
      // Utiliser le cache si disponible
      const cached = readCache()
      if (cached) {
        setConfig(cached)
        setConnectionStatus('offline')
      } else {
        setConnectionStatus('error')
      }
      // Retry automatique (max 3 fois, délai exponentiel)
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 2000
        setTimeout(() => {
          setRetryCount(r => r + 1)
          refetch()
        }, delay)
      }
    } finally {
      setLoading(false)
    }
  }, [retryCount])

  useEffect(() => { refetch() }, [])

  // Recharger quand la connexion revient
  useEffect(() => {
    const handleOnline = () => { setConnectionStatus('loading'); refetch() }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [refetch])

  const update = async (key: string, value: unknown) => {
    // Optimistic update immédiat
    setConfig(prev => {
      const next = { ...prev, [key]: value }
      writeCache(next)
      return next
    })
    try {
      const { error } = await supabase.from('site_config').upsert({ key, value, updated_at: new Date().toISOString() })
      if (error) {
        // Rollback si erreur
        const cached = readCache()
        if (cached) setConfig(cached)
        throw error
      }
      setConnectionStatus('connected')
    } catch (e) {
      setConnectionStatus('error')
      throw e
    }
  }

  const get = (key: string, fallback: unknown = '') => config[key] ?? fallback

  return (
    <SiteConfigContext.Provider value={{ config, loading, connectionStatus, get, update, refetch }}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export const useSiteConfig = () => useContext(SiteConfigContext)
