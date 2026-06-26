import { format, subDays } from "date-fns";

/** Hari operasional CQI: sebelum jam 06:00 masih dianggap hari sebelumnya */
export function getCqiOperationalDateKey(ref: Date = new Date()): string {
  const d = new Date(ref);
  const operational = d.getHours() < 6 ? subDays(d, 1) : d;
  return format(operational, "yyyy-MM-dd");
}

export function rowDateKey(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const key = s.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : null;
}

export type CqiDailyChecklistRow = {
  date?: unknown;
  tanggal?: unknown;
  history?: Array<{ status?: string; shift_no?: number }>;
  summary?: {
    is_completed?: boolean;
    total_shifts_filled?: number;
  };
};

export function isCqiDailyRowFormLocked(
  row: CqiDailyChecklistRow | null | undefined,
): boolean {
  if (!row) return false;
  const history = Array.isArray(row.history) ? row.history : [];
  const submittedCount = history.filter((h) => h?.status === "submitted").length;
  return (
    row.summary?.is_completed === true ||
    Number(row.summary?.total_shifts_filled ?? 0) >= 3 ||
    submittedCount >= 3
  );
}

export function findCqiDailyRowForOperationalToday<T extends { date?: unknown; tanggal?: unknown }>(
  rows: T[],
  ref: Date = new Date(),
): T | null {
  const todayKey = getCqiOperationalDateKey(ref);
  return (
    rows.find((row) => rowDateKey(row.date ?? row.tanggal) === todayKey) ?? null
  );
}
