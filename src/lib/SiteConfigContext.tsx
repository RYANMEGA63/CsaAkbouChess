import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

type Config = Record<string, unknown>

interface SiteConfigCtx {
  config: Config
  loading: boolean
  get: (key: string, fallback?: unknown) => unknown
  update: (key: string, value: unknown) => Promise<void>
  refetch: () => Promise<void>
}

const SiteConfigContext = createContext<SiteConfigCtx>({
  config: {}, loading: true,
  get: (_k, fb = '') => fb,
  update: async () => {},
  refetch: async () => {},
})

export const SiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<Config>({})
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    const { data } = await supabase.from('site_config').select('key, value')
    if (data) {
      const map: Config = {}
      data.forEach(({ key, value }) => { map[key] = value })
      setConfig(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => { refetch() }, [refetch])

  const update = async (key: string, value: unknown) => {
    await supabase.from('site_config').upsert({ key, value, updated_at: new Date().toISOString() })
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const get = (key: string, fallback: unknown = '') => config[key] ?? fallback

  return (
    <SiteConfigContext.Provider value={{ config, loading, get, update, refetch }}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export const useSiteConfig = () => useContext(SiteConfigContext)
