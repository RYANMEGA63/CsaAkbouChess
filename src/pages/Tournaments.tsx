import Layout from "@/components/Layout";
import Reveal from "@/components/Reveal";
import { useState } from "react";
import { Calendar, Clock, Users, MapPin, X, ChevronRight, UserPlus, Building2, Plus, Trash2, CheckCircle, FileImage, Loader2 } from "lucide-react";
import { useTournaments, submitRegistration } from "@/hooks/useSupabase";
import { Tournament } from "@/lib/supabase";
import { toast } from "sonner";

const Lightbox = ({ photos, index, onClose }: { photos: string[]; index: number; onClose: () => void }) => {
  const [current, setCurrent] = useState(index);
  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-10"><X size={28} /></button>
      <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <img src={photos[current]} alt="" className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        {photos.length > 1 && (
          <>
            <div className="flex justify-center gap-2 mt-4">
              {photos.map((_, i) => <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/30"}`} />)}
            </div>
            <button onClick={() => setCurrent((current - 1 + photos.length) % photos.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/10 hover:bg-white/25 text-white rounded-full w-11 h-11 flex items-center justify-center text-xl">‹</button>
            <button onClick={() => setCurrent((current + 1) % photos.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/10 hover:bg-white/25 text-white rounded-full w-11 h-11 flex items-center justify-center text-xl">›</button>
          </>
        )}
      </div>
    </div>
  );
};

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

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30";
  const fiches = tournament.fiches_techniques_urls || [];

  const keyInfos = [
    { icon: Clock, label: "Cadence", value: tournament.cadence },
    { icon: Users, label: "Rondes", value: `${tournament.rounds} ronde${tournament.rounds > 1 ? "s" : ""}` },
    { icon: Users, label: "Niveaux", value: tournament.niveaux },
    { icon: MapPin, label: "Lieu", value: tournament.location },
  ];

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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card w-full max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b shrink-0 text-white"
          style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "hsl(var(--chess-gold)/0.25)", color: "hsl(var(--chess-gold-light))" }}>{tournament.type}</span>
            <h2 className="text-xl font-bold mt-2 leading-tight">{tournament.title}</h2>
            <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5"><Calendar size={13} /> {tournament.date}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white mt-1 shrink-0"><X size={22} /></button>
        </div>

        <div className="overflow-y-auto flex-1">
          {step === "detail" && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                {keyInfos.map(item => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl px-4 py-3 border"
                    style={{ background: "hsl(var(--chess-blue)/0.04)", borderColor: "hsl(var(--chess-blue)/0.12)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "hsl(var(--chess-blue)/0.1)" }}>
                      <item.icon size={15} style={{ color: "hsl(var(--chess-blue))" }} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold">{item.value || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>

              {fiches.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <FileImage size={13} /> Fiche{fiches.length > 1 ? "s" : ""} technique{fiches.length > 1 ? "s" : ""}
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {fiches.map((url, i) => (
                      <div key={i} className="relative flex-shrink-0 cursor-pointer group rounded-xl overflow-hidden border shadow-sm"
                        style={{ width: fiches.length === 1 ? "100%" : fiches.length === 2 ? "calc(50% - 6px)" : 260 }}
                        onClick={e => { e.stopPropagation(); onOpenLightbox(fiches, i); }}>
                        <img src={url} alt={`Fiche ${i + 1}`} className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          style={{ height: fiches.length === 1 ? 400 : 340 }} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end">
                          <div className="w-full bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                            <p className="text-white text-xs font-semibold">{fiches.length > 1 ? `Fiche ${i + 1}` : "Fiche technique"} — agrandir</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tournament.is_past ? (
                /* Podium pour tournoi finis */
                <div className="rounded-xl border p-4 space-y-3" style={{ background: "hsl(var(--chess-blue)/0.04)", borderColor: "hsl(var(--chess-blue)/0.12)" }}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Résultats</p>
                  <div className="flex flex-col gap-2">
                    {tournament.podium_1 && (
                      <div className="flex items-center gap-3 bg-card rounded-lg px-4 py-2.5 shadow-sm">
                        <span className="text-xl">🥇</span>
                        <div>
                          <p className="text-xs text-muted-foreground">1ère place</p>
                          <p className="font-semibold text-sm">{tournament.podium_1}</p>
                        </div>
                      </div>
                    )}
                    {tournament.podium_2 && (
                      <div className="flex items-center gap-3 bg-card rounded-lg px-4 py-2.5 shadow-sm">
                        <span className="text-xl">🥈</span>
                        <div>
                          <p className="text-xs text-muted-foreground">2ème place</p>
                          <p className="font-semibold text-sm">{tournament.podium_2}</p>
                        </div>
                      </div>
                    )}
                    {tournament.podium_3 && (
                      <div className="flex items-center gap-3 bg-card rounded-lg px-4 py-2.5 shadow-sm">
                        <span className="text-xl">🥉</span>
                        <div>
                          <p className="text-xs text-muted-foreground">3ème place</p>
                          <p className="font-semibold text-sm">{tournament.podium_3}</p>
                        </div>
                      </div>
                    )}
                    {!tournament.podium_1 && !tournament.podium_2 && !tournament.podium_3 && tournament.winner && (
                      <div className="flex items-center gap-3 bg-card rounded-lg px-4 py-2.5 shadow-sm">
                        <span className="text-xl">{tournament.winner_medal || "🏆"}</span>
                        <div>
                          <p className="text-xs text-muted-foreground">Vainqueur</p>
                          <p className="font-semibold text-sm">{tournament.winner}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {tournament.participants && (
                    <p className="text-xs text-muted-foreground">{tournament.participants} participants</p>
                  )}
                  {tournament.winner_note && (
                    <p className="text-xs text-muted-foreground italic">"{tournament.winner_note}"</p>
                  )}
                </div>
              ) : (
                <button onClick={() => setStep("form")}
                  className="w-full rounded-xl py-3 font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110"
                  style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
                  S'inscrire à ce tournoi <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}

          {step === "form" && (
            <div className="p-6 space-y-5">
              <button onClick={() => setStep("detail")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">← Retour</button>
              <h3 className="font-bold text-base">Inscription — {tournament.title}</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: "solo" as const, icon: UserPlus, title: "Inscription individuelle", desc: "Je m'inscris seul(e)" },
                  { type: "club" as const, icon: Building2, title: "Inscription d'un club", desc: "J'inscris plusieurs joueurs" },
                ].map(opt => (
                  <button key={opt.type} onClick={() => setInscriptionType(opt.type)}
                    className={`rounded-xl border-2 p-4 text-left transition-all ${inscriptionType === opt.type ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                    <opt.icon size={20} className={inscriptionType === opt.type ? "text-primary" : "text-muted-foreground"} />
                    <p className="font-semibold text-sm mt-2">{opt.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {inscriptionType === "solo" && (
                <div className="space-y-3 border-t pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-medium mb-1 block">Nom *</label><input className={inputCls} value={soloForm.nom} onChange={e => setSoloForm({ ...soloForm, nom: e.target.value })} /></div>
                    <div><label className="text-xs font-medium mb-1 block">Prénom *</label><input className={inputCls} value={soloForm.prenom} onChange={e => setSoloForm({ ...soloForm, prenom: e.target.value })} /></div>
                  </div>
                  <div><label className="text-xs font-medium mb-1 block">FIDE ID <span className="text-muted-foreground font-normal">(optionnel)</span></label><input className={inputCls} placeholder="Ex : 12345678" value={soloForm.fideId} onChange={e => setSoloForm({ ...soloForm, fideId: e.target.value })} /></div>
                  <div><label className="text-xs font-medium mb-1 block">Club</label><input className={inputCls} value={soloForm.club} onChange={e => setSoloForm({ ...soloForm, club: e.target.value })} /></div>
                  <button onClick={handleSubmit} disabled={submitting || !soloForm.nom || !soloForm.prenom}
                    className="w-full rounded-xl py-3 font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
                    {submitting && <Loader2 size={14} className="animate-spin" />} Valider mon inscription
                  </button>
                </div>
              )}

              {inscriptionType === "club" && (
                <div className="space-y-3 border-t pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="text-xs font-medium mb-1 block">Nom du club *</label><input className={inputCls} value={clubForm.nomClub} onChange={e => setClubForm({ ...clubForm, nomClub: e.target.value })} /></div>
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
                        <div key={i} className="flex gap-2 items-center bg-muted/30 rounded-lg p-2">
                          <span className="text-xs font-bold text-muted-foreground w-5 text-center shrink-0">{i + 1}</span>
                          <input placeholder="Nom" value={j.nom} onChange={e => updateJoueur(i, "nom", e.target.value)} className="flex-1 border rounded-md px-2 py-1.5 text-xs bg-background focus:outline-none" />
                          <input placeholder="Prénom" value={j.prenom} onChange={e => updateJoueur(i, "prenom", e.target.value)} className="flex-1 border rounded-md px-2 py-1.5 text-xs bg-background focus:outline-none" />
                          <input placeholder="FIDE ID" value={j.fideId} onChange={e => updateJoueur(i, "fideId", e.target.value)} className="w-24 border rounded-md px-2 py-1.5 text-xs bg-background focus:outline-none" />
                          {joueurs.length > 1 && <button onClick={() => removeJoueur(i)} className="text-muted-foreground hover:text-red-500"><Trash2 size={13} /></button>}
                        </div>
                      ))}
                    </div>
                    <button onClick={addJoueur} className="mt-2 flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: "hsl(var(--chess-blue))" }}>
                      <Plus size={14} /> Ajouter un joueur
                    </button>
                  </div>
                  <button onClick={handleSubmit} disabled={submitting || !clubForm.nomClub || !clubForm.responsable}
                    className="w-full rounded-xl py-3 font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50"
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
              <p className="text-xs text-muted-foreground">Questions : <span className="font-medium">{tournament.contact}</span></p>
              <button onClick={onClose} className="mt-2 text-white rounded-xl px-6 py-2.5 font-semibold text-sm"
                style={{ background: "hsl(var(--chess-blue))" }}>Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Tournaments = () => {
  const [selected, setSelected] = useState<Tournament | null>(null);
  const [lightboxData, setLightboxData] = useState<{ photos: string[]; index: number } | null>(null);
  const { data: all, loading } = useTournaments();

  const upcoming = all.filter(t => !t.is_past);
  const past     = all.filter(t => t.is_past);

  return (
    <Layout>
      {lightboxData && <Lightbox photos={lightboxData.photos} index={lightboxData.index} onClose={() => setLightboxData(null)} />}
      {selected && <TournamentModal tournament={selected} onClose={() => setSelected(null)} onOpenLightbox={(photos, index) => setLightboxData({ photos, index })} />}

      <section className="py-20 md:py-28 text-white"
        style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
        <div className="container">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: "hsl(var(--chess-gold))" }}>Compétitions</p>
            <h1 className="text-4xl font-bold md:text-5xl max-w-2xl text-balance leading-[1.1]">Nos tournois et événements</h1>
            <p className="mt-6 text-white/50 max-w-lg">Du blitz amical au championnat homologué, trouvez l'événement qui correspond à votre niveau.</p>
          </Reveal>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container">
          <Reveal><h2 className="text-3xl font-bold mb-10">Prochains tournois</h2></Reveal>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-primary" /></div>
          ) : upcoming.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">Aucun tournoi à venir pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {upcoming.map((t, i) => (
                <Reveal key={t.id} delay={i * 60}>
                  <div className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary/30 group"
                    style={{ borderColor: "hsl(var(--chess-silver-light)/0.5)" }}
                    onClick={() => setSelected(t)}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex gap-4 flex-1">
                        {t.fiches_techniques_urls?.[0] && (
                          <div className="relative hidden sm:block shrink-0">
                            <img src={t.fiches_techniques_urls[0]} alt="" className="w-16 h-16 object-cover rounded-xl border shadow-sm" />
                            {t.fiches_techniques_urls.length > 1 && (
                              <span className="absolute -bottom-1 -right-1 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow"
                                style={{ background: "hsl(var(--chess-blue))" }}>
                                +{t.fiches_techniques_urls.length - 1}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="rounded-full px-3 py-0.5 text-xs font-semibold" style={{ background: "hsl(var(--chess-gold)/0.12)", color: "hsl(var(--chess-gold-dark))" }}>{t.type}</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar size={14} /> {t.date}</span>
                            {t.homologue && <span className="text-xs text-green-600 font-medium hidden sm:block">✓ Homologué</span>}
                          </div>
                          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{t.title}</h3>
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { icon: Clock, label: "Cadence", value: t.cadence },
                              { icon: Users, label: "Rondes", value: `${t.rounds} ronde${t.rounds > 1 ? "s" : ""}` },
                              { icon: Users, label: "Niveaux", value: t.niveaux },
                              { icon: MapPin, label: "Lieu", value: t.location },
                            ].map(info => (
                              <div key={info.label} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                                style={{ background: "hsl(var(--chess-silver-light)/0.2)" }}>
                                <info.icon size={12} style={{ color: "hsl(var(--chess-gold))", flexShrink: 0 }} />
                                <div className="min-w-0">
                                  <p className="text-[10px] text-muted-foreground leading-none mb-0.5">{info.label}</p>
                                  <p className="text-xs font-semibold truncate">{info.value || "—"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-3 md:flex-col md:items-end">
                        <span className="text-white rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap"
                          style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
                          Voir & S'inscrire <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4 text-center">Cliquez sur un tournoi pour voir sa fiche et vous inscrire</p>
        </div>
      </section>

      <section className="py-20 md:py-28" style={{ background: "hsl(var(--chess-cream-dark))" }}>
        <div className="container">
          <Reveal><h2 className="text-3xl font-bold mb-10">Derniers résultats</h2></Reveal>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-primary" /></div>
          ) : past.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Aucun résultat enregistré.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {past.map((t, i) => (
                <Reveal key={t.id} delay={i * 80}>
                  <div
                    className="rounded-2xl border bg-card shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group hover:border-primary/30"
                    onClick={() => setSelected(t)}
                  >
                    <div className="relative h-40 overflow-hidden">
                      {t.fiches_techniques_urls?.[0] ? (
                        <img src={t.fiches_techniques_urls[0]} alt={t.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: "hsl(var(--chess-blue)/0.1)" }}>
                          <Trophy size={32} style={{ color: "hsl(var(--chess-gold))" }} />
                        </div>
                      )}
                      <div className="absolute inset-0" style={{ background: "hsl(var(--chess-blue)/0.4)" }} />
                      {/* Podium */}
                      <div className="absolute top-3 left-3 right-3 flex gap-1 flex-wrap">
                        {t.podium_1 && <span className="bg-white/90 text-xs font-bold px-2 py-0.5 rounded-full shadow">🥇 {t.podium_1.split(" ")[0]}</span>}
                        {t.podium_2 && <span className="bg-white/90 text-xs font-bold px-2 py-0.5 rounded-full shadow">🥈 {t.podium_2.split(" ")[0]}</span>}
                        {t.podium_3 && <span className="bg-white/90 text-xs font-bold px-2 py-0.5 rounded-full shadow">🥉 {t.podium_3.split(" ")[0]}</span>}
                        {!t.podium_1 && t.winner_medal && (
                          <span className="bg-white/90 text-sm font-bold px-2.5 py-1 rounded-full shadow">
                            {t.winner_medal} {t.winner?.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      {/* Hint cliquable */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium text-center">Voir les détails</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-semibold mb-1" style={{ color: "hsl(var(--chess-gold-dark))" }}>{t.date}</p>
                      <h3 className="font-semibold text-sm leading-tight">{t.title}</h3>
                      {t.participants && <p className="text-xs text-muted-foreground mt-1">{t.participants} participants</p>}
                      {t.winner_note && <p className="text-xs text-muted-foreground mt-2 italic">"{t.winner_note}"</p>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Tournaments;
