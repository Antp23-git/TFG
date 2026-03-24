import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importamos para navegar
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { UserPlus, UserMinus, MessageCircle, Search, User as UserIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Perfil {
  id: string;
  username: string;
  avatar_url: string;
  lo_sigo: boolean;
  me_sigue: boolean;
}

export default function Amigos() {
  const navigate = useNavigate(); // Hook para movernos entre páginas
  const [busqueda, setBusqueda] = useState("");
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [usuarioActual, setUsuarioActual] = useState<any>(null);

  useEffect(() => {
    obtenerDatos();
  }, []);

  const obtenerDatos = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setUsuarioActual(session.user);
    await cargarPerfiles(session.user.id);
  };

  const cargarPerfiles = async (miId: string) => {
    setCargando(true);
    try {
      const { data: todosLosPerfiles } = await supabase
        .from("perfiles")
        .select("*")
        .neq("id", miId);

      const { data: misSeguidos } = await supabase
        .from("seguimientos")
        .select("seguido_id")
        .eq("seguidor_id", miId);

      const { data: misSeguidores } = await supabase
        .from("seguimientos")
        .select("seguidor_id")
        .eq("seguido_id", miId);

      const idsSeguidos = misSeguidos?.map(f => f.seguido_id) || [];
      const idsSeguidores = misSeguidores?.map(f => f.seguidor_id) || [];

      const perfilesFormateados = (todosLosPerfiles || []).map(p => ({
        ...p,
        lo_sigo: idsSeguidos.includes(p.id),
        me_sigue: idsSeguidores.includes(p.id)
      }));

      setPerfiles(perfilesFormateados);
    } catch (error) {
      console.error("Error al cargar perfiles:", error);
    } finally {
      setCargando(false);
    }
  };

  const gestionarSeguimiento = async (idDestino: string, yaLoSigo: boolean) => {
    if (yaLoSigo) {
      const { error } = await supabase
        .from("seguimientos")
        .delete()
        .eq("seguidor_id", usuarioActual.id)
        .eq("seguido_id", idDestino);
      
      if (!error) toast.info("Has dejado de seguir a este usuario");
    } else {
      const { error } = await supabase
        .from("seguimientos")
        .insert([{ seguidor_id: usuarioActual.id, seguido_id: idDestino }]);
      
      if (!error) toast.success("¡Ahora sigues a este usuario!");
    }
    cargarPerfiles(usuarioActual.id);
  };

  const perfilesFiltrados = perfiles.filter(p => 
    p.username?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl py-8">
        <header className="mb-10 space-y-4">
          <h1 className="font-display text-4xl font-black italic uppercase tracking-tighter">
            COMUNIDAD <span className="text-primary text-xs font-mono tracking-[0.3em] not-italic ml-4 opacity-50">BUSCAR JUGADORES</span>
          </h1>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Escribe un nombre de usuario..." 
              className="pl-12 bg-[#0c0c0c] border-white/5 focus:border-primary/50 h-14 rounded-2xl text-lg"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {cargando ? (
            <p className="text-center py-10 animate-pulse font-bold uppercase text-primary">Cargando base de datos...</p>
          ) : perfilesFiltrados.map((perfil) => {
            const esAmigo = perfil.lo_sigo && perfil.me_sigue;

            return (
              <div key={perfil.id} className={cn(
                "p-6 rounded-[2rem] border transition-all flex flex-col md:flex-row items-center justify-between gap-6 group",
                esAmigo ? "bg-primary/5 border-primary/20 shadow-xl" : "bg-[#0c0c0c] border-white/5 hover:border-primary/20"
              )}>
                <div className="flex items-center gap-5 w-full">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-110",
                    esAmigo ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(255,46,46,0.2)]" : "border-white/10 bg-white/5"
                  )}>
                    <UserIcon className={cn("w-8 h-8", esAmigo ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase italic tracking-tight text-foreground leading-none">
                      {perfil.username || "Gamer"}
                    </h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", esAmigo ? "bg-primary animate-pulse" : "bg-white/20")} />
                      {esAmigo ? "Conexión Establecida" : perfil.me_sigue ? "Te sigue" : "Jugador Solitario"}
                    </p>
                  </div>
                </div>

                {/* --- SECCIÓN DE BOTONES --- */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  
                  {/* BOTÓN VER USUARIO (Nuevo) */}
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/user/${perfil.id}`)} // Redirige al perfil del usuario
                    className="flex-1 md:flex-none rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest h-12 px-6 gap-2"
                  >
                    <Eye className="w-4 h-4" /> Ver Usuario
                  </Button>

                  {/* BOTÓN SEGUIR / DEJAR DE SEGUIR */}
                  <Button 
                    variant={perfil.lo_sigo ? "outline" : "default"}
                    onClick={() => gestionarSeguimiento(perfil.id, perfil.lo_sigo)}
                    className={cn(
                      "flex-1 md:flex-none rounded-2xl h-12 px-6 text-[10px] font-black uppercase tracking-widest transition-all",
                      !perfil.lo_sigo ? "bg-primary hover:bg-red-600 text-white shadow-lg shadow-primary/20" : "border-red-500/50 text-red-500 hover:bg-red-500/10"
                    )}
                  >
                    {perfil.lo_sigo ? (
                      <><UserMinus className="w-4 h-4 mr-2" /> Dejar de seguir</>
                    ) : (
                      <><UserPlus className="w-4 h-4 mr-2" /> Seguir</>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}