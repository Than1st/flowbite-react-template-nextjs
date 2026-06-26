import { unwrapApiData } from "@/lib/api/response";

export interface CqiMasterOption {
  area_uraian_id: number;
  master_uraian_id: number;
  uraian_kode?: string;
  uraian_text: string;
  scale: number;
  sort_order?: number;
  label?: string;
}

export interface CqiFormArea {
  id: number;
  name: string;
  max_scale: number;
  weight: string;
  max_cqi: string;
  options: CqiMasterOption[];
}

export interface CqiSubmitAssessment {
  component_area_id: number;
  componentAreaId: number;
  selected_scale: number;
  selectedScale: number;
}

export interface CqiFormSubmitPayload {
  nomor_dokumen: string;
  tanggal: string;
  station_id: number;
  stasiun: string;
  assessor_id: number;
  status: "submitted";
  assessments: CqiSubmitAssessment[];
}

export function parseMasterFormAreas(res: unknown): CqiFormArea[] {
  const root = unwrapApiData<unknown>(res) ?? res;
  if (!root || typeof root !== "object") return [];

  const obj = root as Record<string, unknown>;
  const areas = obj.component_areas;
  if (Array.isArray(areas)) return areas as CqiFormArea[];
  if (Array.isArray(root)) return root as CqiFormArea[];
  return [];
}

export function parseNum(v: string | number | undefined, fallback: number): number {
  if (v === undefined || v === null) return fallback;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

export function getAreaBobot(scale: number, maxScale: number, maxCqi: number): number {
  if (maxScale <= 0) return 0;
  return (scale / maxScale) * maxCqi;
}

export function getGradeWithLabel(total: number): {
  grade: string;
  labelKey: string;
} {
  if (total >= 90) return { grade: "A", labelKey: "grade_sangat_baik" };
  if (total >= 75) return { grade: "B", labelKey: "grade_baik" };
  if (total >= 60) return { grade: "C", labelKey: "grade_cukup" };
  if (total >= 45) return { grade: "D", labelKey: "grade_kurang" };
  return { grade: "E", labelKey: "grade_buruk" };
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case "A":
      return "#22c55e";
    case "B":
      return "#84cc16";
    case "C":
      return "#eab308";
    case "D":
      return "#f97316";
    case "E":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
}

export function sortOptions(opts: CqiMasterOption[]): CqiMasterOption[] {
  return [...opts].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function getOptionLabel(opt: CqiMasterOption): string {
  return opt.uraian_text || opt.label || String(opt.scale);
}

function buildNomorDokumen(tanggal: string, stationId: number): string {
  return `CQI-${tanggal.replace(/-/g, "")}-${stationId}`;
}

export function buildCqiSubmitPayload(
  areas: CqiFormArea[],
  selections: Record<number, CqiMasterOption>,
  ctx: {
    stationId: number;
    stasiunName: string;
    assessorId: number;
    tanggal: string;
  },
): CqiFormSubmitPayload {
  const sorted = [...areas].sort((a, b) => a.id - b.id);
  const assessments: CqiSubmitAssessment[] = sorted.map((area) => {
    const sel = selections[area.id];
    if (!sel) throw new Error("assessment_incomplete");
    return {
      component_area_id: area.id,
      componentAreaId: area.id,
      selected_scale: sel.scale,
      selectedScale: sel.scale,
    };
  });

  return {
    nomor_dokumen: buildNomorDokumen(ctx.tanggal, ctx.stationId),
    tanggal: ctx.tanggal,
    station_id: ctx.stationId,
    stasiun: ctx.stasiunName,
    assessor_id: ctx.assessorId,
    status: "submitted",
    assessments,
  };
}
