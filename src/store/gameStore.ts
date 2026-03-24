import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface GameLog {
  gameId: string;
  rating: number;
  review?: string;
  hoursPlayed?: string;
  date?: string;
}

export interface UserProfile {
  username: string;
  avatarUrl: string;
  favoriteGameIds: string[];
}

const initialProfile: UserProfile = {
  username: "Player",
  avatarUrl: "",
  favoriteGameIds: [],
};

interface GameStore {
  logs: GameLog[];
  watchlist: string[];
  profile: UserProfile;
  isLoading: boolean;
  fetchUserContent: () => Promise<void>;
  logGame: (log: GameLog) => Promise<void>;
  removeLog: (gameId: string) => Promise<void>;
  toggleWatchlist: (gameId: string) => Promise<void>;
  getGameLog: (gameId: string) => GameLog | undefined;
  updateProfile: (partial: Partial<UserProfile>) => Promise<void>;
  resetStore: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  logs: [],
  watchlist: [],
  profile: initialProfile,
  isLoading: false,

  // 1. CARGA INICIAL DE TODO EL CONTENIDO (F5 / Login)
  fetchUserContent: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const userId = session.user.id;

      // Lanzamos las peticiones en paralelo para ir más rápido
      const [logsRes, watchRes, profRes] = await Promise.all([
        supabase.from('criticas').select('*').eq('user_id', userId),
        supabase.from('watchlist').select('game_id').eq('user_id', userId),
        supabase.from('perfiles').select('*').eq('id', userId).single()
      ]);

      set({
        logs: logsRes.data?.map(r => ({
          gameId: r.game_id,
          rating: r.rating,
          review: r.review || "",
          hoursPlayed: r.hours_played || "",
          date: r.created_at
        })) || [],
        watchlist: watchRes.data?.map(w => w.game_id) || [],
        profile: profRes.data ? {
          username: profRes.data.username,
          avatarUrl: profRes.data.avatar_url || "",
          favoriteGameIds: profRes.data.favorites || []
        } : { ...initialProfile, username: session.user.email?.split('@')[0] || "Player" }
      });
    } catch (error) {
      console.error("Error cargando contenido:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // 2. GUARDAR / EDITAR RESEÑA
  logGame: async (log) => {
    const { logs } = get();
    const existing = logs.find((l) => l.gameId === log.gameId);
    
    // Actualización local inmediata
    set({
      logs: existing 
        ? logs.map((l) => l.gameId === log.gameId ? { ...l, ...log } : l)
        : [...logs, log]
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('criticas').upsert({
        user_id: session.user.id,
        game_id: log.gameId,
        rating: log.rating,
        review: log.review || null,
        hours_played: log.hoursPlayed || null
      }, { onConflict: 'user_id,game_id' });
    }
  },

  // 3. ELIMINAR RESEÑA
  removeLog: async (gameId) => {
    set({ logs: get().logs.filter((l) => l.gameId !== gameId) });
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('criticas').delete().match({ 
        user_id: session.user.id, 
        game_id: gameId 
      });
    }
  },

  // 4. GESTIÓN DE PENDIENTES (WATCHLIST)
  toggleWatchlist: async (gameId) => {
    const { watchlist } = get();
    const isAdded = watchlist.includes(gameId);
    
    // UI instantánea
    set({
      watchlist: isAdded 
        ? watchlist.filter(id => id !== gameId) 
        : [...watchlist, gameId]
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      if (isAdded) {
        await supabase.from('watchlist').delete().match({ 
          user_id: session.user.id, 
          game_id: gameId 
        });
      } else {
        await supabase.from('watchlist').insert({ 
          user_id: session.user.id, 
          game_id: gameId 
        });
      }
    }
  },

  // 5. ACTUALIZAR PERFIL (Nombre, Avatar, Favoritos)
  updateProfile: async (partial) => {
    const newProfile = { ...get().profile, ...partial };
    set({ profile: newProfile });

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.from('perfiles').upsert({
        id: session.user.id,
        username: newProfile.username,
        avatar_url: newProfile.avatarUrl,
        favorites: newProfile.favoriteGameIds,
        updated_at: new Date().toISOString()
      });
    }
  },

  getGameLog: (gameId) => get().logs.find((l) => l.gameId === gameId),

  resetStore: () => set({ 
    logs: [], 
    watchlist: [], 
    profile: initialProfile, 
    isLoading: false 
  }),
}));