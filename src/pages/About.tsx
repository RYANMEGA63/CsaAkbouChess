import Layout from "@/components/Layout";
import Reveal from "@/components/Reveal";
import { useSiteConfig } from "@/lib/SiteConfigContext";
import { usePlayers } from "@/hooks/useSupabase";
import { useState } from "react";
import { Search, User } from "lucide-react";
import aboutImage from "@/assets/about-chess.jpg";
import tournamentImage from "@/assets/tournament.jpg";

const About = () => {
  const { get } = useSiteConfig();
  const { data: players, loading: loadingPlayers } = usePlayers();
  const [searchTerm, setSearchTerm] = useState("");

  const heroTitle      = String(get('about_hero_title',  ''));
  const storyTitle     = String(get('about_story_title', ''));
  const storyParagraphs = (get('about_story_paragraphs', []) as string[]);
  const venueTitle     = String(get('about_venue_title',    ''));
  const venueSubtitle  = String(get('about_venue_subtitle', ''));
  const venueText      = String(get('about_venue_text',     ''));
  const storyImageUrl  = get('about_story_image_url', null) as string | null;
  const venueImageUrl  = get('about_venue_image_url', null) as string | null;
  const values         = (get('values', []) as { title: string; desc: string }[]);
  const clubName = String(get('club_name', ''));
  const founded  = String(get('club_founded', ''));

  const filteredPlayers = players.filter(p => 
    `${p.nom} ${p.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.fide_id?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 text-white"
        style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
        <div className="container">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
              style={{ color: "hsl(var(--chess-gold))" }}>Notre histoire</p>
            <h1 className="text-4xl font-bold md:text-5xl max-w-2xl text-balance leading-[1.1]">
              {heroTitle}
            </h1>
          </Reveal>
        </div>
      </section>

      {/* Story — photo gauche, texte droite */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <Reveal direction="left">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl opacity-15 blur-2xl pointer-events-none"
                  style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue)), hsl(var(--chess-gold)))" }} />
                <img
                  src={storyImageUrl || aboutImage}
                  alt="Club d'échecs"
                  className="relative rounded-2xl shadow-2xl w-full object-cover"
                  style={{ aspectRatio: "4/3" }}
                />
                <div className="absolute -bottom-5 -right-5 rounded-2xl px-5 py-3 shadow-xl"
                  style={{ background: "linear-gradient(135deg, hsl(var(--chess-gold-dark)), hsl(var(--chess-gold)))" }}>
                  <span className="text-2xl font-display font-bold text-white">Depuis {founded}</span>
                </div>
              </div>
            </Reveal>
            <Reveal direction="right">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
                  style={{ background: "hsl(var(--chess-gold)/0.1)", color: "hsl(var(--chess-gold-dark))" }}>
                  {storyTitle}
                </div>
                <h2 className="text-3xl font-bold mb-6 md:text-4xl">{clubName}</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  {Array.isArray(storyParagraphs) && storyParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-24 md:py-32 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="container relative">
          <Reveal>
            <h2 className="text-3xl font-bold text-white mb-14 text-center md:text-4xl">Nos valeurs</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {Array.isArray(values) && values.map((v, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="rounded-2xl p-8 border transition-all hover:-translate-y-1 duration-300"
                  style={{ background: "hsl(var(--chess-blue-mid)/0.4)", borderColor: "hsl(var(--chess-gold)/0.15)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: "hsl(var(--chess-gold)/0.15)" }}>
                    <span className="text-xl">♟</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: "hsl(var(--chess-gold))" }}>{v.title}</h3>
                  <p className="text-sm text-white/55 leading-relaxed">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Venue — texte gauche, photo droite */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <Reveal direction="left">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
                  style={{ background: "hsl(var(--chess-gold)/0.1)", color: "hsl(var(--chess-gold-dark))" }}>
                  {venueSubtitle}
                </div>
                <h2 className="text-3xl font-bold mb-6 md:text-4xl">{venueTitle}</h2>
                <p className="text-muted-foreground leading-relaxed">{venueText}</p>
              </div>
            </Reveal>
            <Reveal direction="right">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl opacity-15 blur-2xl pointer-events-none"
                  style={{ background: "linear-gradient(135deg, hsl(var(--chess-gold)), hsl(var(--chess-blue)))" }} />
                <img
                  src={venueImageUrl || tournamentImage}
                  alt="Salle du club"
                  className="relative rounded-2xl shadow-2xl w-full object-cover"
                  style={{ aspectRatio: "4/3" }}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Players List */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-6 md:text-4xl">Nos Membres</h2>
              <p className="text-muted-foreground">Retrouvez la liste des membres passionnés qui font la vie de notre club.</p>
            </div>
          </Reveal>

          <Reveal>
            <div className="mb-8 relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un membre ou ID Fide..." 
                className="w-full pl-12 pr-4 py-3 rounded-2xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Reveal>

          <Reveal>
            <div className="bg-card rounded-3xl border shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Membre</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Fonction</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Catégorie</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Né(e) le</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">ID FIDE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loadingPlayers ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-6"><div className="h-4 bg-muted rounded w-32" /></td>
                          <td className="px-6 py-6"><div className="h-3 bg-muted rounded w-24" /></td>
                          <td className="px-6 py-6"><div className="h-3 bg-muted rounded w-20" /></td>
                          <td className="px-6 py-6"><div className="h-3 bg-muted rounded w-24" /></td>
                          <td className="px-6 py-6"><div className="h-4 bg-muted rounded w-16 ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredPlayers.length > 0 ? (
                      filteredPlayers.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <User size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-foreground">{p.nom} {p.prenom}</p>
                                {p.fide_id && <p className="text-[10px] text-muted-foreground font-mono">FIDE: {p.fide_id}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {p.role ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase">
                                {p.role}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Joueur</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                              {p.categorie || 'Non classé'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm text-muted-foreground">
                            {p.date_naissance ? new Date(p.date_naissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                          </td>
                          <td className="px-6 py-5 text-right font-mono text-sm font-semibold text-primary">
                            {p.fide_id || '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                          Aucun membre trouvé pour "{searchTerm}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default About;
