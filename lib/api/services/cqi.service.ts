import { apiGet, apiPost } from "@/lib/api/client";
import type { CqiFormSubmitPayload } from "@/lib/cqi-form";

export const cqiService = {
  getDailyChecklists: (params: Record<string, unknown>) =>
    apiGet("/cqi/daily-checklists", params),

  getMasterForm: () => apiGet("/cqi/master-form"),

  submit: (payload: CqiFormSubmitPayload) => apiPost("/cqi/submit", payload),

  getPrintData: (documentId: number, params?: Record<string, unknown>) =>
    apiGet(`/cqi/documents/${documentId}/print-data`, params),
};
