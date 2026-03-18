import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { games } from "@/data/games";
import { StarRating } from "./StarRating";

export function DiaryCalendar() {
  const { logs } = useGameStore();
  const [monthOffset, setMonthOffset] = useState(0);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base capitalize">{monthName}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
            disabled={monthOffset >= 0}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {datedLogs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Sin entradas este mes
        </p>
      ) : (
        <div className="space-y-2">
          {datedLogs.map((log) => {
            const game = games.find((g) => g.id === log.gameId);
            if (!game) return null;
            const d = new Date(log.date!);
            return (
              <div key={log.gameId + log.date} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="text-center w-10 shrink-0">
                  <span className="font-mono-data text-lg text-foreground">{d.getDate()}</span>
                  <p className="font-mono-data text-[10px] text-muted-foreground uppercase">
                    {d.toLocaleDateString("es-ES", { weekday: "short" })}
                  </p>
                </div>
                <img src={game.cover} alt={game.title} className="w-8 h-12 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{game.title}</p>
                  <StarRating rating={log.rating} size="sm" interactive={false} />
                </div>
                {log.hoursPlayed && (
                  <span className="font-mono-data text-xs text-muted-foreground shrink-0">{log.hoursPlayed}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
