"use client";

import { useCallback, useEffect, useState } from "react";
import { monitoringService } from "@/lib/api/services/monitoring.service";
import { useResolvedAuth } from "@/hooks/useResolvedAuth";
import { flattenMonitoringResponse } from "@/lib/monitoring";
import type { MonitoringIssue } from "@/lib/monitoring";

interface UseMonitoringOptions {
  page?: number;
  limit?: number;
  resolved?: boolean;
  autoLoad?: boolean;
}

export function useMonitoring(options: UseMonitoringOptions = {}) {
  const { page = 1, limit = 100, resolved = false, autoLoad = true } = options;
  const { userData, ready, loading: authLoading } = useResolvedAuth();

  const [issues, setIssues] = useState<MonitoringIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!ready || !userData?.stasiun_id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await monitoringService.getList({
        stasiun_id: userData.stasiun_id,
        page,
        limit,
        resolved,
      });
      setIssues(flattenMonitoringResponse(res));
    } catch (err) {
      setIssues([]);
      setError(
        err instanceof Error ? err.message : "Gagal memuat data monitoring",
      );
    } finally {
      setLoading(false);
    }
  }, [ready, userData?.stasiun_id, page, limit, resolved]);

  useEffect(() => {
    if (!autoLoad) return;
    if (!ready) return;
    refresh();
  }, [autoLoad, ready, refresh]);

  return {
    issues,
    loading: authLoading || loading,
    error,
    refresh,
    userData,
    ready,
  };
}
