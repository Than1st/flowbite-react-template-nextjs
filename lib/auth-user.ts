import type { UserData } from "@/types";

type RawUser = Record<string, unknown>;

function pickStasiunId(r: RawUser): number {
  const direct = Number(r.stasiun_id ?? r.stasiunId ?? 0);
  if (direct) return direct;

  const stasiunData = r.stasiun_data;
  if (Array.isArray(stasiunData) && stasiunData.length > 0) {
    const first = stasiunData[0] as { id?: number };
    if (first?.id) return Number(first.id);
  }

  const stations = r.stations;
  if (Array.isArray(stations) && stations.length > 0) {
    const first = stations[0] as { id?: number; stasiun_id?: number };
    const id = first?.id ?? first?.stasiun_id;
    if (id) return Number(id);
  }

  const ids = r.stasiun_ids;
  if (Array.isArray(ids) && ids.length > 0) {
    return Number(ids[0]);
  }

  return 0;
}

function pickStasiunName(r: RawUser, stasiunId: number): string {
  const direct = String(r.stasiun_name ?? r.stasiunName ?? "");
  if (direct) return direct;

  const stasiunData = r.stasiun_data;
  if (Array.isArray(stasiunData)) {
    const match = stasiunData.find(
      (s) => Number((s as { id?: number }).id) === stasiunId,
    ) as { name?: string } | undefined;
    if (match?.name) return String(match.name);
    if (stasiunData[0]) {
      return String((stasiunData[0] as { name?: string }).name ?? "");
    }
  }

  const names = r.stasiun_names;
  const ids = r.stasiun_ids;
  if (Array.isArray(names) && Array.isArray(ids)) {
    const idx = ids.findIndex((id) => Number(id) === stasiunId);
    if (idx >= 0 && names[idx]) return String(names[idx]);
  }

  return "";
}

/** Normalisasi field user dari JWT / response API yang formatnya bervariasi */
export function normalizeUserData(
  raw: UserData | RawUser | null | undefined,
): UserData | null {
  if (!raw || typeof raw !== "object") return null;

  const r = raw as RawUser;

  const userId = Number(
    r.userId ?? r.user_id ?? r.id ?? 0,
  );
  if (!userId) return null;

  const stasiun_id = pickStasiunId(r);
  const stasiun_name = pickStasiunName(r, stasiun_id);

  const roleId = Number(r.roleId ?? r.role_id ?? 0);

  return {
    userId,
    stasiun_id,
    roleId,
    roleName: String(r.roleName ?? r.role_name ?? ""),
    username: String(r.username ?? ""),
    nipp: String(r.nipp ?? ""),
    nama: r.nama ? String(r.nama) : undefined,
    posisi: r.posisi ? String(r.posisi) : undefined,
    image:
      typeof r.image === "string" && r.image
        ? r.image
        : undefined,
    stasiun_name,
    stasiun_data: r.stasiun_data as UserData["stasiun_data"],
    stasiun_ids: r.stasiun_ids as number[] | undefined,
    stasiun_names: r.stasiun_names as string[] | undefined,
    stations: r.stations as UserData["stations"],
    exp: r.exp as number | undefined,
    iat: r.iat as number | undefined,
  };
}

export function normalizeSsoToken(
  ssoToken?: unknown,
): string | { token?: string } | undefined {
  if (!ssoToken) return undefined;
  if (typeof ssoToken === "string") return ssoToken;
  if (typeof ssoToken === "object" && ssoToken !== null) {
    const obj = ssoToken as Record<string, unknown>;
    const token = obj.token ?? obj.access_token ?? obj.ssoToken;
    if (typeof token === "string") return token;
    if (typeof obj.token === "string") return { token: obj.token };
  }
  return undefined;
}

export function extractSsoToken(
  ssoToken?: string | { token?: string } | null,
): string | null {
  if (!ssoToken) return null;
  if (typeof ssoToken === "string") return ssoToken;
  return ssoToken.token ?? null;
}
