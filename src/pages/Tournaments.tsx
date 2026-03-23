import Layout from "@/components/Layout";
import Reveal from "@/components/Reveal";
import { useState, useMemo } from "react";
import { Calendar, Clock, Users, MapPin, X, ChevronRight, UserPlus, Building2, Plus, Trash2, CheckCircle, FileImage, Loader2, Search, Trophy, ChevronLeft, Lock } from "lucide-react";
import { useTournaments, submitRegistration } from "@/hooks/useSupabase";
import { Tournament } from "@/lib/supabase";
import { toast } from "sonner";

// ── Statut automatique selon la date ─────────────────────────────
function getTournamentStatus(t: Tournament): 'bientot' | 'aujourdhui' | 'finis' {
  if (t.is_past) return 'finis'
  if (!t.date_iso) return 'bientot'
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(t.date_iso); d.setHours(0, 0, 0, 0)
  const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'finis'
  if (diff === 0) return 'aujourdhui'
  return 'bientot'
}

const STATUS_STYLES = {
  bientot:    { label: 'Bientôt',     cls: 'bg-blue-100 text-blue-700' },
  aujourdhui: { label: "Aujourd'hui", cls: 'bg-green-100 text-green-700' },
  finis:      { label: 'Terminé',     cls: 'bg-gray-100 text-gray-500'  },
}

// ── Lightbox ──────────────────────────────────────────────────────
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

