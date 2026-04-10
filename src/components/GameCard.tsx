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
        className="relative group cursor-pointer flex flex-col gap-2" // Añadido flex-col y gap
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => checkAuth(() => setLogOpen(true))}
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* Contenedor de la Imagen */}
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-card bg-card border border-border/50 group-hover:border-primary/50 transition-all duration-300">
          <img
            src={game.cover}
            alt={game.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500",
              hovered ? "scale-105 brightness-[0.3] blur-[2px]" : "brightness-100"
            )}
            loading="lazy"
          />

          {/* Icono de Reseñado (Solo aparece si ya tiene log) */}
          {log && !hovered && (
            <div className="absolute bottom-2 right-2 bg-primary px-1.5 py-0.5 rounded text-[10px] text-white font-bold">
              ★ {log.rating}
            </div>
          )}

          {/* Overlay de información (Visible en Hover) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-black/40"
          >
            <MessageSquare className="w-6 h-6 text-primary mx-auto mb-2 opacity-80" />
            <p className="text-[10px] font-mono-data text-primary/90 font-bold uppercase tracking-widest">
               INICIA SESIÓN
            </p>
          </motion.div>
        </div>

        {/* --- NOMBRE DEL JUEGO FUERA DE LA IMAGEN --- */}
        <div className="px-1">
          <h3 className="text-[11px] md:text-xs font-display font-bold text-foreground leading-tight line-clamp-2">
            {game.title}
          </h3>
          <p className="text-[9px] font-mono-data text-muted-foreground uppercase tracking-wider mt-0.5">
            {game.year}
          </p>
        </div>

        {/* Botón de Watchlist siempre accesible */}
        <div className="absolute top-2 right-2 z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              checkAuth(() => toggleWatchlist(game.id));
            }}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md border",
              isInWatchlist
                ? "bg-primary border-primary text-white"
                : "bg-black/20 border-white/10 text-white opacity-0 group-hover:opacity-100"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>

      <LogModal game={game} open={logOpen} onOpenChange={setLogOpen} />
    </>
  );
}