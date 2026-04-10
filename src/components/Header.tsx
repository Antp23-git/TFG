import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, Gamepad2, Clock, LogOut, MessageSquare, Users, Loader2 } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { toast } from "sonner";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  
  const { fetchUserContent, resetStore, isLoading, profile } = useGameStore();
  
  // Ref para evitar que se ejecute la sincronización mil veces
  const sincronizando = useRef(false);
  const idUltimaSincronizacion = useRef<string | null>(null);

  const sincronizarPerfil = async (usuario: any) => {
    // Si ya estamos sincronizando o es el mismo ID de antes, no hacemos nada
    if (sincronizando.current || usuario.id === idUltimaSincronizacion.current) return;
    
    sincronizando.current = true;
    const nombreLimpio = usuario.email?.split('@')[0] || "Player";

    try {
      const { error } = await supabase
        .from("perfiles")
        .upsert({ 
          id: usuario.id, 
          username: nombreLimpio,
          avatar_url: "",
          favorites: [],
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (!error) {
        idUltimaSincronizacion.current = usuario.id;
        console.log("✅ Perfil sincronizado para:", nombreLimpio);
      }
    } catch (e) {
      console.error("Error en sincronización:", e);
    } finally {
      sincronizando.current = false;
    }
  };

  useEffect(() => {
    // 1. Carga inicial
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        setSession(currentSession);
        await sincronizarPerfil(currentSession.user);
        await fetchUserContent();
      }
    };
    initAuth();

    // 2. Escuchar cambios (con filtro de eventos para evitar el 403)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession);
        if (newSession?.user) {
          await sincronizarPerfil(newSession.user);
          await fetchUserContent();
        }
      }

      if (event === 'SIGNED_OUT') {
        setSession(null);
        idUltimaSincronizacion.current = null;
        resetStore();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserContent, resetStore]);

  const handleLogout = async () => {
    try {
      // Forzamos el reset del store antes para limpiar la UI
      setSession(null);
      resetStore();
      
      // Intentamos cerrar sesión en Supabase
      const { error } = await supabase.auth.signOut();
      
      // Si hay error 403, probablemente la sesión ya expiró localmente, solo limpiamos
      if (error && error.status !== 403) throw error;

      navigate("/auth");
      toast.info("Sesión finalizada");
    } catch (error) {
      console.error("Error al salir:", error);
      // Aun con error, mandamos al login por seguridad
      navigate("/auth");
    }
  };

  const navItems = [
    { to: "/", label: "Juegos", icon: Gamepad2 },
    { to: "/watchlist", label: "Pendientes", icon: Clock },
    ...(session ? [
      { to: "/forum", label: "Foro", icon: MessageSquare }, 
      { to: "/friends", label: "Amigos", icon: Users },    
    ] : []),
    { to: "/profile", label: "Perfil", icon: User }, 
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm pt-[env(safe-area-inset-top)]">
      {/* Usamos w-full y padding lateral reducido en vez de la clase 'container' estricta */}
      <div className="w-full flex items-center justify-between h-16 px-3 sm:px-6">
        
        <Link 
          to="/" 
          className="font-display text-xl sm:text-2xl font-bold tracking-tighter text-foreground shrink-0 uppercase italic hover:opacity-80 transition-opacity"
        >
          GAME<span className="text-primary">BOXD</span>
        </Link>

        {/* Contenedor derecho: reducimos gaps para que no empuje el botón fuera */}
        <div className="flex items-center gap-1 sm:gap-4 shrink-0">
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-all shrink-0",
                  location.pathname === to
                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className={cn("w-[18px] h-[18px] sm:w-4 sm:h-4", location.pathname === to && "text-primary")} />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />

          {/* Eliminamos el min-w-[100px] que forzaba el scroll horizontal */}
          <div className="flex items-center justify-end shrink-0">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary/40" />
            ) : !session ? (
              <Button 
                variant="default" 
                size="sm" 
                className="font-bold rounded-full px-4 sm:px-6 shadow-lg shadow-primary/20 text-xs sm:text-sm shrink-0" 
                onClick={() => navigate("/auth")}
              >
                Entrar
              </Button>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="hidden md:flex flex-col items-end leading-none">
                  <span className="text-xs font-bold text-foreground">
                    {profile.username || "Usuario"}
                  </span>
                  <span className="text-[9px] text-primary font-black uppercase tracking-tighter">
                    Online
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 h-8 w-8 sm:h-9 sm:w-9 p-0 shrink-0" 
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}