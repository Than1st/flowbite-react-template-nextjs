import { jwtDecode } from "jwt-decode";
import type { LoginData, StationData, UserData } from "@/types";
import { storage, STORAGE_KEYS } from "@/lib/storage";

export function getLoginData(): LoginData | null {
  return storage.get<LoginData>(STORAGE_KEYS.LOGIN_DATA);
}

export function setLoginData(data: LoginData): void {
  storage.set(STORAGE_KEYS.LOGIN_DATA, data);
}

export function clearLoginData(): void {
  storage.remove(STORAGE_KEYS.LOGIN_DATA);
}

export function isTokenExpired(token: string): boolean {
  if (!token || typeof token !== "string") return true;
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) return false;
    return decoded.exp < Date.now() / 1000;
  } catch {
    // Token non-JWT atau format khusus — anggap masih valid, biarkan server yang menilai
    return token.split(".").length !== 3;
  }
}

export function isAuthenticated(): boolean {
  const loginData = getLoginData();
  if (!loginData?.token) return false;
  return !isTokenExpired(loginData.token);
}

export function getUserData(): UserData | null {
  const loginData = getLoginData();
  return loginData?.userData ?? null;
}

export function parseStationsFromUser(userData: UserData): StationData[] {
  if (Array.isArray(userData.stasiun_data)) {
    return userData.stasiun_data.map((s) => ({
      stasiun_id: s.id,
      stasiun_name: s.name,
    }));
  }
  if (Array.isArray(userData.stasiun_ids)) {
    return userData.stasiun_ids.map((id, index) => ({
      stasiun_id: id,
      stasiun_name: userData.stasiun_names?.[index] ?? `Stasiun ${id}`,
    }));
  }
  if (
    Array.isArray(userData.stasiun_id) &&
    Array.isArray(userData.stasiun_name)
  ) {
    return (userData.stasiun_id as unknown as number[]).map((id, index) => ({
      stasiun_id: id,
      stasiun_name: (userData.stasiun_name as unknown as string[])[index] ?? `Stasiun ${id}`,
    }));
  }
  if (Array.isArray(userData.stations)) {
    return userData.stations.map((s) => ({
      stasiun_id: s.id ?? s.stasiun_id ?? 0,
      stasiun_name: s.name ?? s.stasiun_name ?? `Stasiun ${s.id ?? s.stasiun_id}`,
    }));
  }
  if (userData.stasiun_id && !Array.isArray(userData.stasiun_id)) {
    return [
      {
        stasiun_id: userData.stasiun_id,
        stasiun_name: userData.stasiun_name,
      },
    ];
  }
  return [];
}

export function formatDisplayName(name?: string): string {
  if (!name) return "User";
  return name
    .split(" ")
    .map((word, index) => (index === 0 ? word : `${word[0]}.`))
    .join(" ");
}
