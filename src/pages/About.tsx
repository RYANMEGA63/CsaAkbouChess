import Layout from "@/components/Layout";
import Reveal from "@/components/Reveal";
import { useSiteConfig } from "@/lib/SiteConfigContext";
import aboutImage from "@/assets/about-chess.jpg";
import tournamentImage from "@/assets/tournament.jpg";

const About = () => {
  const { get } = useSiteConfig();

  const heroTitle      = String(get('about_hero_title',  'Un club forgé par la passion des 64 cases'));
  const storyTitle     = String(get('about_story_title', 'Notre histoire'));
  const storyParagraphs = (get('about_story_paragraphs', [
    "L'Échiquier Royal a été fondé par un groupe de passionnés souhaitant créer un espace dédié à la pratique des échecs.",
    "Au fil des décennies, le club a formé des centaines de joueurs et tissé des liens avec des clubs à travers l'Europe.",
    "Aujourd'hui, nous sommes fiers de compter des membres actifs de tous niveaux.",
  ]) as string[]);
  const venueTitle     = String(get('about_venue_title',    'Un cadre exceptionnel'));
  const venueSubtitle  = String(get('about_venue_subtitle', 'Notre salle'));
  const venueText      = String(get('about_venue_text',     'Notre salle offre un environnement calme et propice à la concentration.'));
  const storyImageUrl  = get('about_story_image_url', null) as string | null;
  const venueImageUrl  = get('about_venue_image_url', null) as string | null;
  const values         = (get('values', [
    { title: "Transmission", desc: "Nous croyons que chaque joueur expérimenté a le devoir de transmettre son savoir aux plus jeunes." },
    { title: "Fair-play",    desc: "Le respect de l'adversaire est au cœur de chaque partie. Gagner avec élégance, perdre avec dignité." },
    { title: "Excellence",   desc: "Nous encourageons chaque membre à repousser ses limites et à viser la meilleure version de son jeu." },
  ]) as { title: string; desc: string }[]);
  const clubName = String(get('club_name', 'Échiquier Royal'));
  const founded  = String(get('club_founded', '1987'));

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
    </Layout>
  );
};

export default About;
