"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Progress,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import { HiPlus } from "react-icons/hi";
import { PageHeader } from "@/components/layout/PageHeader";
import { useResolvedAuth } from "@/hooks/useResolvedAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { cqiService } from "@/lib/api/services/cqi.service";
import { unwrapApiList } from "@/lib/api/response";

interface CqiHistoryRow {
  id?: number;
  date?: string;
  tanggal?: string;
  summary?: {
    total_cqi?: number;
    summary_total_cqi?: number;
    summary_grade?: string;
    grade?: string;
  };
  history?: Array<{
    shift_no?: number;
    total_cqi?: number;
    grade?: string;
    status?: string;
    assessor_id?: number;
  }>;
}

function getGrade(score: number): { grade: string; color: "success" | "info" | "warning" | "failure" } {
  if (score >= 90) return { grade: "A", color: "success" };
  if (score >= 75) return { grade: "B", color: "info" };
  if (score >= 60) return { grade: "C", color: "warning" };
  if (score >= 45) return { grade: "D", color: "warning" };
  return { grade: "E", color: "failure" };
}

export default function KebersihanPage() {
  const { t } = useTranslation();
  const { userData, ready } = useResolvedAuth();
  const [rows, setRows] = useState<CqiHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const [todayGrade, setTodayGrade] = useState<string>("-");
  const [formLocked, setFormLocked] = useState(false);

  const loadData = useCallback(async () => {
    if (!ready || !userData?.stasiun_id) return;
    setLoading(true);
    try {
      const res = await cqiService.getDailyChecklists({
        station_id: userData.stasiun_id,
        page: 1,
        limit: 30,
        include_summary_items: 1,
      });
      const list = unwrapApiList<CqiHistoryRow>(res);
      setRows(list);

      const today = list[0];
      if (today) {
        const score =
          today.summary?.total_cqi ??
          today.summary?.summary_total_cqi ??
          today.history?.[today.history.length - 1]?.total_cqi ??
          0;
        setTodayScore(Number(score));
        const gradeInfo = getGrade(Number(score));
        setTodayGrade(today.summary?.summary_grade ?? today.summary?.grade ?? gradeInfo.grade);
        const submittedShifts = (today.history ?? []).filter((h) => h.status === "submitted").length;
        setFormLocked(submittedShifts >= 3);
      }
    } finally {
      setLoading(false);
    }
  }, [ready, userData?.stasiun_id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const gradeColor = getGrade(todayScore ?? 0).color;

  return (
    <div className="space-y-6">
      <PageHeader title={t("kebersihan")} />

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("cleanliness_quality_index")}</h3>
          {formLocked ? (
            <Button color="gray" className="cursor-not-allowed opacity-60">
              <HiPlus className="mr-2 h-4 w-4" />
              {t("form_cqi")}
            </Button>
          ) : (
            <Button as={Link} href="/kebersihan/form" color="primary">
              <HiPlus className="mr-2 h-4 w-4" />
              {t("form_cqi")}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="text-center">
              <p className="text-6xl font-bold text-secondary-700 dark:text-secondary-300">
                {todayScore ?? "-"}
              </p>
              <Badge color={gradeColor} className="mt-2">
                Grade {todayGrade}
              </Badge>
            </div>
            <div className="w-full flex-1">
              <Progress progress={todayScore ?? 0} size="lg" color={gradeColor} labelProgress />
              {formLocked && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t("cqi_badge_complete")}</p>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t("riwayat_cqi")}</h3>
        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <p className="py-6 text-center text-gray-500 dark:text-gray-400">{t("belum_dinilai")}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table hoverable>
              <TableHead>
                <TableHeadCell>{t("date")}</TableHeadCell>
                <TableHeadCell>CQI</TableHeadCell>
                <TableHeadCell>Grade</TableHeadCell>
                <TableHeadCell>{t("shift1")}</TableHeadCell>
                <TableHeadCell>{t("shift2")}</TableHeadCell>
                <TableHeadCell>{t("shift3")}</TableHeadCell>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => {
                  const score =
                    row.summary?.total_cqi ??
                    row.summary?.summary_total_cqi ??
                    row.history?.[row.history.length - 1]?.total_cqi ??
                    0;
                  const grade = row.summary?.summary_grade ?? getGrade(Number(score)).grade;
                  const shifts = row.history ?? [];

                  return (
                    <TableRow key={String(row.id ?? idx)}>
                      <TableCell>{row.date ?? row.tanggal ?? "-"}</TableCell>
                      <TableCell className="font-semibold">{score}</TableCell>
                      <TableCell><Badge color={getGrade(Number(score)).color}>{grade}</Badge></TableCell>
                      {[1, 2, 3].map((shiftNo) => {
                        const shift = shifts.find((s) => s.shift_no === shiftNo);
                        return (
                          <TableCell key={shiftNo}>
                            {shift ? (
                              <Badge color={shift.status === "submitted" ? "success" : "gray"}>
                                {shift.total_cqi ?? "-"}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
