"use client";

import { useCallback, useEffect, useState } from "react";
import { checklistService } from "@/lib/api/services/checklist.service";
import { useResolvedAuth } from "@/hooks/useResolvedAuth";
import { settleAll, unwrapApiData, unwrapApiList } from "@/lib/api/response";
import { getDateRangeMonthsBack } from "@/lib/utils/date-range";

export function useChecklist() {
  const { userData, ready } = useResolvedAuth();
  const [records, setRecords] = useState<unknown[]>([]);
  const [todayStatus, setTodayStatus] = useState<unknown>(null);
  const [topProblems, setTopProblems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!ready || !userData?.stasiun_id) return;
    setLoading(true);
    setError(null);

    try {
      const range = getDateRangeMonthsBack(2);
      const [list, today, problems] = await settleAll([
        checklistService.getList({
          stasiun_id: userData.stasiun_id,
          date_start: range.start,
          date_end: range.end,
          sort_order: "desc",
          page: 1,
          limit: 50,
        }),
        checklistService.getTodayLatest(userData.stasiun_id),
        checklistService.getTopProblems(userData.stasiun_id),
      ]);

      setRecords(list ? unwrapApiList(list) : []);
      setTodayStatus(today ? unwrapApiData(today) : null);
      setTopProblems(problems ? unwrapApiList(problems) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat checklist");
    } finally {
      setLoading(false);
    }
  }, [ready, userData?.stasiun_id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { records, todayStatus, topProblems, loading, error, refresh };
}
