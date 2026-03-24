import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { games } from "@/data/games";
import { User as UserIcon, ArrowLeft, Star, Gamepad2, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PerfilUsuario() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [perfil, setPerfil] = useState<any>(null);
  const [actividad, setActividad] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatosPerfil = async () => {
      if (!userId) return;
      setCargando(true);

      try {
        // 1. Obtener datos del perfil
        const { data: userData } = await supabase
          .from("perfiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        setPerfil(userData);

        // 2. Obtener sus críticas
        const { data: criticas } = await supabase
          .from("criticas")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        setActividad(criticas || []);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatosPerfil();
  }, [userId]);

  if (cargando) {
    return <div className="min-h-screen bg-background flex items-center justify-center font-black italic uppercase text-primary animate-pulse">Cargando Archivos...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-4xl py-10 px-6">
        {/* BOTÓN VOLVER */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-10 gap-2 rounded-full text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver atrás
        </Button>

        {/* CABECERA DE PERFIL */}
        <section className="bg-[#0c0c0c] border border-white/5 rounded-[3rem] p-10 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <UserIcon size={120} />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-32 h-32 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center shadow-[0_0_30px_rgba(255,46,46,0.2)]">
              <UserIcon className="w-16 h-16 text-primary" />
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-2">
                {perfil?.username || "Gamer"}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reseñas</p>
                  <p className="text-xl font-black text-primary">{actividad.length}</p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Estado</p>
                  <p className="text-xl font-black text-green-500 uppercase italic text-sm mt-1">Online</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LISTA DE ACTIVIDAD (Reseñas) */}
        <h2 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
          <MessageSquare className="text-primary w-6 h-6" /> Historial de Críticas
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {actividad.length === 0 ? (
            <div className="text-center py-20 bg-[#0c0c0c] rounded-[2.5rem] border border-dashed border-white/10">
              <p className="text-muted-foreground italic">Este usuario aún no ha publicado ninguna reseña.</p>
            </div>
          ) : (
            actividad.map((item) => {
              const juego = games.find(g => g.id === item.game_id);
              return (
                <div key={item.id} className="bg-[#0c0c0c] border border-white/5 p-8 rounded-[2.5rem] hover:border-primary/30 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    
                    <div className="flex items-center gap-4">
                      <img 
                        src={juego?.cover} 
                        className="w-16 h-20 object-cover rounded-xl border border-white/10 shadow-lg"
                        alt={juego?.title}
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Gamepad2 className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                            {juego?.title}
                          </span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={cn("w-3 h-3", i < item.rating ? "fill-primary text-primary" : "text-white/5")} 
                            />
                          ))}
                        </div>
                        <p className="text-lg text-foreground font-medium italic leading-snug">
                          "{item.review}"
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                      <div className="flex items-center gap-2 text-muted-foreground/40 italic">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}