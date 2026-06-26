import { create } from "zustand";
import {
  clearLoginData,
  getLoginData,
  isTokenExpired,
  setLoginData,
} from "@/lib/auth";
import { normalizeUserData } from "@/lib/auth-user";
import { authService } from "@/lib/api/services/auth.service";
import type { LoginData, StationData, UserData } from "@/types";

interface AuthState {
  loginData: LoginData | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  setSession: (data: LoginData) => void;
  updateStation: (station: StationData) => void;
  logout: () => void;
}

function readStoredSession(): LoginData | null {
  const stored = getLoginData();
  if (!stored?.token) return null;
  if (isTokenExpired(stored.token)) {
    clearLoginData();
    return null;
  }
  return stored;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  loginData: null,
  initialized: false,

  initialize: async () => {
    const stored = readStoredSession();
    if (!stored) {
      set({ loginData: null, initialized: true });
      return;
    }

    set({ loginData: stored, initialized: true });

    // Validasi server opsional — tidak pernah hapus sesi jika gagal
    try {
      const response = await authService.checkToken(stored.token);
      if (response.valid === true && response.user) {
        // Gabungkan data server dengan sesi lokal — jangan timpa stasiun yang sudah dipilih
        const merged = normalizeUserData({
          ...(response.user as UserData),
          ...stored.userData,
          stasiun_id:
            stored.userData.stasiun_id ||
            (response.user as UserData).stasiun_id,
          stasiun_name:
            stored.userData.stasiun_name ||
            (response.user as UserData).stasiun_name,
        }) ?? {
          ...stored.userData,
          ...(response.user as UserData),
          stasiun_id:
            stored.userData.stasiun_id ||
            (response.user as UserData).stasiun_id,
          stasiun_name:
            stored.userData.stasiun_name ||
            (response.user as UserData).stasiun_name,
        };
        const updated: LoginData = {
          ...stored,
          userData: merged,
        };
        setLoginData(updated);
        set({ loginData: updated });
      }
    } catch {
      // Pertahankan sesi lokal
    }
  },

  setSession: (data) => {
    setLoginData(data);
    set({ loginData: data, initialized: true });
  },

  updateStation: (station) => {
    const current = get().loginData ?? readStoredSession();
    if (!current) return;
    const updated: LoginData = {
      ...current,
      userData: {
        ...current.userData,
        stasiun_id: station.stasiun_id,
        stasiun_name: station.stasiun_name,
      },
    };
    setLoginData(updated);
    set({ loginData: updated });
  },

  logout: () => {
    clearLoginData();
    set({ loginData: null, initialized: true });
  },
}));
