/** Ambil field `data` dari response API immax, atau kembalikan payload langsung */
export function unwrapApiData<T>(res: unknown): T | null {
  if (res == null) return null;
  if (typeof res === "object" && "data" in (res as object)) {
    const inner = (res as { data: unknown }).data;
    return (inner ?? null) as T | null;
  }
  return res as T;
}

/** Pastikan hasil fetch berupa array */
export function unwrapApiList<T>(res: unknown): T[] {
  const data = unwrapApiData<T[]>(res);
  if (Array.isArray(data)) return data;
  if (Array.isArray(res)) return res as T[];
  return [];
}

/** Gabungkan hasil Promise.allSettled, abaikan yang gagal */
export async function settleAll<T extends readonly unknown[]>(
  promises: {
    [K in keyof T]: Promise<T[K]>;
  },
): Promise<{ [K in keyof T]: T[K] | null }> {
  const results = await Promise.allSettled(promises);
  return results.map((r) =>
    r.status === "fulfilled" ? r.value : null,
  ) as { [K in keyof T]: T[K] | null };
}
