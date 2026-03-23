import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSiteConfig } from "@/lib/SiteConfigContext";
import logoClub from "@/assets/logo-club.jpg";

const navLinks = [
  { label: "Accueil", path: "/" },
  { label: "À propos", path: "/a-propos" },
  { label: "Tournois", path: "/tournois" },
  { label: "Réalisations", path: "/realisations" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { get } = useSiteConfig();
  const clubName = String(get('club_name', ''));
  const clubSub  = String(get('club_subtitle', ""));

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-[hsl(var(--chess-blue-dark))]/97 backdrop-blur-xl shadow-[0_4px_32px_-8px_hsl(var(--chess-blue-dark)/0.5)]"
        : "bg-[hsl(var(--chess-blue-dark))]"
    }`}>
      {/* Bande or en haut */}
      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--chess-gold))] to-transparent opacity-60" />

      <div className="container flex h-16 items-center justify-between md:h-[72px]">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-md">
            <img src={logoClub} alt="Logo" className="w-full h-full object-cover" />
          </div>
            <div className="hidden sm:block">
              <div className="text-base font-display font-bold text-white leading-tight tracking-tight">{clubName}</div>
              <div className="text-[9px] text-[hsl(var(--chess-gold-light))] uppercase tracking-[0.18em] font-medium">{clubSub}</div>
            </div>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center">
          {navLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path}
                className={`relative mx-0.5 px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? "text-[hsl(var(--chess-gold))]"
                    : "text-white/60 hover:text-white hover:bg-white/6"
                }`}>
                {link.label}
                {active && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-[hsl(var(--chess-gold))]" />
                )}
              </Link>
            );
          })}
        </nav>



        {/* Burger mobile */}
        <button onClick={() => setOpen(!open)} aria-label="Menu"
          className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/8 transition-colors">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-96" : "max-h-0"}`}>
        <div className="border-t border-white/8 bg-[hsl(var(--chess-blue-dark))]/98 backdrop-blur-xl">
          <nav className="container flex flex-col gap-1 py-3 pb-4">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link key={link.path} to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? "text-[hsl(var(--chess-gold))] bg-[hsl(var(--chess-gold))/8]"
                      : "text-white/60 hover:text-white hover:bg-white/6"
                  }`}>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--chess-gold))] shrink-0" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
