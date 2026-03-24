import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, Star } from "lucide-react";
import { games } from "@/data/games";
import { useGameStore } from "@/store/gameStore";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FavoriteSlots() {
  const { profile, updateProfile, logs } = useGameStore();
  const [pickSlot, setPickSlot] = useState<number | null>(null);
  
  // Usamos el estado del store, pero lo sincronizaremos con Supabase
  const favs = profile.favoriteGameIds || [null, null, null, null];

  // Solo juegos que han sido reseñados pueden ser favoritos
  const ratedGameIds = logs.map((l) => l.gameId);
  const availableGames = games.filter((g) => ratedGameIds.includes(g.id));

  // Función para guardar el array de favoritos en Supabase
  const sincronizarFavoritos = async (nuevosFavs: (string | null)[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("perfiles")
      .update({ favorite_game_ids: nuevosFavs }) // Asegúrate que la columna sea tipo text[] en Supabase
      .eq("id", session.user.id);

    if (error) {
      console.error(error);
      toast.error("Error al sincronizar con la nube");
    }
  };

  const handleSetFavorite = async (slot: number, gameId: string) => {
    const nuevosFavs = [...favs];
    nuevosFavs[slot] = gameId;
    
    // Actualizar Store Local
    updateProfile({ favoriteGameIds: nuevosFavs });
    // Actualizar DB
    await sincronizarFavoritos(nuevosFavs);
    
    setPickSlot(null);
    toast.success("Favorito guardado");
  };

  const handleRemoveFavorite = async (slot: number) => {
    const nuevosFavs = [...favs];
    nuevosFavs[slot] = null;
    
    updateProfile({ favoriteGameIds: nuevosFavs });
    await sincronizarFavoritos(nuevosFavs);
    toast.info("Slot liberado");
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Star className="w-3 h-3 fill-primary text-primary" /> Juegos favoritos
        </h3>
        
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((slot) => {
            const gameId = favs[slot];
            const game = gameId ? games.find((g) => g.id === gameId) : null;
            
            return (
              <motion.div
                key={slot}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5 relative group cursor-pointer shadow-lg"
                onClick={() => setPickSlot(slot)}
              >
                {game ? (
                  <>
                    <img src={game.cover} alt={game.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(slot);
                        }}
                        className="w-8 h-8 rounded-full bg-destructive text-white flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/5 group-hover:border-primary/40 transition-colors">
                    <Plus className="w-6 h-6 text-white/10 group-hover:text-primary transition-colors" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <Dialog open={pickSlot !== null} onOpenChange={() => setPickSlot(null)}>
        <DialogContent className="bg-[#0c0c0c] border-white/10 text-white max-h-[80vh] overflow-hidden flex flex-col rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-black uppercase italic italic text-primary">
              Seleccionar Favorito
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto pr-2 mt-4 custom-scrollbar">
            {availableGames.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-sm text-muted-foreground italic">
                  No tienes juegos puntuados.<br/>Reseña un juego para que aparezca aquí.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {availableGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => pickSlot !== null && handleSetFavorite(pickSlot, game.id)}
                    className="aspect-[2/3] rounded-xl overflow-hidden hover:ring-4 ring-primary transition-all duration-300 relative group"
                  >
                    <img src={game.cover} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}