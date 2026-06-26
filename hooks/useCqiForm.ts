"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { cqiService } from "@/lib/api/services/cqi.service";
import { useResolvedAuth } from "@/hooks/useResolvedAuth";
import { unwrapApiList } from "@/lib/api/response";
import {
  buildCqiSubmitPayload,
  getAreaBobot,
  getGradeWithLabel,
  parseMasterFormAreas,
  parseNum,
  type CqiFormArea,
  type CqiMasterOption,
} from "@/lib/cqi-form";
import {
  findCqiDailyRowForOperationalToday,
  isCqiDailyRowFormLocked,
  type CqiDailyChecklistRow,
} from "@/lib/cqi-daily";

export function useCqiForm() {
  const { userData, ready, loading: authLoading } = useResolvedAuth();

  const [areas, setAreas] = useState<CqiFormArea[]>([]);
  const [masterLoading, setMasterLoading] = useState(true);
  const [masterError, setMasterError] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const [selections, setSelections] = useState<Record<number, CqiMasterOption>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadMasterForm = useCallback(async () => {
    if (!ready) return;
    setMasterLoading(true);
    setMasterError(false);
    try {
      const res = await cqiService.getMasterForm();
      const list = parseMasterFormAreas(res);
      if (list.length > 0) {
        setAreas(list);
        setSelections({});
      } else {
        setAreas([]);
        setMasterError(true);
      }
    } catch {
      setMasterError(true);
      setAreas([]);
    } finally {
      setMasterLoading(false);
    }
  }, [ready]);

  const checkAccess = useCallback(async () => {
    if (!ready || !userData?.stasiun_id) {
      setAccessLoading(false);
      setIsLocked(true);
      return;
    }

    setAccessLoading(true);
    try {
      const res = await cqiService.getDailyChecklists({
        station_id: userData.stasiun_id,
        page: 1,
        limit: 50,
        include_summary_items: 1,
      });
      const rows = unwrapApiList<CqiDailyChecklistRow>(res);
      const todayRow = findCqiDailyRowForOperationalToday(rows);
      setIsLocked(isCqiDailyRowFormLocked(todayRow));
    } catch {
      setIsLocked(false);
    } finally {
      setAccessLoading(false);
    }
  }, [ready, userData?.stasiun_id]);

  useEffect(() => {
    if (!ready) return;
    void loadMasterForm();
    void checkAccess();
  }, [ready, loadMasterForm, checkAccess]);

  const summary = useMemo(() => {
    return areas.map((cat) => {
      const selected = selections[cat.id];
      const filled = !!selected;
      const maxCqi = parseNum(cat.max_cqi, 20);
      const maxScale = cat.max_scale > 0 ? cat.max_scale : 5;
      const bobot =
        filled && selected
          ? getAreaBobot(selected.scale, maxScale, maxCqi)
          : 0;
      return {
        ...cat,
        filled,
        bobot,
        selectedScale: selected?.scale,
        maxCqi,
        maxScale,
      };
    });
  }, [areas, selections]);

  const total = useMemo(
    () => summary.reduce((acc, s) => acc + s.bobot, 0),
    [summary],
  );

  const allFilled = useMemo(
    () => areas.length > 0 && summary.every((s) => s.filled),
    [areas.length, summary],
  );

  const gradeInfo = useMemo(() => getGradeWithLabel(total), [total]);

  const selectOption = useCallback((areaId: number, option: CqiMasterOption) => {
    setSelections((prev) => ({ ...prev, [areaId]: option }));
  }, []);

  const submitCqi = useCallback(async (): Promise<
    { ok: true } | { ok: false; message: string }
  > => {
    if (!allFilled) return { ok: false, message: "incomplete" };
    if (!userData?.stasiun_id || !userData?.userId) {
      return { ok: false, message: "no_auth" };
    }

    const tanggal = new Date().toISOString().slice(0, 10);
    let payload;
    try {
      payload = buildCqiSubmitPayload(areas, selections, {
        stationId: userData.stasiun_id,
        stasiunName: String(userData.stasiun_name ?? ""),
        assessorId: userData.userId,
        tanggal,
      });
    } catch {
      return { ok: false, message: "incomplete" };
    }

    setIsSubmitting(true);
    try {
      await cqiService.submit(payload);
      return { ok: true };
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      return {
        ok: false,
        message:
          err.response?.data?.message ?? err.message ?? "submit_failed",
      };
    } finally {
      setIsSubmitting(false);
    }
  }, [allFilled, userData, areas, selections]);

  return {
    authLoading,
    ready,
    areas,
    masterLoading,
    masterError,
    accessLoading,
    isLocked,
    loadMasterForm,
    selections,
    selectOption,
    summary,
    total,
    allFilled,
    gradeInfo,
    submitCqi,
    isSubmitting,
  };
}
