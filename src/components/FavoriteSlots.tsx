import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { games } from "@/data/games";
import { useGameStore } from "@/store/gameStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FavoriteSlots() {
  const { profile, setFavorite, removeFavorite, logs } = useGameStore();
  const [pickSlot, setPickSlot] = useState<number | null>(null);
  const favs = profile.favoriteGameIds;

  // Only games that have been rated can be favorites
  const ratedGameIds = logs.map((l) => l.gameId);
  const availableGames = games.filter((g) => ratedGameIds.includes(g.id));

  return (
    <>
      <div>
        <h3 className="text-sm text-muted-foreground mb-3">Juegos favoritos</h3>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((slot) => {
            const gameId = favs[slot];
            const game = gameId ? games.find((g) => g.id === gameId) : null;
            return (
              <motion.div
                key={slot}
                whileTap={{ scale: 0.95 }}
                className="aspect-[2/3] rounded-lg overflow-hidden bg-muted border border-border relative group cursor-pointer"
                onClick={() => setPickSlot(slot)}
              >
                {game ? (
                  <>
                    <img src={game.cover} alt={game.title} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavorite(game.id);
                      }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Plus className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <Dialog open={pickSlot !== null} onOpenChange={() => setPickSlot(null)}>
        <DialogContent className="bg-card border-border max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Elegir favorito</DialogTitle>
          </DialogHeader>
          {availableGames.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Puntúa juegos primero para poder elegirlos como favoritos.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {availableGames.map((game) => (
                <button
                  key={game.id}
                  onClick={() => {
                    if (pickSlot !== null) {
                      setFavorite(pickSlot, game.id);
                      setPickSlot(null);
                    }
                  }}
                  className="aspect-[2/3] rounded-lg overflow-hidden hover:ring-2 ring-primary transition-all"
                >
                  <img src={game.cover} alt={game.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
