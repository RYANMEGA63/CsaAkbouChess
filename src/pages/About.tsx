import Layout from "@/components/Layout";
import Reveal from "@/components/Reveal";
import { useSiteConfig } from "@/lib/SiteConfigContext";
import { usePlayers } from "@/hooks/useSupabase";
import { useState, useMemo } from "react";
import { Search, User, Trophy, Calendar, Briefcase, Users, Filter, ChevronDown } from "lucide-react";
import aboutImage from "@/assets/about-chess.jpg";
import tournamentImage from "@/assets/tournament.jpg";

const About = () => {
  const { get } = useSiteConfig();
  const { data: players, loading: loadingPlayers } = usePlayers();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'adherents' | 'athletes'>('adherents');
  const [filterCat, setFilterCat] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  const heroTitle      = String(get('about_hero_title',  ''));
  const storyTitle     = String(get('about_story_title', ''));
  const storyParagraphs = (get('about_story_paragraphs', []) as string[]);
  const storyImageUrl  = get('about_story_image_url', null) as string | null;
  const clubName = String(get('club_name', ''));
  const founded  = String(get('club_founded', ''));

  // Séparation Adhérents vs Athlètes
  const dependents = useMemo(() => 
    players.filter(p => p.role && p.role.trim() !== '' && !['joueur', 'athlète'].includes(p.role.toLowerCase())),
  [players]);

  const clubAthletes = useMemo(() => 
    players.filter(p => !p.role || p.role.trim() === '' || ['joueur', 'athlète'].includes(p.role.toLowerCase())),
  [players]);

  // Options uniques pour les filtres
  const categories = useMemo(() => 
    Array.from(new Set(clubAthletes.map(p => p.categorie).filter(Boolean))).sort(),
  [clubAthletes]);

  const levels = useMemo(() => 
    Array.from(new Set(clubAthletes.map(p => p.niveaux).filter(Boolean))).sort(),
  [clubAthletes]);

  const currentList = activeTab === 'adherents' ? dependents : clubAthletes;

  // Filtrage final
  const filteredData = useMemo(() => {
    return currentList.filter(p => {
      const matchSearch = 
        `${p.nom} ${p.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.fide_id?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (activeTab === 'athletes') {
        const matchCat = filterCat === "all" || p.categorie === filterCat;
        const matchLevel = filterLevel === "all" || p.niveaux === filterLevel;
        return matchSearch && matchCat && matchLevel;
      }
      
      return matchSearch;
    });
  }, [currentList, searchTerm, filterCat, filterLevel, activeTab]);

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

      {/* Story */}
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

      {/* Members & Athletes Section */}
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="container">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4 md:text-4xl">La Vie du Club</h2>
              <p className="text-muted-foreground">Découvrez les visages qui animent le {clubName}.</p>
              
              {/* Navigation Tabs */}
              <div className="flex justify-center mt-10">
                <div className="inline-flex p-1 bg-muted rounded-2xl border shadow-sm">
                  <button 
                    onClick={() => { setActiveTab('adherents'); setSearchTerm(""); setFilterCat("all"); setFilterLevel("all"); }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'adherents' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Briefcase size={16} /> Les Adhérents
                  </button>
                  <button 
                    onClick={() => { setActiveTab('athletes'); setSearchTerm(""); }}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'athletes' ? 'bg-background shadow-md text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Users size={16} /> Nos Athlètes
                  </button>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Search & Filters */}
          <Reveal>
            <div className="mb-10 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-5xl mx-auto">
                {/* Search Bar */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input 
                    type="text" 
                    placeholder={`Rechercher un ${activeTab === 'adherents' ? 'adhérent' : 'athlète'} ou ID FIDE...`} 
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {activeTab === 'athletes' && (
                  <div className="flex gap-3 w-full md:w-auto">
                    {/* Category Filter */}
                    <div className="relative flex-1 md:w-48">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                      <select 
                        className="w-full pl-10 pr-10 py-3.5 rounded-2xl border bg-background appearance-none focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm text-sm font-medium"
                        value={filterCat}
                        onChange={(e) => setFilterCat(e.target.value)}
                      >
                        <option value="all">Catégories</option>
                        {categories.map(c => <option key={c!} value={c!}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                    </div>

                    {/* Level Filter */}
                    <div className="relative flex-1 md:w-48">
                      <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                      <select 
                        className="w-full pl-10 pr-10 py-3.5 rounded-2xl border bg-background appearance-none focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm text-sm font-medium"
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                      >
                        <option value="all">Niveaux</option>
                        {levels.map(l => <option key={l!} value={l!}>{l}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Filter Bagdes (Active summary) */}
              {(filterCat !== "all" || filterLevel !== "all" || searchTerm !== "") && activeTab === 'athletes' && (
                <div className="flex justify-center flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                  <button onClick={() => { setSearchTerm(""); setFilterCat("all"); setFilterLevel("all"); }} className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground hover:text-primary transition-colors">
                    Réinitialiser les filtres
                  </button>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal>
            <div className="space-y-6">
              {/* Mobile View: Cards */}
              <div className="grid gap-4 md:hidden">
                {loadingPlayers ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="bg-card border rounded-2xl p-5 animate-pulse">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-muted" />
                        <div className="h-5 bg-muted rounded w-1/2" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : filteredData.length > 0 ? (
                  filteredData.map((p) => (
                    <div key={p.id} className="bg-card border rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner shrink-0">
                          <User size={22} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-lg leading-tight truncate">{p.nom} {p.prenom}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {activeTab === 'adherents' ? (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide">
                                {p.role}
                              </span>
                            ) : (
                              <>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-100 uppercase">
                                  {p.categorie || '—'}
                                </span>
                                {p.niveaux && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-chess-blue/10 text-chess-blue border border-chess-blue/10 uppercase">
                                    {p.niveaux}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                            <Calendar size={10} /> Naissance
                          </p>
                          <p className="text-xs font-medium">{p.date_naissance || '—'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                            <Trophy size={10} className="text-amber-500" /> ID FIDE
                          </p>
                          <p className="text-xs font-mono font-bold text-primary">{p.fide_id || '—'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground">
                    <Users size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Aucun résultat trouvé</p>
                  </div>
                )}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block bg-card rounded-3xl border shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom & Prénom</th>
                        {activeTab === 'adherents' ? (
                          <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Fonction</th>
                        ) : (
                          <>
                            <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Catégorie</th>
                            <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Niveau</th>
                          </>
                        )}
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Né(e) le</th>
                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">ID FIDE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                    {loadingPlayers ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-8 py-7"><div className="h-5 bg-muted rounded w-40" /></td>
                          <td className="px-8 py-7"><div className="h-4 bg-muted rounded w-28" /></td>
                          <td className="px-8 py-7 text-center"><div className="h-4 bg-muted rounded w-24 mx-auto" /></td>
                          <td className="px-8 py-7"><div className="h-5 bg-muted rounded w-20 ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredData.length > 0 ? (
                      filteredData.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                <User size={22} />
                              </div>
                              <p className="font-bold text-lg text-foreground tracking-tight whitespace-nowrap">{p.nom} {p.prenom}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            {activeTab === 'adherents' ? (
                              <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wide whitespace-nowrap">
                                {p.role}
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-100 whitespace-nowrap">
                                  {p.categorie || '—'}
                                </span>
                              </div>
                            )}
                          </td>
                          {activeTab === 'athletes' && (
                            <td className="px-8 py-6">
                              <span className="text-sm font-bold text-chess-blue">
                                {p.niveaux || '—'}
                              </span>
                            </td>
                          )}
                          <td className="px-8 py-6 text-center">
                            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-lg whitespace-nowrap">
                              <Calendar size={14} className="opacity-50" />
                              {p.date_naissance || '—'}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="inline-flex items-center gap-2 text-sm font-mono font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                              <Trophy size={14} className="text-amber-500" />
                              {p.fide_id || '—'}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-24 text-center text-muted-foreground bg-muted/10">
                          <div className="flex flex-col items-center">
                            <Users size={48} className="opacity-10 mb-4" />
                            <p className="text-lg">Aucun résultat trouvé pour votre recherche</p>
                            <p className="text-xs opacity-60">Essayez de modifier vos filtres ou la recherche</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default About;
