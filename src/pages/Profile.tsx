import { useState } from "react";
import { Header } from "@/components/Header";
import { useGameStore } from "@/store/gameStore";
import { RatingStats } from "@/components/RatingStats";
import { DiaryCalendar } from "@/components/DiaryCalendar";
import { FavoriteSlots } from "@/components/FavoriteSlots";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

const Profile = () => {
  const { profile, updateProfile, logs } = useGameStore();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile.username);
  const [statsFilter, setStatsFilter] = useState<"all" | "year" | "month">("all");

  const totalRated = logs.length;
  const avgRating = totalRated > 0
    ? (logs.reduce((sum, l) => sum + l.rating, 0) / totalRated).toFixed(1)
    : "—";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateProfile({ avatarUrl: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Avatar & Username */}
            <div className="flex flex-col items-center gap-3">
              <label className="relative w-24 h-24 rounded-full bg-muted border-2 border-border overflow-hidden cursor-pointer group">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-foreground">Cambiar</span>
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
              </label>

              {editing ? (
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={() => {
                    updateProfile({ username: nameInput || "Player" });
                    setEditing(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateProfile({ username: nameInput || "Player" });
                      setEditing(false);
                    }
                  }}
                  className="text-center bg-muted border-border w-40"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="font-display text-lg text-foreground hover:text-primary transition-colors"
                >
                  {profile.username}
                </button>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="font-mono-data text-2xl text-foreground">{totalRated}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Juegos</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="font-mono-data text-2xl text-foreground">{avgRating}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Media</p>
              </div>
            </div>

            {/* Favorites */}
            <FavoriteSlots />

            {/* Stats */}
            <div className="space-y-2">
              <div className="flex gap-1">
                {(["all", "year", "month"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatsFilter(f)}
                    className={`px-2 py-1 rounded text-[10px] uppercase transition-colors ${
                      statsFilter === f
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {f === "all" ? "Total" : f === "year" ? "Año" : "Mes"}
                  </button>
                ))}
              </div>
              <RatingStats filter={statsFilter} />
            </div>
          </aside>

          {/* Main Content - Diary */}
          <div className="space-y-6">
            <h2 className="font-display text-xl">Diario</h2>
            <DiaryCalendar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
