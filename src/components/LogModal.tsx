import { useState, useEffect } from "react";
import { Trash2, Loader2, User, Clock } from "lucide-react"; 
import { Game } from "@/data/games";
import { useGameStore } from "@/store/gameStore"; 
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner"; 
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LogModalProps {
  game: Game;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  externalReview?: {
    rating: number;
    review: string;
    username: string;
    hoursPlayed?: string;
  };
}

export function LogModal({ game, open, onOpenChange, externalReview }: LogModalProps) {
  const { logGame, getGameLog, removeLog } = useGameStore();
  
  const isExternal = !!externalReview;
  const existing = getGameLog(game.id);
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [hours, setHours] = useState("");
  const [loading, setLoading] = useState(false);

  // Resetear o cargar estados al abrir
  useEffect(() => {
    if (open) {
      if (isExternal) {
        setRating(externalReview.rating);
        setReview(externalReview.review);
        setHours(externalReview.hoursPlayed || ""); 
      } else {
        setRating(existing?.rating ?? 0);
        setReview(existing?.review ?? "");
        setHours(existing?.hoursPlayed ?? "");
      }
    }
  }, [open, existing, externalReview, isExternal]);

  const handleSave = async () => {
    if (isExternal) return; 

    // VALIDACIONES OBLIGATORIAS
    if (rating === 0) {
      toast.error("Falta la puntuación", { description: "Selecciona al menos una estrella." });
      return;
    }

    if (!hours.trim()) {
      toast.error("Faltan las horas", { description: "Es obligatorio indicar cuánto tiempo has jugado." });
      return;
    }

    if (!review.trim() || review.trim().length < 3) {
      toast.error("Reseña incompleta", { description: "Cuéntanos un poco más sobre tu experiencia." });
      return;
    }

    setLoading(true);
    try {
      await logGame({
        gameId: game.id,
        rating,
        review: review.trim(),
        hoursPlayed: hours.trim(),
        date: new Date().toISOString()
      });
      toast.success("¡Reseña publicada!");
      onOpenChange(false);
    } catch (err) {
      toast.error("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existing) return;
    if (confirm("¿Seguro que quieres borrar esta reseña?")) {
      await removeLog(game.id);
      toast.info("Reseña eliminada");
      onOpenChange(false);
    }
  };

  // Variable para controlar si el botón debe estar deshabilitado visualmente
  const isInvalid = rating === 0 || !hours.trim() || !review.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-card border-border p-0 overflow-hidden shadow-2xl"
        aria-describedby={undefined}
      >
        <div className="flex flex-col sm:flex-row">
          <img
            src={game.cover}
            alt={game.title}
            className="w-full sm:w-32 h-48 sm:h-auto object-cover border-b sm:border-b-0 sm:border-r border-border grayscale-[0.2]"
          />
          
          <div className="flex-1 p-6 space-y-5">
            <DialogHeader>
              <DialogTitle className="font-display text-xl uppercase italic tracking-tighter text-primary">
                {game.title}
              </DialogTitle>
              {isExternal && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary/80">
                    Reseña de {externalReview.username}
                  </span>
                </div>
              )}
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* 1. PUNTUACIÓN */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest italic">
                    Puntuación *
                  </label>
                  <StarRating 
                    rating={rating} 
                    onRate={isExternal ? undefined : setRating} 
                    size="lg" 
                  />
                </div>

                {/* 2. HORAS */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest italic">
                    Tiempo *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Ej: 20h"
                      value={hours}
                      readOnly={isExternal}
                      onChange={(e) => setHours(e.target.value)}
                      className={cn(
                        "bg-muted/30 border-border h-9 pl-8 text-xs focus-visible:ring-primary transition-all",
                        isExternal && "border-transparent bg-muted/10 opacity-80"
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* 3. RESEÑA */}
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 block tracking-widest italic">
                  Tu Opinión *
                </label>
                <Textarea
                  readOnly={isExternal}
                  placeholder={isExternal ? "" : "Escribe tu reseña obligatoria..."}
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className={cn(
                    "bg-muted/30 border-border text-sm resize-none min-h-[100px] focus-visible:ring-primary transition-all",
                    isExternal && "cursor-default focus:ring-0 border-transparent bg-muted/10 italic text-muted-foreground"
                  )}
                />
              </div>

              {!isExternal && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={loading || isInvalid}
                    className={cn(
                      "flex-1 h-11 font-bold rounded-xl transition-all active:scale-95",
                      isInvalid 
                        ? "bg-muted text-muted-foreground cursor-not-allowed" 
                        : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                    )}
                  >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Publicar ahora"}
                  </Button>
                  
                  {existing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleDelete}
                      className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}