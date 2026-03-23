import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, ExternalLink, ArrowRight } from "lucide-react";
import { useSiteConfig } from "@/lib/SiteConfigContext";

const Footer = () => {
  const { get } = useSiteConfig();
  const clubName  = String(get('club_name',        'Échiquier Royal'));
  const clubSub   = String(get('club_subtitle',     "Club d'échecs"));
  const clubDesc  = String(get('club_description',  "Club d'échecs passionné depuis 1987."));
  const address   = String(get('club_address',      '12 Rue de la Tour, 75016 Paris'));
  const email     = String(get('club_email',        'contact@echiquier-royal.fr'));
  const phone     = String(get('club_phone',        '01 42 88 77 66'));
  const schedule  = (get('schedule', [
    { day: "Mardi",  hours: "18h – 21h" },
    { day: "Jeudi",  hours: "18h – 21h" },
    { day: "Samedi", hours: "14h – 18h" },
  ]) as { day: string; hours: string }[]);

  return (
    <footer className="relative overflow-hidden text-white"
      style={{ background: "linear-gradient(160deg, hsl(var(--chess-blue-dark)) 0%, hsl(var(--chess-blue)) 100%)" }}>
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--chess-gold)), transparent)" }} />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1.5px 1.5px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 opacity-10 pointer-events-none blur-3xl"
        style={{ background: "hsl(var(--chess-gold))" }} />

      <div className="container relative py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg"
                style={{ background: "linear-gradient(135deg, hsl(var(--chess-gold-dark)), hsl(var(--chess-gold)))" }}>♚</div>
              <div>
                <div className="font-display font-bold text-base leading-tight">{clubName}</div>
                <div className="text-[9px] uppercase tracking-[0.18em] mt-0.5" style={{ color: "hsl(var(--chess-gold-light))" }}>{clubSub}</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "hsl(0 0% 100% / 0.45)" }}>{clubDesc}</p>
            <Link to="/admin" className="inline-flex items-center gap-1 text-xs transition-colors"
              style={{ color: "hsl(0 0% 100% / 0.2)" }}>
              <ExternalLink size={10} /> Administration
            </Link>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] mb-5" style={{ color: "hsl(var(--chess-gold))" }}>Navigation</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Accueil", path: "/" },
                { label: "À propos", path: "/a-propos" },
                { label: "Tournois", path: "/tournois" },
                { label: "Réalisations", path: "/realisations" },
                { label: "Contact", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="group flex items-center gap-2 text-sm transition-colors"
                    style={{ color: "hsl(0 0% 100% / 0.45)" }}>
                    <ArrowRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                      style={{ color: "hsl(var(--chess-gold))" }} />
                    <span className="group-hover:text-white transition-colors">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Horaires */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] mb-5" style={{ color: "hsl(var(--chess-gold))" }}>Horaires</h4>
            <div className="space-y-2.5">
              {Array.isArray(schedule) && schedule.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-white/70">{h.day}</span>
                  <span className="text-white/40">{h.hours}</span>
                </div>
              ))}
              <p className="text-xs pt-2 border-t" style={{ color: "hsl(0 0% 100% / 0.2)", borderColor: "hsl(0 0% 100% / 0.08)" }}>
                Fermé les jours fériés
              </p>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] mb-5" style={{ color: "hsl(var(--chess-gold))" }}>Contact</h4>
            <div className="space-y-3">
              {[
                { icon: MapPin, text: address },
                { icon: Mail,   text: email },
                { icon: Phone,  text: phone },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "hsl(var(--chess-gold)/0.12)" }}>
                    <item.icon size={13} style={{ color: "hsl(var(--chess-gold))" }} />
                  </div>
                  <span className="text-sm" style={{ color: "hsl(0 0% 100% / 0.45)" }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t"
          style={{ borderColor: "hsl(0 0% 100% / 0.08)", color: "hsl(0 0% 100% / 0.25)" }}>
          <span>© {new Date().getFullYear()} {clubName}. Tous droits réservés.</span>
          <span className="flex items-center gap-1">Fait avec <span style={{ color: "hsl(var(--chess-gold))" }}>♟</span> pour les passionnés d'échecs</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
