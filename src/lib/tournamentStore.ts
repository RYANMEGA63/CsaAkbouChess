export interface Tournament {
  id: number;
  date: string;
  title: string;
  cadence: string;
  type: string;
  rounds: number;
  location: string;
  spots: number;
  total: number;
  description: string;
  price: string;
  arbitre: string;
  homologue: boolean;
  niveaux: string;
  contact: string;
  fichesTechniquesUrls: string[];   // Plusieurs fiches techniques côte à côte
  photosUrls: string[];             // Galerie de photos
}

import heroImage from "@/assets/hero-chess.jpg";
import tournamentImage from "@/assets/tournament.jpg";
import aboutImage from "@/assets/about-chess.jpg";

export const defaultTournaments: Tournament[] = [
  {
    id: 1,
    date: "5 Avril 2026",
    title: "Tournoi Blitz Printanier",
    cadence: "3+2",
    type: "Blitz",
    rounds: 9,
    location: "Salle du club",
    spots: 12,
    total: 32,
    description: "Le grand rendez-vous blitz du printemps ! Venez vous mesurer à d'autres joueurs dans une ambiance détendue et festive. Le tournoi se déroule en système suisse sur 9 rondes, idéal pour tester vos réflexes et votre gestion du temps.",
    price: "Gratuit pour les membres · 5€ pour les non-membres",
    arbitre: "Jean-Pierre Morel (arbitre régional FFE)",
    homologue: true,
    niveaux: "Tous niveaux acceptés",
    contact: "bureau@echiquierroyal.fr",
    fichesTechniquesUrls: [tournamentImage],
    photosUrls: [heroImage, aboutImage],
  },
  {
    id: 2,
    date: "19 Avril 2026",
    title: "Championnat Inter-clubs — Ronde 6",
    cadence: "90+30",
    type: "Classique",
    rounds: 1,
    location: "Club adverse (déplacement)",
    spots: 0,
    total: 8,
    description: "6e ronde du championnat inter-clubs Île-de-France. Événement réservé aux membres de l'équipe sélectionnée.",
    price: "Gratuit (frais de déplacement pris en charge par le club)",
    arbitre: "Arbitre du club adverse",
    homologue: true,
    niveaux: "Équipe sélectionnée uniquement",
    contact: "capitaine@echiquierroyal.fr",
    fichesTechniquesUrls: [],
    photosUrls: [],
  },
  {
    id: 3,
    date: "3 Mai 2026",
    title: "Open de Paris — Cadence rapide",
    cadence: "15+10",
    type: "Rapide",
    rounds: 7,
    location: "Mairie du 16e",
    spots: 24,
    total: 64,
    description: "L'Open de Paris en cadence rapide est l'un des tournois les plus courus de la région ! 7 rondes suisses, des prix attractifs et un public de haut niveau.",
    price: "10€ avant le 25 avril · 15€ sur place",
    arbitre: "Marie Blanc (arbitre national FFE)",
    homologue: true,
    niveaux: "Elo 1200 minimum recommandé",
    contact: "openrapide@paris-echecs.fr",
    fichesTechniquesUrls: [heroImage, tournamentImage],
    photosUrls: [aboutImage],
  },
  {
    id: 4,
    date: "17 Mai 2026",
    title: "Simultanée avec GM Laurent Fressinet",
    cadence: "—",
    type: "Exhibition",
    rounds: 1,
    location: "Salle du club",
    spots: 8,
    total: 20,
    description: "Une occasion unique de jouer contre le Grandmaster Laurent Fressinet (Elo 2650) lors d'une simultanée exceptionnelle ! Soirée conviviale, petits fours et boissons offerts après la partie.",
    price: "15€ par joueur (places très limitées !)",
    arbitre: "Non arbitré (exhibition)",
    homologue: false,
    niveaux: "Tous niveaux — une expérience inoubliable !",
    contact: "evenements@echiquierroyal.fr",
    fichesTechniquesUrls: [aboutImage],
    photosUrls: [heroImage, tournamentImage],
  },
  {
    id: 5,
    date: "7 Juin 2026",
    title: "Championnat Interne — Phase finale",
    cadence: "60+30",
    type: "Classique",
    rounds: 3,
    location: "Salle du club",
    spots: 0,
    total: 8,
    description: "La grande finale du championnat interne 2025–2026 ! Les 8 meilleurs joueurs de la phase de poules s'affrontent pour le titre de champion du club.",
    price: "Gratuit (membres qualifiés uniquement)",
    arbitre: "Jean-Pierre Morel",
    homologue: false,
    niveaux: "Qualifiés uniquement",
    contact: "bureau@echiquierroyal.fr",
    fichesTechniquesUrls: [],
    photosUrls: [],
  },
];
