import { useGameStore } from "@/store/gameStore";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface RatingStatsProps {
  filter?: "all" | "year" | "month";
}

export function RatingStats({ filter = "all" }: RatingStatsProps) {
  const { logs } = useGameStore();

  const now = new Date();
  
  // Filtrado de logs según el periodo seleccionado
  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    if (!log.date) return false;
    const d = new Date(log.date);
    if (filter === "year") return d.getFullYear() === now.getFullYear();
    if (filter === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    return true;
  });

  // Cálculo de la nota media
  const total = filteredLogs.length;
  const average = total > 0 
    ? (filteredLogs.reduce((acc, log) => acc + log.rating, 0) / total).toFixed(1)
    : "0.0";

  return (
    <div className="bg-muted/20 border border-border/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all hover:bg-muted/30">
      <div className="relative flex items-center justify-center">
        {/* Círculo de progreso decorativo de fondo */}
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-muted/30"
          />
          {/* Círculo animado que representa la nota (escala 0-5) */}
          <motion.circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray="364"
            initial={{ strokeDashoffset: 364 }}
            animate={{ strokeDashoffset: 364 - (364 * (parseFloat(average) / 5)) }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-primary"
          />
        </svg>

        {/* Texto central con la nota */}
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-mono-data font-black text-foreground tracking-tighter">
            {average}
          </span>
          <div className="flex gap-0.5 mt-[-4px]">
            <Star className="w-3 h-3 fill-primary text-primary" />
          </div>
        </div>
      </div>

      <div className="text-center space-y-1">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Nota Media {filter === "all" ? "Global" : filter === "year" ? "del Año" : "del Mes"}
        </h4>
        <p className="text-[11px] text-muted-foreground/60 italic font-mono-data">
          {total} {total === 1 ? "Entrada" : "Entradas"} en el diario
        </p>
      </div>

      {total === 0 && (
        <p className="text-[9px] text-primary/60 font-medium uppercase tracking-tight">
          Sin datos para este periodo
        </p>
      )}
    </div>
  );
}