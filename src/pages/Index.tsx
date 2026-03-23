import Layout from "@/components/Layout";
import Reveal from "@/components/Reveal";
import { Link } from "react-router-dom";
import { Camera, ArrowRight, ChevronRight, Star, Loader2, Users, Target, Trophy, Calendar } from "lucide-react";
import { useGallery, useSiteConfig } from "@/hooks/useSupabase";
import heroImage from "@/assets/hero-chess.jpg";
import tournamentImage from "@/assets/tournament.jpg";

const Index = () => {
  const { data: gallery, loading: galleryLoading } = useGallery();
  const { get } = useSiteConfig();

  const clubName    = String(get('club_name',    'Échiquier Royal'));
  const heroTitle   = String(get('hero_title',   'Votre prochain coup commence ici'));
  const heroSub     = String(get('hero_subtitle','Rejoignez le club et progressez dans un cadre convivial.'));
  const founded     = String(get('club_founded', '1987'));
  const members     = String(get('club_members', '40+'));
  const teams       = String(get('club_teams',   '2'));
  const aboutTitle  = String(get('about_title',  "L'excellence échiquéenne au cœur de la ville"));
  const aboutText   = String(get('about_text',   ''));

  const heroImageUrl = get('hero_image_url', null) as string | null;
  const presentationImageUrl = get('presentation_image_url', null) as string | null;
  const currentYear = new Date().getFullYear();
  const yearsExist  = currentYear - parseInt(founded);

  const schedule = (get('schedule', [
    { day: "Mardi", hours: "18h – 21h" },
    { day: "Jeudi", hours: "18h – 21h" },
    { day: "Samedi", hours: "14h – 18h" },
  ]) as { day: string; hours: string }[]);

  return (
    <Layout>
      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)) 0%, hsl(var(--chess-blue)) 60%, hsl(var(--chess-blue-mid)) 100%)" }}>
        <div className="absolute inset-0">
          <img src={heroImageUrl || heroImage} alt="" className="w-full h-full object-cover opacity-15 mix-blend-luminosity" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)/0.92), hsl(var(--chess-blue)/0.80) 55%, hsl(var(--chess-blue-mid)/0.65))" }} />
        </div>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(hsl(var(--chess-gold)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--chess-gold)) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06] pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--chess-gold)), transparent 70%)" }} />

        <div className="container relative z-10 py-32">
          <div className="max-w-3xl">
            <Reveal>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6 border"
                style={{ background: "hsl(var(--chess-gold)/0.12)", borderColor: "hsl(var(--chess-gold)/0.30)", color: "hsl(var(--chess-gold-light))" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "hsl(var(--chess-gold))" }} />
                Club d'échecs depuis {founded}
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="text-5xl font-bold leading-[1.08] text-white md:text-6xl lg:text-7xl text-balance mb-6">
                {heroTitle.includes("commence") ? (
                  <>
                    {heroTitle.split("commence")[0]}commence<br />
                    <span style={{ background: "linear-gradient(90deg, hsl(var(--chess-gold-light)), hsl(var(--chess-gold)))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {heroTitle.split("commence")[1] || "ici"}
                    </span>
                  </>
                ) : heroTitle}
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="text-lg text-white/60 leading-relaxed max-w-xl mb-10">{heroSub}</p>
            </Reveal>
            <Reveal delay={260}>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all hover:brightness-110 active:scale-95 shadow-lg"
                  style={{ background: "linear-gradient(135deg, hsl(var(--chess-gold-dark)), hsl(var(--chess-gold)))", boxShadow: "0 8px 24px -4px hsl(var(--chess-gold)/0.4)" }}>
                  S'inscrire au club <ChevronRight size={16} />
                </Link>
                <Link to="/tournois"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white transition-all hover:bg-white/15 active:scale-95 border border-white/20 backdrop-blur-sm">
                  Voir les tournois <ArrowRight size={16} />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={380}>
              <div className="flex flex-wrap gap-8 mt-14">
                {[
                  { value: members, label: "Membres" },
                  { value: `${yearsExist}`, label: "Ans d'existence" },
                  { value: teams, label: "Équipes" },
                ].map(s => (
                  <div key={s.label} className="flex flex-col">
                    <span className="text-3xl font-display font-bold" style={{ color: "hsl(var(--chess-gold))" }}>{s.value}</span>
                    <span className="text-xs text-white/45 uppercase tracking-widest mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, hsl(var(--background)))" }} />
      </section>

      {/* ── PRÉSENTATION ── */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
            <Reveal direction="left">
              <div className="relative">
                <div className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl pointer-events-none"
                  style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue)), hsl(var(--chess-gold)))" }} />
                <img src={presentationImageUrl || tournamentImage} alt="Tournoi" className="relative rounded-2xl shadow-2xl w-full object-cover" style={{ aspectRatio: "4/3" }} />
                <div className="absolute -bottom-5 -right-5 rounded-2xl px-5 py-3 shadow-xl"
                  style={{ background: "linear-gradient(135deg, hsl(var(--chess-gold-dark)), hsl(var(--chess-gold)))" }}>
                  <span className="text-3xl font-display font-bold text-white">{yearsExist}</span>
                  <span className="ml-1.5 text-sm text-white/80">ans d'existence</span>
                </div>
              </div>
            </Reveal>
            <Reveal direction="right">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
                  style={{ background: "hsl(var(--chess-gold)/0.1)", color: "hsl(var(--chess-gold-dark))" }}>
                  Notre club
                </div>
                <h2 className="text-4xl font-bold leading-tight md:text-5xl text-balance mb-6">{aboutTitle}</h2>
                {aboutText && <p className="text-muted-foreground leading-relaxed mb-8">{aboutText}</p>}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: members, label: "Membres" },
                    { value: "12", label: "Tournois/an" },
                    { value: teams, label: "Équipes" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border p-4 text-center"
                      style={{ background: "hsl(var(--chess-blue)/0.04)", borderColor: "hsl(var(--chess-blue)/0.12)" }}>
                      <p className="text-2xl font-display font-bold" style={{ color: "hsl(var(--chess-blue))" }}>{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Horaires */}
                {Array.isArray(schedule) && schedule.length > 0 && (
                  <div className="mt-8 rounded-xl border p-4" style={{ background: "hsl(var(--chess-blue)/0.04)", borderColor: "hsl(var(--chess-blue)/0.12)" }}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "hsl(var(--chess-gold-dark))" }}>Horaires des séances</p>
                    <div className="space-y-2">
                      {schedule.map((h, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="font-medium">{h.day}</span>
                          <span className="text-muted-foreground">{h.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── AVANTAGES ── */}
      <section className="py-24 md:py-32 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="container relative">
          <Reveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full"
                style={{ background: "hsl(var(--chess-gold)/0.15)", color: "hsl(var(--chess-gold-light))" }}>Avantages</div>
              <h2 className="text-4xl font-bold text-white md:text-5xl">Pourquoi nous rejoindre</h2>
            </div>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users,    title: "Communauté",  desc: "Joueurs de tous niveaux, du débutant au maître FIDE." },
              { icon: Target,   title: "Progression", desc: "Cours hebdomadaires, analyses et coaching personnalisé." },
              { icon: Trophy,   title: "Compétition", desc: "Tournois internes et championnats inter-clubs toute l'année." },
              { icon: Calendar, title: "Événements",  desc: "Simultanées, soirées thématiques et rencontres conviviales." },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div className="group rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 border"
                  style={{ background: "hsl(var(--chess-blue-mid)/0.4)", borderColor: "hsl(var(--chess-gold)/0.15)" }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:scale-110"
                    style={{ background: "hsl(var(--chess-gold)/0.15)" }}>
                    <item.icon size={22} style={{ color: "hsl(var(--chess-gold))" }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALERIE ── */}
      <section className="py-24 md:py-32">
        <div className="container">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-3 px-3 py-1.5 rounded-full"
                  style={{ background: "hsl(var(--chess-gold)/0.1)", color: "hsl(var(--chess-gold-dark))" }}>
                  <Camera size={12} /> Au fil des séances
                </div>
                <h2 className="text-4xl font-bold">Nos derniers moments</h2>
              </div>
              <Link to="/realisations" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold transition-all hover:gap-3"
                style={{ color: "hsl(var(--chess-blue))" }}>
                Voir tout <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>

          {galleryLoading ? (
            <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin" style={{ color: "hsl(var(--chess-blue))" }} /></div>
          ) : gallery.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Camera size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune photo dans la galerie.<br />Ajoutez-en depuis le panneau admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {gallery.slice(0, 10).map((photo, i) => (
                <Reveal key={photo.id} delay={i * 60}>
                  <div className="rounded-2xl border overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    style={{ borderColor: "hsl(var(--chess-silver-light)/0.5)" }}>
                    <div className="relative h-28 overflow-hidden">
                      <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "linear-gradient(to top, hsl(var(--chess-blue-dark)/0.7), transparent)" }} />
                    </div>
                    <div className="px-3 py-2 bg-white">
                      <p className="text-xs font-medium leading-tight line-clamp-1">{photo.caption}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "hsl(var(--chess-silver))" }}>{photo.date_label}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-6 text-center md:hidden">
            <Link to="/realisations" className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "hsl(var(--chess-blue))" }}>
              Voir toutes nos photos <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 pointer-events-none blur-3xl"
          style={{ background: "hsl(var(--chess-gold))" }} />
        <div className="container relative text-center">
          <Reveal>
            <div className="inline-flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="hsl(var(--chess-gold))" style={{ color: "hsl(var(--chess-gold))" }} />)}
            </div>
            <h2 className="text-4xl font-bold text-white md:text-5xl text-balance max-w-2xl mx-auto mb-4">
              Prêt à faire votre premier coup ?
            </h2>
            <p className="text-white/50 max-w-md mx-auto mb-10">
              Première séance d'essai gratuite. Venez découvrir le club sans engagement.
            </p>
            <Link to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg transition-all hover:brightness-110 active:scale-95 shadow-xl"
              style={{ background: "linear-gradient(135deg, hsl(var(--chess-gold-dark)), hsl(var(--chess-gold)))", boxShadow: "0 12px 32px -8px hsl(var(--chess-gold)/0.5)" }}>
              Réserver une séance d'essai <ChevronRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
