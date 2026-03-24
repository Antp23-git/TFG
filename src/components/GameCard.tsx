import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, MessageSquare } from "lucide-react"; 
import { Game } from "@/data/games";
import { useGameStore } from "@/store/gameStore";
import { LogModal } from "./LogModal";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase"; 
import { toast } from "sonner"; 
import { useNavigate } from "react-router-dom"; 

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const [hovered, setHovered] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const navigate = useNavigate();

  const { getGameLog, toggleWatchlist, watchlist } = useGameStore();
  
  const log = session ? getGameLog(game.id) : null;
  const isInWatchlist = session ? watchlist.includes(game.id) : false;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const checkAuth = (action: () => void) => {
    if (!session) {
      toast.error("Inicia sesión para interactuar", {
        description: "Únete a Gameboxd para registrar tus partidas.",
        action: {
          label: "Ir al Login",
          onClick: () => navigate("/auth"),
        },
      });
      return;
    }
    action();
  };

  return (
    <>
      <motion.div
        className="relative group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => checkAuth(() => setLogOpen(true))}
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* Contenedor de la Imagen */}
        <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-card bg-card border border-border/50 group-hover:border-primary/50 transition-all duration-300">
          <img
            src={game.cover}
            alt={game.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              hovered ? "scale-105 brightness-[0.3] blur-[2px]" : "brightness-100"
            )}
            loading="lazy"
          />
        </div>

        {/* Overlay de información (Solo visible en Hover) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          className="absolute inset-0 rounded-lg flex flex-col items-center justify-center p-4 text-center"
        >
          <div className="space-y-2">
            <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2 opacity-80" />
            <p className="text-xs font-display font-bold text-white uppercase italic tracking-tighter leading-tight">
              {game.title}
            </p>
            <p className="text-[10px] font-mono-data text-primary/90 font-bold uppercase tracking-widest">
              {game.year}
            </p>
            
            {/* Si ya tiene nota, mostramos un pequeño indicador visual de que está reseñado */}
            {log && (
              <div className="mt-2 bg-primary/20 border border-primary/30 px-2 py-0.5 rounded text-[9px] text-primary font-bold uppercase tracking-tighter">
                {log.rating} ★ Reseñado
              </div>
            )}
          </div>

          {/* Botón de Watchlist (Pendientes) en la esquina */}
          <div className="absolute top-3 right-3 pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                checkAuth(() => toggleWatchlist(game.id));
              }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md border",
                isInWatchlist
                  ? "bg-primary border-primary text-white"
                  : "bg-black/40 border-white/20 text-white hover:bg-black/60"
              )}
            >
              <Clock className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <LogModal game={game} open={logOpen} onOpenChange={setLogOpen} />
    </>
  );
}