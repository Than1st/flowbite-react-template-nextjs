import { apiGet, apiPost } from "@/lib/api/client";
import type { ConsumptionRecord, MonitoringStatus } from "@/types";

export const dashboardService = {
  getMonitoringStatus: (stasiunId: number) =>
    apiGet<MonitoringStatus>(
      `/dashboard/monitoring-status/stasiun/${stasiunId}`,
    ),

  getUserActivity: (userId: number) =>
    apiGet(`/dashboard/user-activity/${userId}`),

  getLatestConsumption: (stasiunId: number) =>
    apiGet(`/dashboard/latest-consumption`, { stasiun_id: stasiunId }),

  createConsumptionRecord: (record: ConsumptionRecord) =>
    apiPost("/dashboard/consumption-records", record),
};
