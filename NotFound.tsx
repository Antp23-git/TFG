import darkRealms from "@/assets/games/dark-realms.jpg";
import stellarDrift from "@/assets/games/stellar-drift.jpg";
import neonSyndicate from "@/assets/games/neon-syndicate.jpg";
import hollowWard from "@/assets/games/hollow-ward.jpg";
import wanderlost from "@/assets/games/wanderlost.jpg";
import turboCircuit from "@/assets/games/turbo-circuit.jpg";
import abyssalDepths from "@/assets/games/abyssal-depths.jpg";
import ironThrone from "@/assets/games/iron-throne.jpg";
import meadowValley from "@/assets/games/meadow-valley.jpg";
import fistOfFury from "@/assets/games/fist-of-fury.jpg";
import roboBounce from "@/assets/games/robo-bounce.jpg";
import shadowProtocol from "@/assets/games/shadow-protocol.jpg";

export interface Game {
  id: string;
  title: string;
  cover: string;
  year: number;
  genre: string;
  developer: string;
}

export const games: Game[] = [
  { id: "1", title: "Dark Realms", cover: darkRealms, year: 2024, genre: "Action RPG", developer: "FromSoft Games" },
  { id: "2", title: "Stellar Drift", cover: stellarDrift, year: 2025, genre: "Space Exploration", developer: "Cosmos Studios" },
  { id: "3", title: "Neon Syndicate", cover: neonSyndicate, year: 2024, genre: "Cyberpunk RPG", developer: "Nightcity Dev" },
  { id: "4", title: "Hollow Ward", cover: hollowWard, year: 2023, genre: "Survival Horror", developer: "Dread Works" },
  { id: "5", title: "Wanderlost", cover: wanderlost, year: 2025, genre: "Open World", developer: "Horizon Labs" },
  { id: "6", title: "Turbo Circuit", cover: turboCircuit, year: 2024, genre: "Racing", developer: "Velocity Games" },
  { id: "7", title: "Abyssal Depths", cover: abyssalDepths, year: 2023, genre: "Exploration", developer: "Deep Blue Studio" },
  { id: "8", title: "Iron Throne", cover: ironThrone, year: 2025, genre: "Strategy", developer: "Empire Forge" },
  { id: "9", title: "Meadow Valley", cover: meadowValley, year: 2024, genre: "Farming Sim", developer: "Cozy Pixel" },
  { id: "10", title: "Fist of Fury", cover: fistOfFury, year: 2023, genre: "Fighting", developer: "Thunder Punch" },
  { id: "11", title: "Robo Bounce", cover: roboBounce, year: 2025, genre: "Platformer", developer: "Pixel Hop" },
  { id: "12", title: "Shadow Protocol", cover: shadowProtocol, year: 2024, genre: "Stealth Action", developer: "Ghost Ops" },
];
