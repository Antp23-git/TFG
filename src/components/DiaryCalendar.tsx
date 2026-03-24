import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2, Edit2 } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { games } from "@/data/games";
import { StarRating } from "./StarRating";
import { LogModal } from "./LogModal";
import { toast } from "sonner";

export function DiaryCalendar() {
  const { logs, removeLog } = useGameStore();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedGame, setSelectedGame] = useState<any>(null);

  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" });

  const datedLogs = useMemo(() => {
    return logs.filter((l) => {
      if (!l.date) return false;
      const d = new Date(l.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }).sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());
  }, [logs, year, month]);

  const handleDelete = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation(); // Evita que se abra el modal al pulsar borrar
    removeLog(gameId);
    toast.error("Entrada eliminada del diario");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base capitalize italic text-primary">{monthName}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
            disabled={monthOffset >= 0}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {datedLogs.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-muted rounded-xl">
          <p className="text-sm text-muted-foreground italic">
            Sin entradas este mes
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {datedLogs.map((log) => {
            const game = games.find((g) => g.id === log.gameId);
            if (!game) return null;
            const d = new Date(log.date!);
            
            return (
              <div 
                key={log.gameId + log.date} 
                onClick={() => setSelectedGame(game)}
                className="group relative flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 hover:border-primary/30 transition-all cursor-pointer"
              >
                {/* Fecha */}
                <div className="text-center w-10 shrink-0 mt-1">
                  <span className="font-mono-data text-xl font-bold text-foreground leading-none">{d.getDate()}</span>
                  <p className="font-mono-data text-[9px] text-muted-foreground uppercase tracking-tighter">
                    {d.toLocaleDateString("es-ES", { weekday: "short" })}
                  </p>
                </div>

                {/* Portada */}
                <img src={game.cover} alt={game.title} className="w-12 h-16 object-cover rounded-md shadow-lg" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-foreground truncate uppercase tracking-tight">{game.title}</p>
                    <div className="flex items-center gap-2">
                      {log.hoursPlayed && (
                        <span className="font-mono-data text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                          {log.hoursPlayed}
                        </span>
                      )}
                      
                      {/* BOTÓN BORRAR (Visible en hover) */}
                      <button 
                        onClick={(e) => handleDelete(e, game.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <StarRating rating={log.rating} size="sm" interactive={false} />
                  
                  {log.review && (
                    <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2 leading-relaxed border-l-2 border-muted pl-3">
                      "{log.review}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para editar desde el diario */}
      {selectedGame && (
        <LogModal 
          game={selectedGame} 
          open={!!selectedGame} 
          onOpenChange={(open) => !open && setSelectedGame(null)} 
        />
      )}
    </div>
  );
}