import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Game } from "@/data/games";
import { useGameStore } from "@/store/gameStore";
import { StarRating } from "./StarRating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
}

export function LogModal({ game, open, onOpenChange }: LogModalProps) {
  const { logGame, getGameLog } = useGameStore();
  const existing = getGameLog(game.id);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [review, setReview] = useState(existing?.review ?? "");
  const [hours, setHours] = useState(existing?.hoursPlayed ?? "");

  const handleSave = () => {
    if (rating === 0) return;
    logGame({
      gameId: game.id,
      rating,
      review: review || undefined,
      hoursPlayed: hours || undefined,
      date: new Date().toISOString().split("T")[0],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border p-0 overflow-hidden">
        <div className="flex">
          <img
            src={game.cover}
            alt={game.title}
            className="w-28 h-auto object-cover hidden sm:block"
          />
          <div className="flex-1 p-6 space-y-5">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">{game.title}</DialogTitle>
              <p className="font-mono-data text-xs text-muted-foreground">{game.year} · {game.genre}</p>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Puntuación</label>
                <StarRating rating={rating} onRate={setRating} size="lg" />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Horas jugadas</label>
                <Input
                  placeholder="ej. 42h"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="bg-muted border-border font-mono-data text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Review (opcional)</label>
                <Textarea
                  placeholder="¿Qué te pareció?"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="bg-muted border-border text-sm resize-none min-h-[80px]"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={rating === 0}
                className="w-full bg-primary text-primary-foreground hover:brightness-110 active:translate-y-px"
              >
                Guardar en diario
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
