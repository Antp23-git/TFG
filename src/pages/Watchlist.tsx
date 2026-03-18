import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import { useGameStore } from "@/store/gameStore";
import { games } from "@/data/games";

const Watchlist = () => {
  const { watchlist } = useGameStore();
  const watchlistGames = games.filter((g) => watchlist.includes(g.id));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 space-y-6">
        <div>
          <h1 className="font-display text-2xl text-foreground">Pendientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Juegos que quieres jugar más tarde.
          </p>
        </div>

        {watchlistGames.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            Aún no has añadido juegos a tu lista de pendientes.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlistGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Watchlist;
