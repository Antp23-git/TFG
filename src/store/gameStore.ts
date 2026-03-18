import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GameLog {
  gameId: string;
  rating: number;
  review?: string;
  hoursPlayed?: string;
  date?: string; // ISO date string - only set when using "+" log
}

export interface UserProfile {
  username: string;
  avatarUrl: string;
  favoriteGameIds: string[]; // max 4
}

interface GameStore {
  logs: GameLog[];
  watchlist: string[]; // "play later" game IDs
  profile: UserProfile;
  friends: string[]; // friend usernames

  rateGame: (gameId: string, rating: number) => void;
  logGame: (log: GameLog) => void;
  removeLog: (gameId: string) => void;
  toggleWatchlist: (gameId: string) => void;
  setFavorite: (slot: number, gameId: string) => void;
  removeFavorite: (gameId: string) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  getGameLog: (gameId: string) => GameLog | undefined;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      logs: [],
      watchlist: [],
      profile: {
        username: "Player",
        avatarUrl: "",
        favoriteGameIds: [],
      },
      friends: [],

      rateGame: (gameId, rating) => {
        const existing = get().logs.find((l) => l.gameId === gameId);
        if (existing) {
          set({
            logs: get().logs.map((l) =>
              l.gameId === gameId ? { ...l, rating } : l
            ),
          });
        } else {
          set({ logs: [...get().logs, { gameId, rating }] });
        }
      },

      logGame: (log) => {
        const existing = get().logs.find((l) => l.gameId === log.gameId);
        if (existing) {
          set({
            logs: get().logs.map((l) =>
              l.gameId === log.gameId ? { ...l, ...log } : l
            ),
          });
        } else {
          set({ logs: [...get().logs, log] });
        }
      },

      removeLog: (gameId) => {
        set({ logs: get().logs.filter((l) => l.gameId !== gameId) });
      },

      toggleWatchlist: (gameId) => {
        const wl = get().watchlist;
        if (wl.includes(gameId)) {
          set({ watchlist: wl.filter((id) => id !== gameId) });
        } else {
          set({ watchlist: [...wl, gameId] });
        }
      },

      setFavorite: (slot, gameId) => {
        const favs = [...get().profile.favoriteGameIds];
        while (favs.length < 4) favs.push("");
        // Remove if already in another slot
        const existingIdx = favs.indexOf(gameId);
        if (existingIdx !== -1) favs[existingIdx] = "";
        favs[slot] = gameId;
        set({ profile: { ...get().profile, favoriteGameIds: favs } });
      },

      removeFavorite: (gameId) => {
        set({
          profile: {
            ...get().profile,
            favoriteGameIds: get().profile.favoriteGameIds.map((id) =>
              id === gameId ? "" : id
            ),
          },
        });
      },

      updateProfile: (partial) => {
        set({ profile: { ...get().profile, ...partial } });
      },

      getGameLog: (gameId) => {
        return get().logs.find((l) => l.gameId === gameId);
      },
    }),
    { name: "gameboxd-storage" }
  )
);
