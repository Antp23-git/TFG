import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useGameStore } from "@/store/gameStore";
import { RatingStats } from "@/components/RatingStats";
import { DiaryCalendar } from "@/components/DiaryCalendar";
import { FavoriteSlots } from "@/components/FavoriteSlots";
import { Input } from "@/components/ui/input";
import { User as UserIcon, Users, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const Profile = () => {
  const { profile, updateProfile, logs } = useGameStore();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);
  const [statsFilter, setStatsFilter] = useState<"all" | "year" | "month">("all");
  
  // Estados para contadores sociales
  const [statsSocial, setStatsSocial] = useState({ seguidores: 0, seguidos: 0 });

  useEffect(() => {
    const fetchUserDataAndStats = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      // 1. Obtener datos del perfil real desde Supabase
      const { data: perfilDB } = await supabase
        .from("perfiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (perfilDB) {
        updateProfile({ 
          username: perfilDB.username, 
          avatarUrl: perfilDB.avatar_url 
        });
        setNameInput(perfilDB.username);
      }

      // 2. Obtener estadísticas de seguidores/seguidos
      const { count: seguidores } = await supabase
        .from("seguimientos")
        .select("*", { count: 'exact', head: true })
        .eq("seguido_id", userId);

      const { count: seguidos } = await supabase
        .from("seguimientos")
        .select("*", { count: 'exact', head: true })
        .eq("seguidor_id", userId);

      setStatsSocial({
        seguidores: seguidores || 0,
        seguidos: seguidos || 0
      });
    };

    fetchUserDataAndStats();
  }, []);

  // Función para guardar el nombre en la base de datos
  const saveUsername = async () => {
    if (!nameInput.trim()) return setEditing(false);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("perfiles")
      .update({ username: nameInput })
      .eq("id", session.user.id);

    if (!error) {
      updateProfile({ username: nameInput });
      toast.success("Perfil actualizado");
    } else {
      toast.error("Error al actualizar nombre");
    }
    setEditing(false);
  };

  const totalRated = logs.length;
  const avgRating = totalRated > 0
    ? (logs.reduce((sum, l) => sum + l.rating, 0) / totalRated).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
          
          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="flex flex-col items-center gap-4 bg-card p-6 rounded-[2rem] border border-border/50 shadow-sm">
              <div className="relative w-24 h-24 rounded-full bg-muted border-4 border-background overflow-hidden shadow-xl">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
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
                  className="text-center h-9 bg-muted border-primary/30 font-bold rounded-full"
                  autoFocus
                />
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => setEditing(true)}
                    className="font-display text-2xl font-black text-foreground hover:text-primary transition-colors uppercase italic tracking-tighter"
                  >
                    {profile.username}
                  </button>
                  <div className="flex gap-4 mt-3 justify-center">
                    <div className="text-center">
                      <p className="text-xs font-black text-primary">{statsSocial.seguidores}</p>
                      <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest">Seguidores</p>
                    </div>
                    <div className="text-center border-l border-border/50 pl-4">
                      <p className="text-xs font-black text-primary">{statsSocial.seguidos}</p>
                      <p className="text-[9px] uppercase text-muted-foreground font-bold tracking-widest">Siguiendo</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-primary">{totalRated}</p>
                <p className="text-[9px] text-primary/60 uppercase font-bold tracking-tighter">Juegos</p>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-primary">{avgRating}</p>
                <p className="text-[9px] text-primary/60 uppercase font-bold tracking-tighter">Nota Media</p>
              </div>
            </div>

            <FavoriteSlots />

            {/* Gráfico de valoraciones */}
            <div className="bg-card border border-border/50 rounded-[2rem] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Distribución</h3>
                <div className="flex gap-1 bg-muted p-0.5 rounded-lg">
                  {(["all", "year", "month"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatsFilter(f)}
                      className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${
                        statsFilter === f ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f === "all" ? "Tot" : f === "year" ? "Año" : "Mes"}
                    </button>
                  ))}
                </div>
              </div>
              <RatingStats filter={statsFilter} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="bg-card rounded-[2.5rem] border border-border/50 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-3xl font-black uppercase italic tracking-tighter">
                  Tu <span className="text-primary">Actividad</span>
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent ml-6"></div>
              </div>
              <DiaryCalendar />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Profile;