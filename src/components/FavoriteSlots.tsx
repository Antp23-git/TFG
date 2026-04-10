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
import { cn } from "@/lib/utils";

export function FavoriteSlots() {
  const { profile, updateProfile, logs } = useGameStore();
  const [pickSlot, setPickSlot] = useState<number | null>(null);
  
  // Sincronizamos con el estado del perfil
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
      .update({ favorite_game_ids: nuevosFavs }) 
      .eq("id", session.user.id);

    if (error) {
      console.error(error);
      toast.error("Error al sincronizar con la nube");
    }
  };

  const handleSetFavorite = async (slot: number, gameId: string) => {
    const nuevosFavs = [...favs];
    nuevosFavs[slot] = gameId;
    
    updateProfile({ favoriteGameIds: nuevosFavs });
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
        
        {/* Cuadrícula principal de Favoritos */}
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((slot) => {
            const gameId = favs[slot];
            const game = gameId ? games.find((g) => g.id === gameId) : null;
            
            return (
              <div key={slot} className="flex flex-col gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5 relative group cursor-pointer shadow-lg"
                  onClick={() => setPickSlot(slot)}
                >
                  {game ? (
                    <>
                      <img 
                        src={game.cover} 
                        alt={game.title} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                
                {/* Nombre debajo del slot */}
                <span className={cn(
                  "text-[9px] font-bold text-center leading-tight truncate px-1",
                  game ? "text-foreground" : "text-muted-foreground/40"
                )}>
                  {game ? game.title : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de selección */}
      <Dialog open={pickSlot !== null} onOpenChange={() => setPickSlot(null)}>
        <DialogContent className="bg-[#0c0c0c] border-white/10 text-white max-h-[85vh] overflow-hidden flex flex-col rounded-[2.5rem] sm:max-w-md">
          <DialogHeader className="pt-4 px-2">
            <DialogTitle className="font-display text-2xl font-black uppercase italic text-primary tracking-tighter">
              Seleccionar Favorito
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto pr-1 mt-6 custom-scrollbar px-2 pb-6">
            {availableGames.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
                <Star className="w-8 h-8 text-white/5 mx-auto mb-4" />
                <p className="text-xs text-muted-foreground italic leading-relaxed px-6">
                  No tienes juegos puntuados.<br/>Reseña un juego de tu colección para que aparezca aquí.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-x-3 gap-y-5">
                {availableGames.map((game) => (
                  <div key={game.id} className="flex flex-col gap-2">
                    <button
                      onClick={() => pickSlot !== null && handleSetFavorite(pickSlot, game.id)}
                      className="aspect-[2/3] rounded-xl overflow-hidden hover:ring-4 ring-primary transition-all duration-300 relative group shadow-2xl"
                    >
                      <img 
                        src={game.cover} 
                        alt={game.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    
                    {/* Nombre del juego en el buscador */}
                    <span className="text-[10px] font-bold text-center leading-tight line-clamp-2 text-white/70">
                      {game.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}