// ── Modal tournoi ─────────────────────────────────────────────────
const TournamentModal = ({ tournament, onClose, onOpenLightbox }: {
  tournament: Tournament;
  onClose: () => void;
  onOpenLightbox: (photos: string[], index: number) => void;
}) => {
  const [step, setStep] = useState<"detail" | "form" | "success">("detail");
  const [inscriptionType, setInscriptionType] = useState<"solo" | "club" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [soloForm, setSoloForm] = useState({ nom: "", prenom: "", fideId: "", club: "" });
  const [clubForm, setClubForm] = useState({ nomClub: "", responsable: "", telephone: "" });
  const [joueurs, setJoueurs] = useState([{ nom: "", prenom: "", fideId: "" }]);

  const addJoueur = () => setJoueurs([...joueurs, { nom: "", prenom: "", fideId: "" }]);
  const removeJoueur = (i: number) => setJoueurs(joueurs.filter((_, idx) => idx !== i));
  const updateJoueur = (i: number, field: string, value: string) =>
    setJoueurs(joueurs.map((j, idx) => idx === i ? { ...j, [field]: value } : j));

  const inputCls = "w-full border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";
  const fiches = tournament.fiches_techniques_urls || [];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (inscriptionType === 'solo') {
        await submitRegistration({ tournament_id: tournament.id, type: 'solo', nom: soloForm.nom, prenom: soloForm.prenom, fide_id: soloForm.fideId, club: soloForm.club });
      } else {
        await submitRegistration({ tournament_id: tournament.id, type: 'club', nom_club: clubForm.nomClub, responsable: clubForm.responsable, telephone: clubForm.telephone, joueurs });
      }
      setStep("success");
    } catch {
      toast.error("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[92vh] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 md:px-6 py-4 border-b shrink-0 text-white"
          style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
          <div className="min-w-0">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "hsl(var(--chess-gold)/0.25)", color: "hsl(var(--chess-gold-light))" }}>{tournament.type}</span>
            <h2 className="text-lg md:text-xl font-bold mt-1.5 leading-tight">{tournament.title}</h2>
            <p className="text-white/60 text-xs md:text-sm mt-1 flex items-center gap-1.5"><Calendar size={12} /> {tournament.date}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white mt-1 shrink-0 p-1"><X size={20} /></button>
        </div>

        <div className="overflow-y-auto flex-1 overscroll-contain">
          {step === "detail" && (
            <div className="p-4 md:p-6 space-y-5">
              {/* Infos clés */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                {[
                  { icon: Clock, label: "Cadence", value: tournament.cadence },
                  { icon: Users, label: "Rondes", value: `${tournament.rounds} ronde${tournament.rounds > 1 ? "s" : ""}` },
                  { icon: Users, label: "Niveaux", value: tournament.niveaux },
                  { icon: MapPin, label: "Lieu", value: tournament.location },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 border"
                    style={{ background: "hsl(var(--chess-blue)/0.04)", borderColor: "hsl(var(--chess-blue)/0.12)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "hsl(var(--chess-blue)/0.1)" }}>
                      <item.icon size={14} style={{ color: "hsl(var(--chess-blue))" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">{item.label}</p>
                      <p className="text-xs md:text-sm font-semibold truncate">{item.value || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {tournament.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{tournament.description}</p>
              )}

              {/* Fiches techniques */}
              {fiches.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <FileImage size={12} /> Fiche{fiches.length > 1 ? "s" : ""} technique{fiches.length > 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
                    {fiches.map((url, i) => (
                      <div key={i}
                        className="relative flex-shrink-0 cursor-pointer group rounded-xl overflow-hidden border shadow-sm"
                        style={{ width: fiches.length === 1 ? "100%" : fiches.length === 2 ? "calc(50% - 5px)" : 220 }}
                        onClick={e => { e.stopPropagation(); onOpenLightbox(fiches, i); }}>
                        <img src={url} alt={`Fiche ${i + 1}`}
                          className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          style={{ height: fiches.length === 1 ? 320 : 260 }} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end">
                          <div className="w-full bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                            <p className="text-white text-xs font-semibold">Agrandir</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Podium ou bouton inscription */}
              {tournament.is_past ? (
                <div className="rounded-xl border p-4 space-y-3" style={{ background: "hsl(var(--chess-blue)/0.04)", borderColor: "hsl(var(--chess-blue)/0.12)" }}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Résultats</p>
                  <div className="flex flex-col gap-2">
                    {tournament.podium_1 && <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-2.5 shadow-sm"><span className="text-xl">🥇</span><div><p className="text-[10px] text-muted-foreground">1ère place</p><p className="font-semibold text-sm">{tournament.podium_1}</p></div></div>}
                    {tournament.podium_2 && <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-2.5 shadow-sm"><span className="text-xl">🥈</span><div><p className="text-[10px] text-muted-foreground">2ème place</p><p className="font-semibold text-sm">{tournament.podium_2}</p></div></div>}
                    {tournament.podium_3 && <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-2.5 shadow-sm"><span className="text-xl">🥉</span><div><p className="text-[10px] text-muted-foreground">3ème place</p><p className="font-semibold text-sm">{tournament.podium_3}</p></div></div>}
                    {!tournament.podium_1 && tournament.winner && <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-2.5 shadow-sm"><span className="text-xl">{tournament.winner_medal || "🏆"}</span><div><p className="text-[10px] text-muted-foreground">Vainqueur</p><p className="font-semibold text-sm">{tournament.winner}</p></div></div>}
                  </div>
                  {tournament.participants && <p className="text-xs text-muted-foreground">{tournament.participants} participants</p>}
                  {tournament.winner_note && <p className="text-xs text-muted-foreground italic">"{tournament.winner_note}"</p>}
                </div>
              ) : tournament.registrations_closed ? (
                <div className="w-full rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 border-2 border-red-200 bg-red-50 text-red-600">
                  🔒 Inscriptions clôturées
                </div>
              ) : (
                <button onClick={() => setStep("form")}
                  className="w-full rounded-xl py-3.5 font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
                  S'inscrire à ce tournoi <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}

          {step === "form" && (
            <div className="p-4 md:p-6 space-y-5">
              <button onClick={() => setStep("detail")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5">
                <ChevronLeft size={14} /> Retour
              </button>
              <h3 className="font-bold text-base">Inscription — {tournament.title}</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: "solo" as const, icon: UserPlus, title: "Individuelle", desc: "Je m'inscris seul(e)" },
                  { type: "club" as const, icon: Building2, title: "Club", desc: "Plusieurs joueurs" },
                ].map(opt => (
                  <button key={opt.type} onClick={() => setInscriptionType(opt.type)}
                    className={`rounded-xl border-2 p-4 text-left transition-all active:scale-[0.98] ${inscriptionType === opt.type ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                    <opt.icon size={20} className={inscriptionType === opt.type ? "text-primary" : "text-muted-foreground"} />
                    <p className="font-semibold text-sm mt-2">{opt.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {inscriptionType === "solo" && (
                <div className="space-y-3 border-t pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium mb-1 block">Nom *</label><input className={inputCls} value={soloForm.nom} onChange={e => setSoloForm({ ...soloForm, nom: e.target.value })} /></div>
                    <div><label className="text-xs font-medium mb-1 block">Prénom *</label><input className={inputCls} value={soloForm.prenom} onChange={e => setSoloForm({ ...soloForm, prenom: e.target.value })} /></div>
                  </div>
                  <div><label className="text-xs font-medium mb-1 block">FIDE ID <span className="text-muted-foreground">(optionnel)</span></label><input className={inputCls} placeholder="Ex : 12345678" value={soloForm.fideId} onChange={e => setSoloForm({ ...soloForm, fideId: e.target.value })} /></div>
                  <div><label className="text-xs font-medium mb-1 block">Club</label><input className={inputCls} value={soloForm.club} onChange={e => setSoloForm({ ...soloForm, club: e.target.value })} /></div>
                  <button onClick={handleSubmit} disabled={submitting || !soloForm.nom || !soloForm.prenom}
                    className="w-full rounded-xl py-3.5 font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                    style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
                    {submitting && <Loader2 size={14} className="animate-spin" />} Valider mon inscription
                  </button>
                </div>
              )}

              {inscriptionType === "club" && (
                <div className="space-y-3 border-t pt-4">
                  <div><label className="text-xs font-medium mb-1 block">Nom du club *</label><input className={inputCls} value={clubForm.nomClub} onChange={e => setClubForm({ ...clubForm, nomClub: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium mb-1 block">Responsable *</label><input className={inputCls} value={clubForm.responsable} onChange={e => setClubForm({ ...clubForm, responsable: e.target.value })} /></div>
                    <div><label className="text-xs font-medium mb-1 block">Téléphone</label><input type="tel" className={inputCls} value={clubForm.telephone} onChange={e => setClubForm({ ...clubForm, telephone: e.target.value })} /></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Joueurs</p>
                      <span className="text-xs text-muted-foreground">{joueurs.length} joueur{joueurs.length > 1 ? "s" : ""}</span>
                    </div>
                    <div className="space-y-2">
                      {joueurs.map((j, i) => (
                        <div key={i} className="flex gap-1.5 items-center bg-muted/30 rounded-xl p-2">
                          <span className="text-xs font-bold text-muted-foreground w-5 text-center shrink-0">{i + 1}</span>
                          <input placeholder="Nom" value={j.nom} onChange={e => updateJoueur(i, "nom", e.target.value)} className="flex-1 border rounded-lg px-2 py-1.5 text-xs bg-background focus:outline-none min-w-0" />
                          <input placeholder="Prénom" value={j.prenom} onChange={e => updateJoueur(i, "prenom", e.target.value)} className="flex-1 border rounded-lg px-2 py-1.5 text-xs bg-background focus:outline-none min-w-0" />
                          <input placeholder="FIDE" value={j.fideId} onChange={e => updateJoueur(i, "fideId", e.target.value)} className="w-16 border rounded-lg px-2 py-1.5 text-xs bg-background focus:outline-none" />
                          {joueurs.length > 1 && <button onClick={() => removeJoueur(i)} className="text-muted-foreground hover:text-red-500 p-1 shrink-0"><Trash2 size={12} /></button>}
                        </div>
                      ))}
                    </div>
                    <button onClick={addJoueur} className="mt-2 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "hsl(var(--chess-blue))" }}>
                      <Plus size={14} /> Ajouter un joueur
                    </button>
                  </div>
                  <button onClick={handleSubmit} disabled={submitting || !clubForm.nomClub || !clubForm.responsable}
                    className="w-full rounded-xl py-3.5 font-bold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
                    {submitting && <Loader2 size={14} className="animate-spin" />} Valider l'inscription du club
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "success" && (
            <div className="p-10 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle size={32} className="text-green-600" /></div>
              <h3 className="text-xl font-bold">Inscription confirmée !</h3>
              <p className="text-sm text-muted-foreground max-w-sm">Votre inscription au <span className="font-semibold text-foreground">{tournament.title}</span> a bien été enregistrée.</p>
              <button onClick={onClose} className="mt-2 text-white rounded-xl px-6 py-3 font-bold text-sm"
                style={{ background: "hsl(var(--chess-blue))" }}>Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────
const Tournaments = () => {
  const [selected, setSelected] = useState<Tournament | null>(null);
  const [lightboxData, setLightboxData] = useState<{ photos: string[]; index: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pastPage, setPastPage] = useState(0);
  const PAST_PER_PAGE = 8;

  const { data: all, loading } = useTournaments();

  const upcoming = all.filter(t => !t.is_past);
  const past     = all.filter(t => t.is_past);

  const filteredUpcoming = useMemo(() =>
    searchQuery.trim() === "" ? upcoming :
    upcoming.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.niveaux?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [upcoming, searchQuery]);

  const filteredPast = useMemo(() =>
    searchQuery.trim() === "" ? past :
    past.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [past, searchQuery]);

  const totalPastPages = Math.ceil(filteredPast.length / PAST_PER_PAGE);
  const pagedPast = filteredPast.slice(pastPage * PAST_PER_PAGE, (pastPage + 1) * PAST_PER_PAGE);

  return (
    <Layout>
      {lightboxData && <Lightbox photos={lightboxData.photos} index={lightboxData.index} onClose={() => setLightboxData(null)} />}
      {selected && <TournamentModal tournament={selected} onClose={() => setSelected(null)} onOpenLightbox={(photos, index) => setLightboxData({ photos, index })} />}

      {/* Hero */}
      <section className="py-16 md:py-24 text-white"
        style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
        <div className="container">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: "hsl(var(--chess-gold))" }}>Compétitions</p>
            <h1 className="text-3xl md:text-5xl font-bold max-w-2xl text-balance leading-[1.1]">Nos tournois et événements</h1>
            <p className="mt-4 text-white/50 max-w-lg text-sm md:text-base">Du blitz amical au championnat homologué, trouvez l'événement qui correspond à votre niveau.</p>
          </Reveal>
        </div>
      </section>

      {/* Barre de recherche */}
      <div className="sticky top-16 z-30 bg-card/95 backdrop-blur-md border-b shadow-sm">
        <div className="container py-3">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher un tournoi, lieu, type…"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPastPage(0); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prochains tournois */}
      <section className="py-12 md:py-20">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10">Prochains tournois</h2>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-primary" /></div>
          ) : filteredUpcoming.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search size={28} className="mx-auto mb-3 opacity-30" />
              <p>{searchQuery ? "Aucun tournoi ne correspond à cette recherche." : "Aucun tournoi à venir pour le moment."}</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredUpcoming.map((t, i) => (
                <Reveal key={t.id} delay={i * 40}>
                  <div className="rounded-2xl border bg-card p-4 md:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/30 group active:scale-[0.995]"
                    onClick={() => setSelected(t)}>
                    <div className="flex gap-3 md:gap-4">
                      {/* Thumb */}
                      {t.fiches_techniques_urls?.[0] && (
                        <div className="relative shrink-0">
                          <img src={t.fiches_techniques_urls[0]} alt="" className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-xl border shadow-sm" />
                          {t.fiches_techniques_urls.length > 1 && (
                            <span className="absolute -bottom-1 -right-1 text-white text-[9px] font-bold w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shadow"
                              style={{ background: "hsl(var(--chess-blue))" }}>+{t.fiches_techniques_urls.length - 1}</span>
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: "hsl(var(--chess-gold)/0.12)", color: "hsl(var(--chess-gold-dark))" }}>{t.type}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={11} /> {t.date}</span>
                          {t.homologue && <span className="text-xs text-green-600 font-medium">✓ Homologué</span>}
                          {t.registrations_closed && (
                            <span className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-500">
                              <Lock size={9} /> Inscriptions clôturées
                            </span>
                          )}
                        </div>
                        {/* Titre + badge statut côte à côte */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base md:text-lg font-semibold group-hover:text-primary transition-colors leading-snug">{t.title}</h3>
                          {(() => {
                            const s = getTournamentStatus(t)
                            if (s === 'finis') return null
                            const { label, cls } = STATUS_STYLES[s]
                            return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${cls}`}>{label}</span>
                          })()}
                        </div>
                        {/* Infos compactes */}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {[
                            { icon: Clock, value: t.cadence },
                            { icon: Users, value: `${t.rounds} rondes` },
                            { icon: MapPin, value: t.location },
                          ].filter(x => x.value).map((info, idx) => (
                            <span key={idx} className="flex items-center gap-1 text-xs text-muted-foreground">
                              <info.icon size={11} style={{ color: "hsl(var(--chess-gold))", flexShrink: 0 }} />
                              {info.value}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* CTA */}
                      <div className="shrink-0 self-center hidden sm:flex">
                        <span className="text-white rounded-xl px-3 py-2 text-xs md:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap"
                          style={{ background: t.registrations_closed
                            ? "linear-gradient(135deg, #dc2626, #ef4444)"
                            : "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
                          {t.registrations_closed && <Lock size={11} />}
                          Voir <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Derniers résultats avec défilement */}
      {(past.length > 0 || searchQuery) && (
        <section className="py-12 md:py-20" style={{ background: "hsl(var(--muted)/0.3)" }}>
          <div className="container">
            <div className="flex items-center justify-between mb-6 md:mb-10 gap-4">
              <h2 className="text-2xl md:text-3xl font-bold">Derniers résultats</h2>
              {totalPastPages > 1 && (
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setPastPage(p => Math.max(0, p - 1))} disabled={pastPage === 0}
                    className="w-9 h-9 rounded-xl border flex items-center justify-center text-muted-foreground disabled:opacity-30 hover:bg-muted transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-sm text-muted-foreground tabular-nums">{pastPage + 1} / {totalPastPages}</span>
                  <button onClick={() => setPastPage(p => Math.min(totalPastPages - 1, p + 1))} disabled={pastPage === totalPastPages - 1}
                    className="w-9 h-9 rounded-xl border flex items-center justify-center text-muted-foreground disabled:opacity-30 hover:bg-muted transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-primary" /></div>
            ) : filteredPast.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy size={28} className="mx-auto mb-3 opacity-30" />
                <p>{searchQuery ? "Aucun résultat ne correspond à cette recherche." : "Aucun résultat enregistré."}</p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:gap-5 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                  {pagedPast.map((t, i) => (
                    <Reveal key={t.id} delay={i * 50}>
                      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group hover:border-primary/30 active:scale-[0.98]"
                        onClick={() => setSelected(t)}>
                        <div className="relative overflow-hidden" style={{ height: "clamp(120px, 25vw, 160px)" }}>
                          {t.fiches_techniques_urls?.[0] ? (
                            <img src={t.fiches_techniques_urls[0]} alt={t.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: "hsl(var(--chess-blue)/0.1)" }}>
                              <Trophy size={28} style={{ color: "hsl(var(--chess-gold))" }} />
                            </div>
                          )}
                          <div className="absolute inset-0" style={{ background: "hsl(var(--chess-blue)/0.35)" }} />
                          <div className="absolute top-2 left-2 right-2 flex gap-1 flex-wrap">
                            {t.podium_1 && <span className="bg-white/90 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">🥇 {t.podium_1.split(" ")[0]}</span>}
                            {t.podium_2 && <span className="bg-white/90 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">🥈 {t.podium_2.split(" ")[0]}</span>}
                            {!t.podium_1 && t.winner_medal && <span className="bg-white/90 text-xs font-bold px-2 py-0.5 rounded-full shadow">{t.winner_medal}</span>}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-[10px] font-medium text-center">Voir les détails</p>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-[10px] font-semibold mb-0.5" style={{ color: "hsl(var(--chess-gold-dark))" }}>{t.date}</p>
                          <h3 className="font-semibold text-xs md:text-sm leading-tight line-clamp-2">{t.title}</h3>
                          {t.participants && <p className="text-[10px] text-muted-foreground mt-1">{t.participants} participants</p>}
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
                {/* Pagination dots mobile */}
                {totalPastPages > 1 && (
                  <div className="flex justify-center gap-1.5 mt-6">
                    {Array.from({ length: totalPastPages }).map((_, i) => (
                      <button key={i} onClick={() => setPastPage(i)}
                        className={`rounded-full transition-all ${i === pastPage ? "w-6 h-2" : "w-2 h-2"}`}
                        style={{ background: i === pastPage ? "hsl(var(--chess-blue))" : "hsl(var(--muted-foreground)/0.3)" }} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default Tournaments;
