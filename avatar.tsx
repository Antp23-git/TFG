import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
}

const sizes = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-7 h-7",
};

export function StarRating({ rating, onRate, size = "md", interactive = true }: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileTap={interactive ? { scale: 0.85 } : undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (interactive && onRate) onRate(star === rating ? 0 : star);
          }}
          className={cn(
            "transition-all duration-150",
            interactive ? "cursor-pointer hover:brightness-125" : "cursor-default"
          )}
          disabled={!interactive}
        >
          <Star
            className={cn(
              sizes[size],
              star <= rating
                ? "fill-primary text-primary"
                : "fill-none text-muted-foreground/40"
            )}
          />
        </motion.button>
      ))}
    </div>
  );
}
