import Layout from "@/components/Layout";
import { useState } from "react";
import { Trophy, Megaphone, Camera, HelpCircle, ChevronDown, X, Globe, Loader2, Images } from "lucide-react";
import { usePosts, useSiteConfig } from "@/hooks/useSupabase";
import { Post } from "@/lib/supabase";

type Filter = "all" | string;

// ── FAQ ────────────────────────────────────────────────────────────
const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left bg-card hover:bg-muted/40 transition-colors">
        <span className="font-medium text-xs">{q}</span>
        <ChevronDown size={14} className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-3 pt-1 text-xs text-muted-foreground leading-relaxed border-t bg-muted/10">{a}</div>}
    </div>
  );
};

// ── Lightbox simple ───────────────────────────────────────────────
const Lightbox = ({ photos, index, onClose }: { photos: string[]; index: number; onClose: () => void }) => {
  const [cur, setCur] = useState(index);
  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><X size={26} /></button>
      <div className="relative max-w-3xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <img src={photos[cur]} alt="" className="w-full max-h-[82vh] object-contain rounded-xl shadow-2xl" />
        {photos.length > 1 && (
          <>
            <div className="flex gap-2 mt-3">
              {photos.map((_, i) => <button key={i} onClick={() => setCur(i)} className={`w-2 h-2 rounded-full transition-colors ${i === cur ? "bg-white" : "bg-white/30"}`} />)}
            </div>
            <button onClick={() => setCur((cur - 1 + photos.length) % photos.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white/10 hover:bg-white/25 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl">‹</button>
            <button onClick={() => setCur((cur + 1) % photos.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white/10 hover:bg-white/25 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl">›</button>
          </>
        )}
      </div>
    </div>
  );
};

// ── Photos compactes style Facebook ──────────────────────────────
const PhotoGrid = ({ photos }: { photos: string[] }) => {
  const [lightbox, setLightbox] = useState<number | null>(null);
  if (!photos || photos.length === 0) return null;

  const max = 4; // max photos visibles
  const shown = photos.slice(0, max);
  const more = photos.length - max;

  return (
    <>
      {lightbox !== null && <Lightbox photos={photos} index={lightbox} onClose={() => setLightbox(null)} />}
      <div className={`grid gap-0.5 overflow-hidden ${
        shown.length === 1 ? "grid-cols-1" :
        shown.length === 2 ? "grid-cols-2" :
        shown.length === 3 ? "grid-cols-2" :
        "grid-cols-2"
      }`}>
        {shown.map((url, i) => {
          const isLast = i === max - 1 && more > 0;
          const tall = shown.length === 3 && i === 0;
          return (
            <div
              key={i}
              className={`relative overflow-hidden cursor-pointer group ${tall ? "row-span-2" : ""}`}
              style={{ height: shown.length === 1 ? 300 : 180 }}
              onClick={() => setLightbox(i)}
            >
              <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              {isLast && more > 0 && (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Images size={22} className="mx-auto mb-1 opacity-80" />
                    <p className="text-xl font-bold">+{more}</p>
                    <p className="text-xs opacity-70">photos</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

// ── PostCard — titre/description en haut, photos en bas ──────────
const PostCard = ({ post }: { post: Post }) => {
  const lines = post.content.split("\n");
  return (
    <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
          {post.author[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm truncate">{post.author}</p>
            {post.tag && <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${post.tag_color}`}>{post.tag}</span>}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <span>{new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>·</span><Globe size={11} />
          </div>
        </div>
      </div>

      {/* Titre + texte */}
      <div className="px-4 pb-3">
        {post.title && <p className="font-semibold mb-1.5">{post.title}</p>}
        {lines.map((line, i) => line === "" ? <br key={i} /> : <p key={i} className="text-sm leading-relaxed">{line}</p>)}
      </div>

      {/* Photos compactes en bas */}
      <PhotoGrid photos={post.images_urls || []} />
    </div>
  );
};

// ── Stats saison (depuis config) ──────────────────────────────────
const SeasonStats = ({ get }: { get: (k: string, fb?: unknown) => unknown }) => {
  const stats = (get('season_stats', [
    { label: "Tournois joués", value: "8" },
    { label: "Victoires", value: "3" },
    { label: "Podiums équipe", value: "2" },
    { label: "Séances", value: "42" },
  ]) as { label: string; value: string }[]);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <h3 className="font-bold text-sm mb-3">La saison en chiffres</h3>
      <div className="space-y-2">
        {Array.isArray(stats) && stats.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className="text-sm font-bold" style={{ color: "hsl(var(--chess-blue))" }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────
const Achievements = () => {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  const { data: posts, loading } = usePosts();
  const { get } = useSiteConfig();

  const faqs = (get('faq', []) as { q: string; a: string }[]);

  // Catégories : seulement "Tout" + catégories personnalisées depuis config
  const customCategories = (get('post_categories', []) as string[]);
  const allFilters = [
    { label: "Tout", value: "all" },
    ...customCategories.map((c: string) => ({ label: c, value: c })),
  ];

  const filtered = activeFilter === "all" ? posts : posts.filter(p =>
    p.type === activeFilter || p.tag === activeFilter
  );

  return (
    <Layout>
      <section className="py-16 md:py-24 text-white"
        style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
        <div className="container">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: "hsl(var(--chess-gold))" }}>La vie du club</p>
          <h1 className="text-4xl font-bold md:text-5xl max-w-2xl text-balance leading-[1.1]">Réalisations & Actualités</h1>
          <p className="mt-4 text-white/50 max-w-lg">Photos, annonces et résultats — tout ce qui se passe au club.</p>
        </div>
      </section>

      <section className="py-8 min-h-screen" style={{ background: "hsl(var(--chess-silver-bg))" }}>
        <div className="container max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr_260px]">

            {/* Sidebar gauche */}
            <div className="hidden lg:block space-y-4">
              <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <h3 className="font-bold text-sm mb-3">♚ {String(get('club_name', 'Échiquier Royal'))}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{String(get('club_description', ''))}</p>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p>📍 {String(get('club_address', ''))}</p>
                  <p>📅 Depuis {String(get('club_founded', '1987'))}</p>
                  <p>👥 {String(get('club_members', '40+'))} membres</p>
                </div>
              </div>
              <SeasonStats get={get} />
            </div>

            {/* Feed central */}
            <div className="space-y-4 min-w-0">
              {/* Filtres / catégories */}
              <div className="bg-card rounded-2xl border shadow-sm p-3 flex flex-wrap gap-2">
                {allFilters.map(f => (
                  <button key={f.value} onClick={() => setActiveFilter(f.value)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeFilter === f.value ? "text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"}`}
                    style={activeFilter === f.value ? { background: "hsl(var(--chess-blue))" } : {}}>
                    {f.label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin" style={{ color: "hsl(var(--chess-blue))" }} /></div>
              ) : filtered.length === 0 ? (
                <div className="bg-card rounded-2xl border p-12 text-center text-muted-foreground text-sm">
                  Aucune publication dans cette catégorie.
                </div>
              ) : (
                filtered.map(post => <PostCard key={post.id} post={post} />)
              )}
            </div>

            {/* Sidebar droite — FAQ */}
            <div className="hidden lg:block space-y-4">
              <div className="rounded-2xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle size={15} style={{ color: "hsl(var(--chess-gold))" }} />
                  <h3 className="font-bold text-sm">Questions fréquentes</h3>
                </div>
                <div className="space-y-1.5">
                  {Array.isArray(faqs) && faqs.map((faq, i) => (
                    <FaqItem key={i} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Achievements;
