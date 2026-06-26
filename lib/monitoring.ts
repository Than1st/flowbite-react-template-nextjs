import { unwrapApiData } from "@/lib/api/response";

export interface MonitoringIssue {
  id: number;
  checklist_item_id: number;
  item_name: string;
  item_code: string;
  location: string;
  status: string;
  remarks?: string;
  finish_target?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: { id?: number };
  evidence?: { photo_url?: string } | null;
  category_name?: string;
}

type RawIssue = Record<string, unknown>;

function normalizeIssue(raw: RawIssue): MonitoringIssue | null {
  const id = Number(raw.id ?? 0);
  if (!id) return null;

  const stasiunItem = raw.stasiun_item as RawIssue | undefined;
  const checklistItem = raw.checklist_item as RawIssue | undefined;
  const checklistItemInner = checklistItem?.item as RawIssue | undefined;

  const checklist_item_id = Number(
    stasiunItem?.id ??
      checklistItem?.id ??
      raw.checklist_item_id ??
      id,
  );

  const item_name = String(
    stasiunItem?.item_name ??
      checklistItemInner?.item_name ??
      raw.item_name ??
      "-",
  );

  const item_code = String(
    stasiunItem?.item_code ??
      checklistItemInner?.no_series ??
      raw.item_code ??
      "-",
  );

  const location = String(
    stasiunItem?.location ??
      checklistItemInner?.location ??
      raw.location ??
      "-",
  );

  const status = String(raw.status ?? "open");

  return {
    id,
    checklist_item_id,
    item_name,
    item_code,
    location,
    status,
    remarks: raw.remarks ? String(raw.remarks) : undefined,
    finish_target: raw.finish_target ? String(raw.finish_target) : undefined,
    created_at: raw.created_at ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at ? String(raw.updated_at) : undefined,
    created_by: raw.created_by as MonitoringIssue["created_by"],
    evidence: raw.evidence as MonitoringIssue["evidence"],
    category_name: raw.category_name ? String(raw.category_name) : undefined,
  };
}

/** Ubah response API monitoring (array / grouped / paginated) jadi list datar */
export function flattenMonitoringResponse(res: unknown): MonitoringIssue[] {
  const root = unwrapApiData<unknown>(res) ?? res;

  let rows: RawIssue[] = [];

  if (Array.isArray(root)) {
    rows = root as RawIssue[];
  } else if (root && typeof root === "object") {
    const obj = root as Record<string, unknown>;

    if (Array.isArray(obj.data)) {
      rows = obj.data as RawIssue[];
    } else {
      for (const [key, value] of Object.entries(obj)) {
        if (key === "pagination" || key === "meta") continue;
        if (Array.isArray(value)) {
          rows.push(
            ...value.map((item) => ({
              ...(item as RawIssue),
              category_name: key,
            })),
          );
        }
      }
    }
  }

  return rows
    .map((row) => normalizeIssue(row))
    .filter((row): row is MonitoringIssue => row !== null);
}

export function matchesMonitoringTab(
  status: string | undefined,
  tab: string,
): boolean {
  if (tab === "All") return true;
  const normalized = (status ?? "").toLowerCase().replace(/_/g, " ");
  if (tab === "In Progress") {
    return normalized === "in progress" || status === "in_progress";
  }
  return normalized === tab.toLowerCase();
}
