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
  date: string
  date_iso?: string
  cadence: string
  type: string
  rounds: number
  location: string
  description: string
  homologue: boolean
  niveaux: string
  fiches_techniques_urls: string[]
  is_past: boolean
  extra_places?: { rank: number; name: string; category: string }[]
  registrations_closed?: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  type: string            // libre — déterminé par les types personnalisés
  author: string
  author_role: string
  title?: string
  content: string
  images_urls: string[]
  tag?: string
  tag_color?: string
  published: boolean
  display_order: number
  custom_date?: string
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

export interface Player {
  id: string
  nom: string
  prenom: string
  date_naissance: string | null
  categorie: string | null
  fide_id: string | null
  role: string | null
  telephone: string | null
  niveaux: string | null
  display_order: number
  created_at: string
  updated_at: string
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
