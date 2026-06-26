const isBrowser = () => typeof window !== "undefined";

export const storage = {
  get<T>(key: string): T | null {
    if (!isBrowser()) return null;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  set(key: string, value: unknown): void {
    if (!isBrowser()) return;
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key: string): void {
    if (!isBrowser()) return;
    localStorage.removeItem(key);
  },

  clear(): void {
    if (!isBrowser()) return;
    localStorage.clear();
  },
};

export const STORAGE_KEYS = {
  LOGIN_DATA: "loginData",
  LANGUAGE: "language",
  LATEST_CHECKLIST_ID: "latestChecklistId",
  CONSUMPTION_RECORD_DATES: "consumptionRecordDates",
} as const;
