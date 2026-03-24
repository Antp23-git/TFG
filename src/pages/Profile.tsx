import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useGameStore } from "@/store/gameStore";
import { RatingStats } from "@/components/RatingStats";
import { DiaryCalendar } from "@/components/DiaryCalendar";
import { FavoriteSlots } from "@/components/FavoriteSlots"; // Asegúrate que este componente use la columna favorite_game_id
import { Input } from "@/components/ui/input";
import { User as UserIcon, Trophy, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Profile = () => {
  const { profile, updateProfile, logs } = useGameStore();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);
  
  // Estados para contadores sociales y favoritos
  const [statsSocial, setStatsSocial] = useState({ seguidores: 0, seguidos: 0 });
  const [totalCriticas, setTotalCriticas] = useState(0);

  useEffect(() => {
    fetchUserDataAndStats();
  }, []);

  const fetchUserDataAndStats = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const userId = session.user.id;

    // 1. Obtener datos del perfil real y favoritos
    const { data: perfilDB } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (perfilDB) {
      updateProfile({ 
        username: perfilDB.username, 
        avatarUrl: perfilDB.avatar_url,
        // Si tu store soporta favorito, actualízalo aquí
      });
      setNameInput(perfilDB.username);
    }

    // 2. Obtener estadísticas sociales
    const { count: seguidores } = await supabase
      .from("seguimientos")
      .select("*", { count: 'exact', head: true })
      .eq("seguido_id", userId);

    const { count: seguidos } = await supabase
      .from("seguimientos")
      .select("*", { count: 'exact', head: true })
      .eq("seguidor_id", userId);

    // 3. Obtener total de críticas real
    const { count: criticasCount } = await supabase
      .from("criticas")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId);

    setStatsSocial({
      seguidores: seguidores || 0,
      seguidos: seguidos || 0
    });
    setTotalCriticas(criticasCount || 0);
  };

  const saveUsername = async () => {
    if (!nameInput.trim() || nameInput === profile.username) return setEditing(false);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("perfiles")
      .update({ username: nameInput })
      .eq("id", session.user.id);

    if (!error) {
      updateProfile({ username: nameInput });
      toast.success("Nombre de usuario actualizado");
    } else {
      toast.error("Error al actualizar nombre");
    }
    setEditing(false);
  };

  const avgRating = totalCriticas > 0
    ? (logs.reduce((sum, l) => sum + l.rating, 0) / logs.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      <main className="container max-w-6xl py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          
          {/* COLUMNA IZQUIERDA: Perfil y Stats */}
          <aside className="space-y-6">
            <div className="bg-[#0c0c0c] border border-white/5 p-8 rounded-[2.5rem] shadow-xl text-center relative overflow-hidden">
              {/* Decoración de fondo */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              
              <div className="relative mx-auto w-24 h-24 rounded-full bg-muted border-4 border-primary/20 p-1 mb-4 shadow-[0_0_20px_rgba(255,46,46,0.1)]">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-white/5">
                    <UserIcon className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>

              {editing ? (
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={saveUsername}
                  onKeyDown={(e) => e.key === "Enter" && saveUsername()}
                  className="text-center bg-white/5 border-primary/30 font-bold rounded-xl h-10 mb-4"
                  autoFocus
                />
              ) : (
                <h1 
                  onClick={() => setEditing(true)}
                  className="text-3xl font-black uppercase italic tracking-tighter cursor-pointer hover:text-primary transition-colors mb-4"
                >
                  {profile.username}
                </h1>
              )}

              <div className="flex justify-center gap-6 py-4 border-t border-white/5">
                <div>
                  <p className="text-xl font-black text-primary leading-none">{statsSocial.seguidores}</p>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Seguidores</p>
                </div>
                <div className="w-px h-8 bg-white/5" />
                <div>
                  <p className="text-xl font-black text-primary leading-none">{statsSocial.seguidos}</p>
                  <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Siguiendo</p>
                </div>
              </div>
            </div>

            {/* Stats Rápidas Estilo "Card" */}
            <div className="bg-primary p-8 rounded-[2.5rem] shadow-lg shadow-primary/10 relative overflow-hidden group">
              <Trophy className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Total Críticas</p>
              <p className="text-6xl font-black italic text-white leading-none">{totalCriticas}</p>
              <div className="mt-6 flex items-center gap-2">
                <Star className="w-4 h-4 text-white fill-white" />
                <span className="text-sm font-bold text-white uppercase italic tracking-tighter">Media: {avgRating}</span>
              </div>
            </div>

            {/* Favoritos - Asegúrate de que este componente use 'favorite_game_id' */}
            <div className="bg-[#0c0c0c] border border-white/5 p-6 rounded-[2.5rem]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 px-2">Juego de Culto</h3>
              <FavoriteSlots />
            </div>
          </aside>

          {/* COLUMNA DERECHA: Actividad y Distribución */}
          <div className="space-y-8">
            {/* Calendario de Actividad */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-[3rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8 px-4">
                <h2 className="font-display text-3xl font-black uppercase italic tracking-tighter">
                  TU <span className="text-primary">DIARIO</span>
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent ml-8" />
              </div>
              <DiaryCalendar />
            </div>

            {/* Distribución de Notas (Sin filtros de tiempo) */}
            <div className="bg-[#0c0c0c] border border-white/5 rounded-[3rem] p-8">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary mb-8 px-4 italic">
                Distribución de valoraciones
              </h3>
              <div className="px-4">
                {/* Pasamos 'all' fijo para quitar la opción de mes/año interna si el componente la tiene */}
                <RatingStats filter="all" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;