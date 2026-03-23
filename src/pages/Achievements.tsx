import Layout from "@/components/Layout";
import Reveal from "@/components/Reveal";
import { useState, useMemo } from "react";
import { HelpCircle, ChevronDown, X, Loader2, Search, Calendar, User } from "lucide-react";
import { usePosts, useSiteConfig } from "@/hooks/useSupabase";
import { Post } from "@/lib/supabase";
import logoClub from "@/assets/logo-club.jpg";

// ── Helpers couleurs ─────────────────────────────────────────────
function parseTagColor(tagColor?: string): { bg: string; text: string } {
  if (tagColor?.startsWith('bg:')) {
    const parts = tagColor.split(';')
    return {
      bg:   parts[0]?.replace('bg:', '')   || '#f3f4f6',
      text: parts[1]?.replace('text:', '') || '#374151',
    }
  }
  return { bg: '#f3f4f6', text: '#374151' }
}

// ── FAQ ───────────────────────────────────────────────────────────
const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left bg-card hover:bg-muted/40 transition-colors">
        <span className="font-medium text-xs leading-relaxed">{q}</span>
        <ChevronDown size={13} className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 text-xs text-muted-foreground leading-relaxed border-t bg-muted/10">{a}</div>
      )}
    </div>
  );
};

// ── Lightbox (même système que Tournois) ─────────────────────────
const Lightbox = ({ photos, index, onClose }: { photos: string[]; index: number; onClose: () => void }) => {
  const [cur, setCur] = useState(index);
  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-10"><X size={28} /></button>
      <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <img src={photos[cur]} alt="" className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" />
        {photos.length > 1 && (
          <>
            <div className="flex justify-center gap-2 mt-4">
              {photos.map((_, i) => <button key={i} onClick={() => setCur(i)} className={`w-2 h-2 rounded-full transition-colors ${i === cur ? "bg-white" : "bg-white/30"}`} />)}
            </div>
            <button onClick={() => setCur((cur - 1 + photos.length) % photos.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 md:-translate-x-5 bg-white/10 hover:bg-white/25 text-white rounded-full w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-xl">‹</button>
            <button onClick={() => setCur((cur + 1) % photos.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 md:translate-x-5 bg-white/10 hover:bg-white/25 text-white rounded-full w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-xl">›</button>
          </>
        )}
      </div>
    </div>
  );
};

// ── Grille photos ─────────────────────────────────────────────────
const PhotoGrid = ({ photos, onOpen }: { photos: string[]; onOpen: (i: number) => void }) => {
  if (!photos || photos.length === 0) return null;
  const max = 4;
  const shown = photos.slice(0, max);
  const more = photos.length - max;
  return (
    <div className={`grid gap-0.5 ${shown.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
      {shown.map((url, i) => {
        const isLast = i === max - 1 && more > 0;
        const tall = shown.length === 3 && i === 0;
        return (
          <div key={i}
            className={`relative overflow-hidden cursor-pointer group ${tall ? "row-span-2" : ""}`}
            style={{ height: shown.length === 1 ? "clamp(200px, 50vw, 360px)" : "clamp(120px, 25vw, 200px)" }}
            onClick={() => onOpen(i)}>
            <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            {isLast && more > 0 && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <p className="text-white text-xl font-bold">+{more}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── PostCard ──────────────────────────────────────────────────────
const PostCard = ({ post, onOpenLightbox }: { post: Post; onOpenLightbox: (photos: string[], index: number) => void }) => {
  const [expanded, setExpanded] = useState(false);
  const lines = post.content.split("\n");
  const isLong = lines.length > 6 || post.content.length > 400;

  const displayDate = new Date(post.custom_date || post.created_at)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const { bg: tagBg, text: tagText } = parseTagColor(post.tag_color);

  const initials = (post.author || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <article className="bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-3">
        <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm select-none"
          style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm">{post.author}</span>
            {post.tag && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{ background: tagBg, color: tagText }}>
                {post.tag}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <Calendar size={11} className="shrink-0" />
            <span>{displayDate}</span>
            {post.author_role && (
              <>
                <span className="opacity-40">·</span>
                <User size={11} className="shrink-0 opacity-70" />
                <span className="truncate">{post.author_role}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Contenu ── */}
      <div className="px-5 pb-4">
        {post.title && (
          <h3 className="font-bold text-base mb-2 leading-snug">{post.title}</h3>
        )}
        <div className={`relative overflow-hidden transition-all duration-300 ${!expanded && isLong ? "max-h-[7.5rem]" : ""}`}>
          <div className="space-y-1">
            {lines.map((line, i) =>
              line === "" ? <br key={i} /> :
              <p key={i} className="text-sm leading-relaxed text-foreground/85">{line}</p>
            )}
          </div>
          {!expanded && isLong && (
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent" />
          )}
        </div>
        {isLong && (
          <button onClick={() => setExpanded(e => !e)}
            className="mt-2 text-xs font-semibold transition-colors"
            style={{ color: "hsl(var(--chess-blue))" }}>
            {expanded ? "Voir moins ↑" : "Voir plus ↓"}
          </button>
        )}
      </div>

      {/* ── Photos ── */}
      {(post.images_urls?.length || 0) > 0 && (
        <PhotoGrid
          photos={post.images_urls || []}
          onOpen={(i) => onOpenLightbox(post.images_urls || [], i)}
        />
      )}
    </article>
  );
};

// ── PostCard ──────────────────────────────────────────────────────
// ── Stats saison ──────────────────────────────────────────────────
const SeasonStats = ({ get }: { get: (k: string, fb?: unknown) => unknown }) => {
  const stats = get('season_stats', []) as { label: string; value: string }[];
  if (!Array.isArray(stats) || stats.length === 0) return null;
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "hsl(var(--chess-gold-dark))" }}>
        La saison en chiffres
      </p>
      <div className="space-y-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className="text-sm font-bold tabular-nums" style={{ color: "hsl(var(--chess-blue))" }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────
const Achievements = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType]   = useState<string>("all");
  const [dateFilter, setDateFilter]   = useState<string>("all");
  const [lightbox, setLightbox]       = useState<{ photos: string[]; index: number } | null>(null);
  const { data: posts, loading }      = usePosts();
  const { get }                       = useSiteConfig();

  const faqs        = get('faq', []) as { q: string; a: string }[];
  const customTypes = get('post_types', []) as { label: string; color: string }[];

  // Construire la liste des mois disponibles depuis les posts
  const availableMonths = useMemo(() => {
    const seen = new Set<string>();
    posts.forEach(p => {
      const d = new Date(p.custom_date || p.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      seen.add(key);
    });
    return Array.from(seen).sort((a, b) => b.localeCompare(a)); // desc
  }, [posts]);

  const filtered = useMemo(() => {
    let result = posts;

    // Filtre par type
    if (activeType !== "all") {
      result = result.filter(p => p.type === activeType || p.tag === activeType);
    }

    // Filtre par mois
    if (dateFilter !== "all") {
      result = result.filter(p => {
        const d = new Date(p.custom_date || p.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return key === dateFilter;
      });
    }

    // Filtre par texte
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q) ||
        p.author?.toLowerCase().includes(q) ||
        p.tag?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [posts, activeType, dateFilter, searchQuery]);

  const clubName    = String(get('club_name', ''));
  const clubDesc    = String(get('club_description', ''));
  const clubAddress = String(get('club_address', ''));
  const clubFounded = String(get('club_founded', ''));
  const clubMembers = String(get('club_members', ''));

  const hasFilters = activeType !== "all" || dateFilter !== "all" || searchQuery.trim() !== "";

  return (
    <Layout>
      {/* Lightbox rendue au root — hors de tout overflow:hidden */}
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          index={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
      {/* ── Hero ── */}
      <section className="py-16 md:py-24 text-white"
        style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
        <div className="container">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
              style={{ color: "hsl(var(--chess-gold))" }}>
              La vie du club
            </p>
            <h1 className="text-3xl md:text-5xl font-bold max-w-2xl text-balance leading-[1.1]">
              Réalisations & Actualités
            </h1>
            <p className="mt-4 text-white/50 max-w-lg text-sm md:text-base">
              Suivez toute l'activité du club — événements, résultats, photos et annonces.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Corps ── */}
      <section className="py-8 md:py-10 min-h-screen" style={{ background: "hsl(var(--chess-silver-bg))" }}>
        <div className="container max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr_260px] xl:grid-cols-[280px_1fr_280px]">

            {/* ── Sidebar gauche ── */}
            <aside className="hidden lg:flex flex-col gap-4">
              <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border shadow-sm">
                    <img src={logoClub} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{clubName}</h3>
                    {clubFounded && (
                      <p className="text-xs text-muted-foreground">Fondé en {clubFounded}</p>
                    )}
                  </div>
                </div>
                {clubDesc && (
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{clubDesc}</p>
                )}
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {clubAddress && (
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">📍</span>
                      <span>{clubAddress}</span>
                    </div>
                  )}
                  {clubMembers && (
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span>{clubMembers} membres actifs</span>
                    </div>
                  )}
                </div>
              </div>
              <SeasonStats get={get} />

              {/* Types — filtres latéraux sur desktop */}
              {Array.isArray(customTypes) && customTypes.length > 0 && (
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wider mb-3"
                    style={{ color: "hsl(var(--chess-gold-dark))" }}>
                    Filtrer par type
                  </p>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setActiveType("all")}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        activeType === "all"
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}>
                      Toutes les publications
                      <span className="ml-1 text-muted-foreground font-normal">({posts.length})</span>
                    </button>
                    {customTypes.map(t => {
                      const { bg, text } = parseTagColor(t.color);
                      const count = posts.filter(p => p.type === t.label || p.tag === t.label).length;
                      const isActive = activeType === t.label;
                      return (
                        <button key={t.label}
                          onClick={() => setActiveType(t.label)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                            isActive ? "font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                          style={isActive ? { background: bg + '40', color: text } : {}}>
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: text }} />
                          {t.label}
                          <span className="ml-auto text-muted-foreground font-normal">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>

            {/* ── Feed central ── */}
            <div className="space-y-4 min-w-0">

              {/* Barre recherche + filtres mobile */}
              <div className="bg-card rounded-2xl border shadow-sm p-4 space-y-3">

                {/* Filtres par type — chips (mobile) */}
                {Array.isArray(customTypes) && customTypes.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 lg:hidden">
                    <button
                      onClick={() => setActiveType("all")}
                      className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        activeType === "all" ? "text-white shadow-sm" : "bg-muted/70 text-muted-foreground hover:bg-muted"
                      }`}
                      style={activeType === "all" ? { background: "hsl(var(--chess-blue))" } : {}}>
                      Tout
                    </button>
                    {customTypes.map(t => {
                      const { bg, text } = parseTagColor(t.color);
                      const isActive = activeType === t.label;
                      return (
                        <button key={t.label} onClick={() => setActiveType(t.label)}
                          className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-all"
                          style={{ background: isActive ? bg : 'transparent', color: isActive ? text : '#888', borderColor: isActive ? text : '#e5e7eb' }}>
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Filtre par mois */}
                {availableMonths.length > 1 && (
                  <div className="flex items-center gap-2">
                    <select
                      value={dateFilter}
                      onChange={e => setDateFilter(e.target.value)}
                      className="flex-1 text-sm border rounded-xl px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                      <option value="all">Toutes les dates</option>
                      {availableMonths.map(m => {
                        const [year, month] = m.split('-');
                        const label = new Date(Number(year), Number(month) - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                        return <option key={m} value={m}>{label.charAt(0).toUpperCase() + label.slice(1)}</option>;
                      })}
                    </select>
                    {dateFilter !== "all" && (
                      <button onClick={() => setDateFilter("all")}
                        className="p-2.5 rounded-xl border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}

                {/* Barre de recherche */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Rechercher dans les publications…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-sm border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      <X size={14} />
                    </button>
                  )}
                </div>

                {hasFilters && !loading && (
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{filtered.length}</span> publication{filtered.length > 1 ? 's' : ''}
                      {activeType !== "all" && ` · ${activeType}`}
                      {dateFilter !== "all" && ` · ${new Date(dateFilter + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`}
                      {searchQuery && ` · "${searchQuery}"`}
                    </p>
                    <button
                      onClick={() => { setSearchQuery(""); setActiveType("all"); setDateFilter("all"); }}
                      className="text-xs underline text-muted-foreground hover:text-foreground transition-colors">
                      Tout afficher
                    </button>
                  </div>
                )}
              </div>

              {/* Feed */}
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="animate-spin" style={{ color: "hsl(var(--chess-blue))" }} />
                    <p className="text-xs text-muted-foreground">Chargement des publications…</p>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-card rounded-2xl border p-16 text-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="opacity-40" />
                  </div>
                  <p className="font-semibold text-sm mb-1 text-foreground">Aucune publication trouvée</p>
                  <p className="text-xs mb-4">
                    {searchQuery ? `Aucun résultat pour "${searchQuery}"` : "Aucune publication dans cette catégorie"}
                  </p>
                  {hasFilters && (
                    <button
                      onClick={() => { setSearchQuery(""); setActiveType("all"); setDateFilter("all"); }}
                      className="text-xs font-semibold px-4 py-2 rounded-xl text-white transition-all hover:brightness-110"
                      style={{ background: "hsl(var(--chess-blue))" }}>
                      Effacer les filtres
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map(post => (
                    <Reveal key={post.id}>
                      <PostCard
                        post={post}
                        onOpenLightbox={(photos, index) => setLightbox({ photos, index })}
                      />
                    </Reveal>
                  ))}
                </div>
              )}
            </div>

            {/* ── Sidebar droite ── */}
            <aside className="hidden lg:flex flex-col gap-4">
              {Array.isArray(faqs) && faqs.length > 0 && (
                <div className="rounded-2xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <HelpCircle size={14} style={{ color: "hsl(var(--chess-gold))" }} />
                    <h3 className="font-bold text-sm">Questions fréquentes</h3>
                  </div>
                  <div className="space-y-1.5">
                    {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
                  </div>
                </div>
              )}
            </aside>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Achievements;
