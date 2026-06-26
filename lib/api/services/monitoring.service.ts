import { api, apiGet, apiPost } from "@/lib/api/client";

export const monitoringService = {
  getList: (params: Record<string, unknown>) =>
    apiGet("/monitoring", params),

  getStatus: (stasiunId: number) =>
    apiGet(`/dashboard/monitoring-status/stasiun/${stasiunId}`),

  getActiveReport: (stasiunId: number, params?: Record<string, unknown>) =>
    apiGet("/monitoring/active-report", { stasiun_id: stasiunId, ...params }),

  getDetail: (monitoringId: number) =>
    apiGet(`/monitoring/${monitoringId}`),

  add: async (data: Record<string, unknown>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "evidence" && value instanceof File) {
        formData.append("evidence", value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    const res = await api.post("/monitoring/add", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  process: (data: Record<string, unknown>) =>
    apiPost("/monitoring/process", {
      checklist_item_id: data.checklist_item_id,
      finish_target: data.finish_target,
      modify_by: data.modify_by,
      created_by: data.created_by,
      evidence: data.evidence ?? null,
      status: data.status ?? "in_progress",
    }),

  complete: async (data: Record<string, unknown>) => {
    const formData = new FormData();
    formData.append("checklist_item_id", String(data.checklist_item_id));
    formData.append("created_by", String(data.created_by));
    formData.append("modify_by", String(data.modify_by));
    formData.append("finish_target", String(data.finish_target));
    formData.append("status", "closed");
    formData.append("remarks", String(data.remarks ?? ""));

    if (data.evidence instanceof File) {
      formData.append("evidence", data.evidence);
    }

    const res = await api.post("/monitoring/complete", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  createSusulan: (data: Record<string, unknown>) =>
    apiPost("/monitoring/create", data),
};
