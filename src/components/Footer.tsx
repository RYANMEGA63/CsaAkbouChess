import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, ArrowRight } from "lucide-react";
import { useSiteConfig } from "@/lib/SiteConfigContext";
import logoClub from "@/assets/logo-club.jpg";

// Icônes SVG réseaux
const FbIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
const IgIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
const WaIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
const YtIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>

const Footer = () => {
  const { get } = useSiteConfig();
  const clubName  = String(get('club_name',        ''));
  const clubSub   = String(get('club_subtitle',     ""));
  const clubDesc  = String(get('club_description',  ""));
  const address   = String(get('club_address',      ''));
  const email     = String(get('club_email',        ''));
  const phone     = String(get('club_phone',        ''));
  const schedule  = (get('schedule', []) as { day: string; hours: string }[]);

  const socialLinks = [
    { key: 'social_facebook',  label: 'Facebook',  Icon: FbIcon },
    { key: 'social_instagram', label: 'Instagram', Icon: IgIcon },
    { key: 'social_whatsapp',  label: 'WhatsApp',  Icon: WaIcon },
    { key: 'social_youtube',   label: 'YouTube',   Icon: YtIcon },
  ].map(s => ({ ...s, url: String(get(s.key, '')) }))
   .filter(s => s.url && s.url !== '' && s.url !== 'null')

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

          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/15">
                <img src={logoClub} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="font-display font-bold text-base leading-tight">{clubName}</div>
                <div className="text-[9px] uppercase tracking-[0.18em] mt-0.5" style={{ color: "hsl(var(--chess-gold-light))" }}>{clubSub}</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "hsl(0 0% 100% / 0.45)" }}>{clubDesc}</p>
            {/* Réseaux sociaux */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {socialLinks.map(({ key, label, Icon, url }) => (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                    title={label}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:brightness-110"
                    style={{ background: "hsl(0 0% 100% / 0.12)" }}>
                    <Icon />
                  </a>
                ))}
              </div>
            )}
            <Link to="/contact" className="inline-flex items-center gap-1 text-xs transition-colors"
              style={{ color: "hsl(0 0% 100% / 0.2)" }}>
              Contact
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
