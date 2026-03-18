import { useState } from "react";
import { Search } from "lucide-react";
import { games } from "@/data/games";
import { GameCard } from "@/components/GameCard";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");

  const genres = ["all", ...Array.from(new Set(games.map((g) => g.genre)))];

  const filtered = games.filter((g) => {
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchGenre = genreFilter === "all" || g.genre === genreFilter;
    return matchSearch && matchGenre;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl text-foreground">
            Track every world you've lived in.
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-balance">
            Puntúa, registra y archiva cada juego. Tu diario gaming personal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar juegos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted border-border"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setGenreFilter(genre)}
                className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                  genreFilter === genre
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {genre === "all" ? "Todos" : genre}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No se encontraron juegos.</p>
        )}
      </main>
    </div>
  );
};

export default Index;
