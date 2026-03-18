import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Clock, Eye } from "lucide-react";
import { Game } from "@/data/games";
import { useGameStore } from "@/store/gameStore";
import { StarRating } from "./StarRating";
import { LogModal } from "./LogModal";
import { cn } from "@/lib/utils";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const [hovered, setHovered] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const { rateGame, getGameLog, toggleWatchlist, watchlist } = useGameStore();
  const log = getGameLog(game.id);
  const isInWatchlist = watchlist.includes(game.id);

  return (
    <>
      <motion.div
        className="relative group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-card bg-card">
          <img
            src={game.cover}
            alt={game.title}
            className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
            loading="lazy"
          />
        </div>

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 rounded-lg flex flex-col justify-end p-3 pointer-events-none"
        >
          <div className="pointer-events-auto space-y-2">
            {/* Title */}
            <div>
              <p className="text-sm font-display text-foreground leading-tight">{game.title}</p>
              <p className="text-xs font-mono-data text-muted-foreground">{game.year}</p>
            </div>
            {/* Quick rate */}
            <StarRating
              rating={log?.rating ?? 0}
              onRate={(r) => rateGame(game.id, r)}
              size="sm"
            />
          </div>

          {/* Action buttons top-right */}
          <div className="absolute top-2 right-2 flex gap-1.5 pointer-events-auto">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setLogOpen(true);
              }}
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
                "bg-primary text-primary-foreground hover:brightness-110"
              )}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(game.id);
              }}
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
                isInWatchlist
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Rated indicator */}
        {log && !hovered && (
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded px-1.5 py-0.5">
              <Eye className="w-3 h-3 text-muted-foreground" />
              <StarRating rating={log.rating} size="sm" interactive={false} />
            </div>
          </div>
        )}
      </motion.div>

      <LogModal game={game} open={logOpen} onOpenChange={setLogOpen} />
    </>
  );
}
