import { useState } from "react";
import { Search } from "lucide-react";
import { games } from "@/data/games";
import { GameCard } from "@/components/GameCard";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");

  // Obtenemos los géneros únicos de la lista de juegos
  const genres = ["all", ...Array.from(new Set(games.map((g) => g.genre)))];

  const filtered = games.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genreFilter === "all" || g.genre === genreFilter;
    return matchSearch && matchGenre;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 space-y-8">
        
        {/* Cabecera de la página: Eslogan y Descripción */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Tu vida, juego a juego.
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-[600px] text-balance">
            Puntúa, registra y archiva cada juego. Tu diario gaming personal.
          </p>
        </div>

        {/* Sección de Búsqueda y Filtros Corregida */}
        <div className="space-y-6 pt-2">
          {/* Barra de búsqueda - Ahora con más presencia */}
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-muted/40 border-border focus:bg-muted focus:ring-1 focus:ring-primary transition-all text-base rounded-xl"
            />
          </div>

          {/* Filtros de Géneros - Estilo "Píldora" con mejor espaciado */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
              Filtrar por género
            </span>
            <div className="flex gap-2 flex-wrap items-center">
              {genres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setGenreFilter(genre)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    genreFilter === genre
                      ? "bg-primary border-primary text-primary-foreground shadow-md scale-105"
                      : "bg-transparent border-border text-muted-foreground hover:border-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {genre === "all" ? "Todos" : genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rejilla de Juegos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pt-4">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {/* Mensaje de no resultados */}
        {filtered.length === 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground text-lg">No se han encontrado juegos con esos criterios.</p>
            <button 
              onClick={() => {setSearch(""); setGenreFilter("all");}}
              className="text-primary font-medium hover:underline mt-3 block w-full"
            >
              Restablecer búsqueda
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;