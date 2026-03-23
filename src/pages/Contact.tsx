import Layout from "@/components/Layout";
import Reveal from "@/components/Reveal";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSupabase";

const Contact = () => {
  const { get } = useSiteConfig();

  const address  = String(get('club_address', '12 Rue de la Tour, 75016 Paris'));
  const email    = String(get('club_email',   'contact@echiquier-royal.fr'));
  const phone    = String(get('club_phone',   '01 42 88 77 66'));
  const schedule = (get('schedule', [
    { day: "Mardi",  hours: "18h – 21h" },
    { day: "Jeudi",  hours: "18h – 21h" },
    { day: "Samedi", hours: "14h – 18h" },
  ]) as { day: string; hours: string }[]);

  const infos = [
    {
      icon: MapPin,
      label: "Adresse",
      content: <p>{address}</p>,
    },
    {
      icon: Mail,
      label: "Email",
      content: <a href={`mailto:${email}`} className="hover:underline" style={{ color: "hsl(var(--chess-blue))" }}>{email}</a>,
    },
    {
      icon: Phone,
      label: "Téléphone",
      content: <a href={`tel:${phone}`} className="hover:underline" style={{ color: "hsl(var(--chess-blue))" }}>{phone}</a>,
    },
    {
      icon: Clock,
      label: "Horaires",
      content: (
        <div className="space-y-1">
          {Array.isArray(schedule) && schedule.map((h, i) => (
            <p key={i}>{h.day} : {h.hours}</p>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 md:py-28 text-white"
        style={{ background: "linear-gradient(135deg, hsl(var(--chess-blue-dark)), hsl(var(--chess-blue)))" }}>
        <div className="container">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: "hsl(var(--chess-gold))" }}>Contact</p>
            <h1 className="text-4xl font-bold md:text-5xl max-w-2xl text-balance leading-[1.1]">
              Venez nous rencontrer
            </h1>
            <p className="mt-4 text-white/50 max-w-lg">
              Retrouvez toutes les informations pour nous contacter ou venir en séance.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Infos */}
      <section className="py-20 md:py-28">
        <div className="container max-w-2xl">
          <Reveal>
            <div className="grid gap-5 sm:grid-cols-2">
              {infos.map((info) => (
                <div key={info.label} className="rounded-2xl border bg-card p-6 shadow-sm flex items-start gap-4"
                  style={{ borderColor: "hsl(var(--chess-silver-light)/0.5)" }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "hsl(var(--chess-blue)/0.08)" }}>
                    <info.icon size={18} style={{ color: "hsl(var(--chess-gold))" }} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-1">{info.label}</p>
                    <div className="text-sm text-muted-foreground leading-relaxed">{info.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
