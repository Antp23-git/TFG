import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Header } from "@/components/Header";
import { games } from "@/data/games";
import { 
  User as UserIcon, 
  Send, 
  Trash2, 
  MessageSquare, 
  Star, 
  UserPlus, 
  UserCheck, 
  Gamepad2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ElementoFeed {
  id: string;
  user_id: string;
  username: string;
  content: string;
  type: "review" | "post";
  game_id?: string;
  rating?: number;
  hours_played?: number;
  created_at: string;
}

export default function Foro() {
  const [items, setItems] = useState<ElementoFeed[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [usuarioActivo, setUsuarioActivo] = useState<any>(null);
  const [seguidosIds, setSeguidosIds] = useState<string[]>([]);

  // 1. CARGA DE DATOS OPTIMIZADA
  const cargarMuro = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    setUsuarioActivo(session.user);
    const miId = session.user.id;

    try {
      // Obtener seguidos
      const { data: segs } = await supabase.from("seguimientos").select("seguido_id").eq("seguidor_id", miId);
      const idsSeguidos = segs?.map(s => s.seguido_id) || [];
      setSeguidosIds(idsSeguidos);

      // Obtener perfiles para los nombres
      const { data: perfiles } = await supabase.from("perfiles").select("id, username");
      const mapaNombres: Record<string, string> = {};
      perfiles?.forEach(p => mapaNombres[p.id] = p.username || "Usuario");

      // Obtener mensajes del foro y críticas
      const [foroRes, criticasRes] = await Promise.all([
        supabase.from("foro").select("*").order("created_at", { ascending: false }),
        supabase.from("criticas").select("*").in("user_id", [miId, ...idsSeguidos]).order("created_at", { ascending: false })
      ]);

      const combinado: ElementoFeed[] = [
        ...(foroRes.data || []).map(m => ({
          id: m.id, user_id: m.user_id, username: mapaNombres[m.user_id] || "Usuario",
          content: m.content, type: "post" as const, created_at: m.created_at
        })),
        ...(criticasRes.data || []).map(r => ({
          id: r.id, user_id: r.user_id, username: mapaNombres[r.user_id] || "Usuario",
          content: r.review, type: "review" as const, game_id: r.game_id, 
          rating: r.rating, hours_played: r.hours_played, created_at: r.created_at
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setItems(combinado);
    } catch (e) {
      console.error("Error en el muro:", e);
    } finally {
      setCargando(false);
    }
  }, []);

  // 2. REALTIME SIN COLAPSOS (Canal único y estático)
  useEffect(() => {
    cargarMuro();

    const canal = supabase.channel('muro_principal')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'foro' }, () => cargarMuro())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'criticas' }, () => cargarMuro())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seguimientos' }, () => cargarMuro())
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [cargarMuro]);

  const handleSeguimiento = async (targetId: string) => {
    if (!usuarioActivo) return;
    const yaSigue = seguidosIds.includes(targetId);
    if (yaSigue) {
      await supabase.from("seguimientos").delete().eq("seguidor_id", usuarioActivo.id).eq("seguido_id", targetId);
      toast.info("Dejaste de seguir");
    } else {
      await supabase.from("seguimientos").insert({ seguidor_id: usuarioActivo.id, seguido_id: targetId });
      toast.success("Siguiendo");
    }
    cargarMuro();
  };

  const publicarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !usuarioActivo) return;
    const { error } = await supabase.from("foro").insert([{ user_id: usuarioActivo.id, content: nuevoMensaje.trim() }]);
    if (!error) setNuevoMensaje("");
  };

  const borrarEntrada = async (id: string, tipo: string) => {
    const tabla = tipo === "post" ? "foro" : "criticas";
    await supabase.from(tabla).delete().eq("id", id);
    toast.success("Entrada eliminada");
    cargarMuro();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container max-w-2xl py-8 px-4">
        
        <header className="mb-12">
          <h1 className="font-display text-6xl font-black italic uppercase tracking-tighter mb-2 flex items-center gap-4 text-foreground">
            <MessageSquare className="w-12 h-12 text-primary" /> FORO
          </h1>
          <p className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.3em] ml-2">Actividad de la comunidad</p>
        </header>

        <form onSubmit={publicarMensaje} className="mb-12 flex gap-2 group">
          <Input 
            placeholder="Comparte algo con el mundo..." 
            value={nuevoMensaje} 
            onChange={(e) => setNuevoMensaje(e.target.value)} 
            className="bg-[#0c0c0c] h-16 rounded-2xl border-white/5 focus:border-primary/40 text-lg italic transition-all" 
          />
          <Button type="submit" size="icon" className="h-16 w-16 rounded-2xl bg-primary hover:bg-red-600 shadow-lg shadow-primary/20 transition-all active:scale-90">
            <Send className="w-6 h-6" />
          </Button>
        </form>

        <div className="space-y-8">
          {cargando ? (
            <div className="text-center py-20 animate-pulse font-black uppercase italic text-primary/40">Sincronizando Muro...</div>
          ) : items.map((item) => {
            const esMio = usuarioActivo?.id === item.user_id;
            const loSigo = seguidosIds.includes(item.user_id);
            const juego = item.game_id ? games.find(g => g.id === item.game_id) : null;

            return (
              <div key={item.id} className="bg-[#0c0c0c] border border-white/5 p-8 rounded-[2.5rem] relative hover:border-primary/30 transition-all shadow-2xl">
                
                {/* CABECERA */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <UserIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-sm uppercase tracking-widest text-primary leading-tight">
                        {item.username}
                      </span>
                      {!esMio && (
                        <button 
                          onClick={() => handleSeguimiento(item.user_id)}
                          className={cn(
                            "text-[10px] font-bold uppercase mt-1 flex items-center gap-1 transition-all",
                            loSigo ? "text-muted-foreground hover:text-red-500" : "text-primary hover:scale-105"
                          )}
                        >
                          {loSigo ? <><UserCheck className="w-3 h-3" /> Siguiendo</> : <><UserPlus className="w-3 h-3" /> Seguir</>}
                        </button>
                      )}
                    </div>
                  </div>
                  {esMio && (
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => borrarEntrada(item.id, item.type)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>

                {/* CONTENIDO DIRECTO */}
                {item.type === "review" ? (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                    {/* Badge Juego */}
                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <Gamepad2 className="w-5 h-5 text-primary" />
                        <span className="text-xs font-black uppercase italic tracking-wider">{juego?.title}</span>
                      </div>
                      {item.hours_played && (
                        <div className="flex items-center gap-1.5 text-primary">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-black">{item.hours_played}H</span>
                        </div>
                      )}
                    </div>

                    {/* Estrellas */}
                    <div className="flex gap-1.5 ml-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={cn("w-5 h-5", s <= (item.rating || 0) ? "fill-primary text-primary drop-shadow-[0_0_8px_rgba(255,46,46,0.4)]" : "text-white/5")} />
                      ))}
                    </div>

                    {/* Reseña */}
                    <div className="relative">
                      <p className="text-xl text-foreground/90 font-medium leading-relaxed italic pl-6 border-l-4 border-primary/40">
                        "{item.content}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg text-foreground/80 font-medium leading-relaxed border-l-4 border-white/10 pl-6 py-2 italic bg-white/[0.01] rounded-r-2xl">
                    "{item.content}"
                  </p>
                )}

                {/* FOOTER */}
                <div className="mt-8 text-[9px] font-bold text-muted-foreground/20 uppercase tracking-[0.4em] flex justify-between border-t border-white/5 pt-5">
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  <span className={item.type === 'review' ? "text-primary/50" : ""}>
                    {item.type === 'review' ? '' : 'post'} </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}