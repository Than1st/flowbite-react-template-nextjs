import { apiGet, downloadPdf } from "@/lib/api/client";

export const reportService = {
  getList: (stasiunId: number) =>
    apiGet("/reports", { stasiun_id: stasiunId }),

  downloadPdf: (reportId: number) =>
    downloadPdf(`/reports/${reportId}/pdf`),
};
