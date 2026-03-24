import { useParams, useNavigate } from "react-router-dom";
import { games } from "@/data/games";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, Send, Gamepad2, Loader2, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DetallesJuego() {
  const { id, reviewId } = useParams();
  const navigate = useNavigate();
  
  const [puntuacion, setPuntuacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  // Estado para la reseña de un amigo
  const [externo, setExterno] = useState<any>(null);
  const [cargandoExterno, setCargandoExterno] = useState(false);

  // Intentamos encontrar el juego en la lista local
  const juego = games.find((g) => g.id === id);

  useEffect(() => {
    if (reviewId) {
      const cargarResenaAmigo = async () => {
        setCargandoExterno(true);
        const { data, error } = await supabase
          .from("criticas")
          .select(`*, perfiles(username, avatar_url)`)
          .eq("id", reviewId)
          .single();

        if (!error && data) {
          setExterno(data);
        }
        setCargandoExterno(false);
      };
      cargarResenaAmigo();
    }
  }, [reviewId]);

  // Si no hay juego local pero hay reseña externa, sacamos el juego de la reseña
  const juegoData = juego || games.find((g) => g.id === externo?.game_id);

  if (!juegoData && !cargandoExterno) {
    return (
      <div className="min-h-screen flex items-center justify-center italic">
        <p>Cargando información del juego...</p>
      </div>
    );
  }

  const publicarCritica = async () => {
    if (puntuacion === 0) return toast.error("Selecciona una puntuación");
    if (!comentario.trim()) return toast.error("Escribe un comentario");

    setEnviando(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return toast.error("Inicia sesión primero");

      const { error } = await supabase.from("criticas").upsert({
        user_id: session.user.id,
        game_id: juegoData?.id,
        rating: puntuacion,
        review: comentario.trim(),
        created_at: new Date().toISOString(),
      }, { onConflict: "user_id,game_id" });

      if (error) throw error;
      toast.success("¡Crítica publicada!");
      navigate("/forum");
    } catch (err: any) {
      toast.error("Error al publicar");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container max-w-5xl py-10 px-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-8 gap-2 rounded-full text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-12">
          
          {/* COLUMNA IZQUIERDA: PORTADA */}
          <div className="space-y-6">
            <div className="relative group">
               <img 
                 src={juegoData?.cover} 
                 className="w-full aspect-[2/3] object-cover rounded-[2.5rem] shadow-2xl border border-white/5"
               />
               <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-2 text-primary">
                <Gamepad2 className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Ficha Técnica</span>
              </div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">
                {juegoData?.year} • {juegoData?.developer}
              </p>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="flex flex-col">
            <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter mb-8 leading-[0.8]">
              {juegoData?.title}
            </h1>
            
            <div className="border-l-4 border-primary/20 pl-6 mb-12">
              <p className="text-xl text-muted-foreground italic leading-relaxed">
                {juegoData?.description}
              </p>
            </div>

            {/* SECCIÓN DINÁMICA */}
            {cargandoExterno ? (
              <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : externo ? (
              /* --- VISTA DIRECTA: RESEÑA DEL AMIGO (Sin clics, solo lectura) --- */
              <section className="bg-gradient-to-b from-[#111] to-[#080808] border border-white/5 p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase italic tracking-tight">
                      Veredicto de <span className="text-primary">{externo.perfiles?.username}</span>
                    </h3>
                    <div className="flex gap-1.5 text-primary">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={cn("w-6 h-6", i < externo.rating ? "fill-current" : "opacity-10")} 
                        />
                      ))}
                    </div>
                  </div>
                  {externo.hours_played && (
                    <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-sm font-black italic">{externo.hours_played}H</span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <span className="absolute -top-6 -left-2 text-6xl text-primary/10 font-serif">“</span>
                  <p className="text-2xl text-foreground/90 italic leading-snug font-medium pl-4">
                    {externo.review}
                  </p>
                  <span className="absolute -bottom-10 -right-2 text-6xl text-primary/10 font-serif">”</span>
                </div>
              </section>
            ) : (
              /* --- VISTA NORMAL: TU FORMULARIO --- */
              <section className="bg-[#0c0c0c] border border-white/5 p-10 rounded-[3rem] shadow-xl">
                <h3 className="text-2xl font-black uppercase italic mb-8 tracking-tight">Tu Veredicto</h3>

                <div className="flex gap-4 mb-10">
                  {[1, 2, 3, 4, 5].map((estrella) => (
                    <button
                      key={estrella}
                      onClick={() => setPuntuacion(estrella)}
                      onMouseEnter={() => setHover(estrella)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-all active:scale-75"
                    >
                      <Star 
                        className={cn(
                          "w-12 h-12 transition-all duration-300",
                          (hover || puntuacion) >= estrella 
                            ? "fill-primary text-primary drop-shadow-[0_0_15px_rgba(255,46,46,0.4)]" 
                            : "text-white/5 hover:text-primary/20"
                        )} 
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Escribe tu reseña aquí (Obligatorio)..."
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="w-full h-48 bg-black/40 border border-white/5 rounded-[2rem] p-8 text-lg mb-8 focus:border-primary/40 outline-none transition-all resize-none italic"
                />

                <Button 
                  onClick={publicarCritica} 
                  disabled={enviando}
                  className="w-full h-20 rounded-3xl bg-primary hover:bg-red-600 text-white font-black uppercase tracking-[0.3em] gap-4 transition-all shadow-2xl shadow-primary/20"
                >
                  {enviando ? <Loader2 className="animate-spin" /> : <><Send className="w-5 h-5" /> Publicar en el Foro</>}
                </Button>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}