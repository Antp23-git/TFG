import { Link, useLocation } from "react-router-dom";
import { User, Gamepad2, Clock, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function Header() {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Juegos", icon: Gamepad2 },
    { to: "/watchlist", label: "Pendientes", icon: Clock },
    { to: "/profile", label: "Perfil", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-14 gap-6">
        <Link to="/" className="font-display text-xl tracking-tight text-foreground shrink-0">
          game<span className="text-primary">boxd</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                location.pathname === to
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
