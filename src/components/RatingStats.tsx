import { motion } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

interface RatingStatsProps {
  filter?: "all" | "year" | "month";
}

export function RatingStats({ filter = "all" }: RatingStatsProps) {
  const { logs } = useGameStore();

  const now = new Date();
  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    if (!log.date) return false;
    const d = new Date(log.date);
    if (filter === "year") return d.getFullYear() === now.getFullYear();
    if (filter === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    return true;
  });

  const counts = [0, 0, 0, 0, 0];
  filteredLogs.forEach((l) => {
    if (l.rating >= 1 && l.rating <= 5) counts[l.rating - 1]++;
  });
  const max = Math.max(...counts, 1);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">Distribución de notas</span>
        <span className="font-mono-data text-xs text-muted-foreground">
          {filteredLogs.length} juego{filteredLogs.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex items-end gap-2 h-32">
        {counts.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="relative w-full bg-muted rounded-t-sm overflow-hidden h-24">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(count / max) * 100}%` }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-0 w-full bg-secondary hover:bg-primary transition-colors rounded-t-sm"
              />
            </div>
            <span className="font-mono-data text-[10px] text-muted-foreground">{i + 1}★</span>
            <span className="font-mono-data text-[10px] text-muted-foreground">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
