"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useResolvedAuth } from "@/hooks/useResolvedAuth";
import { dashboardService } from "@/lib/api/services/dashboard.service";
import { notificationService } from "@/lib/api/services/notification.service";
import { cqiService } from "@/lib/api/services/cqi.service";
import { settleAll, unwrapApiData, unwrapApiList } from "@/lib/api/response";
import type {
  ConsumptionRecord,
  CqiDashboardInfo,
  DashboardNotification,
  MonitoringStatusData,
  UserActivityData,
} from "@/types/dashboard";

function parseCqiInfo(rows: Record<string, unknown>[]): CqiDashboardInfo {
  if (rows.length === 0) {
    return { value: 0, submittedShiftsCount: 0 };
  }

  const sorted = [...rows].sort((a, b) => {
    const ta = new Date(
      String(a.date ?? a.updated_at ?? a.created_at ?? 0),
    ).getTime();
    const tb = new Date(
      String(b.date ?? b.updated_at ?? b.created_at ?? 0),
    ).getTime();
    return tb - ta;
  });

  const latest = sorted[0];
  const histories = Array.isArray(latest.history) ? latest.history : [];
  const submittedShiftsCount = histories.filter(
    (h: { status?: string }) => h?.status === "submitted",
  ).length;
  const summary = latest.summary as Record<string, unknown> | undefined;
  const value =
    Number(summary?.total_cqi ?? summary?.summary_total_cqi ?? 0) || 0;

  return {
    value: Math.max(0, Math.min(100, value)),
    grade: String(summary?.summary_grade ?? ""),
    createdAt: String(
      summary?.summary_generated_at ??
        latest.updated_at ??
        latest.created_at ??
        "",
    ) || undefined,
    submittedShiftsCount,
  };
}

export function useDashboard() {
  const { userData, ready, loading: authLoading } = useResolvedAuth();
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatusData | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivityData | null>(null);
  const [consumption, setConsumption] = useState<ConsumptionRecord[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [cqiInfo, setCqiInfo] = useState<CqiDashboardInfo>({
    value: 0,
    submittedShiftsCount: 0,
  });
  const [fetching, setFetching] = useState(false);
  const [cqiLoading, setCqiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRefreshing = useRef(false);

  const loadCqi = useCallback(async (stasiunId: number) => {
    setCqiLoading(true);
    try {
      const cqiRes = await cqiService.getDailyChecklists({
        station_id: stasiunId,
        page: 1,
        limit: 10,
        include_summary_items: 1,
      });
      setCqiInfo(parseCqiInfo(unwrapApiList<Record<string, unknown>>(cqiRes)));
    } catch {
      setCqiInfo({ value: 0, submittedShiftsCount: 0 });
    } finally {
      setCqiLoading(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!ready || !userData?.stasiun_id || !userData?.userId) return;
    if (isRefreshing.current) return;

    isRefreshing.current = true;
    setFetching(true);
    setError(null);

    const { stasiun_id, userId } = userData;

    // CQI di-fetch terpisah agar tidak menghambat widget utama
    void loadCqi(stasiun_id);

    try {
      const [statusRes, activityRes, consumptionRes, notifRes] =
        await settleAll([
          dashboardService.getMonitoringStatus(stasiun_id),
          dashboardService.getUserActivity(userId),
          dashboardService.getLatestConsumption(stasiun_id),
          notificationService.getByUser(userId),
        ]);

      if (statusRes) {
        const status =
          unwrapApiData<MonitoringStatusData>(statusRes) ??
          (statusRes as MonitoringStatusData);
        setMonitoringStatus(status);
      }

      if (activityRes) {
        setUserActivity(unwrapApiData<UserActivityData>(activityRes));
      }

      if (consumptionRes) {
        setConsumption(unwrapApiList<ConsumptionRecord>(consumptionRes));
      }

      if (notifRes) {
        setNotifications(unwrapApiList<DashboardNotification>(notifRes));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat dashboard");
    } finally {
      setFetching(false);
      isRefreshing.current = false;
    }
  }, [ready, userData?.stasiun_id, userData?.userId, loadCqi]);

  useEffect(() => {
    if (!ready) return;
    loadDashboard();
  }, [ready, loadDashboard]);

  const statusCards = [
    {
      type: "Open" as const,
      count: Number(monitoringStatus?.open) || 0,
      lastUpdated: monitoringStatus?.latest_created_at_per_status?.open ?? null,
    },
    {
      type: "Closed" as const,
      count: Number(monitoringStatus?.closed) || 0,
      lastUpdated: monitoringStatus?.latest_created_at_per_status?.closed ?? null,
    },
    {
      type: "In Progress" as const,
      count: Number(monitoringStatus?.pending) || 0,
      lastUpdated: monitoringStatus?.latest_created_at_per_status?.pending ?? null,
    },
  ];

  const loading = authLoading || fetching;

  return {
    loading,
    cqiLoading,
    error,
    statusCards,
    userActivity,
    consumption,
    notifications,
    cqiInfo,
    refresh: loadDashboard,
  };
}
