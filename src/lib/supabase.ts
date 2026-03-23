import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️  Variables Supabase manquantes. Créez un fichier .env avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder'
)

// ── Types ────────────────────────────────────────────────────────
export interface Tournament {
  id: string
  title: string
  date: string         // label affiché ex: "5 Avril 2026"
  date_iso?: string    // date ISO pour calcul automatique du statut ex: "2026-04-05"
  cadence: string
  type: string
  rounds: number
  location: string
  spots: number
  total: number
  description: string
  price: string
  arbitre: string
  homologue: boolean
  niveaux: string
  contact: string
  fiches_techniques_urls: string[]
  photos_urls: string[]
  is_past: boolean
  winner?: string
  participants?: number
  winner_medal?: string
  winner_note?: string
  podium_1?: string    // 1ère place
  podium_2?: string    // 2ème place
  podium_3?: string    // 3ème place
  display_order: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  type: 'photo' | 'annonce' | 'resultat'
  author: string
  author_role: string
  title?: string
  content: string
  images_urls: string[]
  tag?: string
  tag_color?: string
  likes: number
  published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface GalleryPhoto {
  id: string
  url: string
  caption: string
  date_label: string
  display_order: number
  created_at: string
}

export type SiteConfig = Record<string, unknown>

// ── Helpers upload — stockage base64 inline (pas de Storage Supabase) ──────
// Les images sont converties en base64 et stockées directement en base de données.
// Ça élimine tous les problèmes de buckets, RLS et permissions Storage.

export async function uploadFile(
  _bucket: string,
  file: File,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Redimensionner si trop grande (max 1200px) pour éviter des valeurs trop lourdes
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const img = new Image()
      img.onload = () => {
        const MAX = 1200
        let { width, height } = img
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        // JPEG qualité 85% pour les photos, PNG pour les fiches (texte)
        const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg'
        const result = canvas.toDataURL(isJpeg ? 'image/jpeg' : 'image/png', 0.85)
        resolve(result)
      }
      img.onerror = () => reject(new Error('Impossible de lire l\'image'))
      img.src = dataUrl
    }
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
    reader.readAsDataURL(file)
  })
}

export async function uploadMultiple(_bucket: string, files: File[]): Promise<string[]> {
  const results = await Promise.allSettled(files.map(f => uploadFile(_bucket, f)))
  return results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map(r => r.value)
}

export async function deleteFile(_bucket: string, _url: string): Promise<void> {
  // Rien à faire — les base64 sont supprimées avec l'enregistrement BDD
}
