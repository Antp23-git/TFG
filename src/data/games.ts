import darkRealms from "@/assets/games/dark-realms.jpg";
import stellarDrift from "@/assets/games/stellar-drift.jpg";
import neonSyndicate from "@/assets/games/neon-syndicate.jpg";
import hollowWard from "@/assets/games/hollow-ward.jpg";
import wanderlost from "@/assets/games/wanderlost.jpg";
import turboCircuit from "@/assets/games/turbo-circuit.jpg";
import abyssalDepths from "@/assets/games/abyssal-depths.jpg";
import ironThrone from "@/assets/games/iron-throne.jpg";
import meadowValley from "@/assets/games/meadow-valley.jpg";
import fisfOfFury from "@/assets/games/fist-of-fury.jpg";
import roboBounce from "@/assets/games/robo-bounce.jpg";
import shadowProtocol from "@/assets/games/shadow-protocol.jpg";

export interface Game {
  id: string;
  title: string;
  cover: string;
  year: number;
  genre: string;
  developer: string;
  description: string; // <-- AÑADIDO: Ahora DetallesJuego ya no dará error
}

export const games: Game[] = [
  { id: "1", title: "Dark Realms", cover: darkRealms, year: 2024, genre: "RPG de Acción", developer: "FromSoft Games", description: "Un viaje oscuro a través de reinos olvidados donde cada decisión cuenta y el peligro acecha en cada sombra." },
  { id: "2", title: "Stellar Drift", cover: stellarDrift, year: 2025, genre: "Exploración Espacial", developer: "Cosmos Studios", description: "Explora la inmensidad del espacio exterior en una nave personalizada mientras descubres secretos de civilizaciones antiguas." },
  { id: "3", title: "Neon Syndicate", cover: neonSyndicate, year: 2024, genre: "RPG Cyberpunk", developer: "Nightcity Dev", description: "Sobrevive en una metrópolis futurista dominada por corporaciones y sindicatos criminales en este RPG de alta tecnología." },
  { id: "4", title: "Hollow Ward", cover: hollowWard, year: 2023, genre: "Survival Horror", developer: "Dread Works", description: "Te despiertas en un hospital abandonado. Solo tienes una linterna y tus sentidos para escapar de las pesadillas que habitan el lugar." },
  { id: "5", title: "Wanderlost", cover: wanderlost, year: 2025, genre: "Mundo Abierto", developer: "Horizon Labs", description: "Un vasto mundo abierto lleno de vida, misterios y libertad total para forjar tu propio destino como explorador." },
  { id: "6", title: "Turbo Circuit", cover: turboCircuit, year: 2024, genre: "Carreras", developer: "Velocity Games", description: "Siente la velocidad extrema en circuitos futuristas donde la gravedad es solo una sugerencia y la victoria es para los audaces." },
  { id: "7", title: "Abyssal Depths", cover: abyssalDepths, year: 2023, genre: "Exploración", developer: "Deep Blue Studio", description: "Sumérgete en lo desconocido. Gestiona tu oxígeno y tu presión mientras descubres la belleza y el terror del océano profundo." },
  { id: "8", title: "Iron Throne", cover: ironThrone, year: 2025, genre: "Estrategia", developer: "Empire Forge", description: "Lidera tus ejércitos, gestiona tus recursos y conquista territorios enemigos para reclamar el trono de hierro en este simulador táctico." },
  { id: "9", title: "Meadow Valley", cover: meadowValley, year: 2024, genre: "Simulador de Granjas", developer: "Cozy Pixel", description: "Relájate en tu propia granja, cultiva vegetales, cría animales y haz amigos en este encantador simulador de vida rural." },
  { id: "10", title: "Fist of Fury", cover: fisfOfFury, year: 2023, genre: "Lucha", developer: "Thunder Punch", description: "Domina el arte del combate en este juego de lucha frenético con un elenco de personajes únicos y movimientos espectaculares." },
  { id: "11", title: "Robo Bounce", cover: roboBounce, year: 2025, genre: "Plataformas", developer: "Pixel Hop", description: "Ayuda a un pequeño robot a saltar a través de niveles coloridos y llenos de puzles mecánicos en esta aventura de plataformas." },
  { id: "12", title: "Shadow Protocol", cover: shadowProtocol, year: 2024, genre: "Acción y Sigilo", developer: "Ghost Ops", description: "Infiltrate en instalaciones enemigas sin ser detectado. Usa gadgets de última generación y acaba con tus objetivos desde las sombras." },
];