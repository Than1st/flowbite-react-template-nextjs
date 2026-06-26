"use client";

import Link from "next/link";
import { Badge, Button, Card, Progress, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { HiArrowRight, HiDocumentReport, HiPlus } from "react-icons/hi";
import { ChecklistCreateCard } from "@/components/checklist/ChecklistCreateCard";
import { ChecklistMonitoring } from "@/components/checklist/ChecklistMonitoring";
import { ChecklistPageHeader } from "@/components/checklist/ChecklistPageHeader";
import { ChecklistRecords } from "@/components/checklist/ChecklistRecords";
import type { ChecklistRecordItem } from "@/components/checklist/ChecklistRecordCard";
import { ChecklistShiftLog } from "@/components/checklist/ChecklistShiftLog";
import { PageHeader } from "@/components/layout/PageHeader";
import { useChecklist } from "@/hooks/useChecklist";
import { useTranslation } from "@/hooks/useTranslation";
import { monitoringService } from "@/lib/api/services/monitoring.service";
import { useResolvedAuth } from "@/hooks/useResolvedAuth";
import { unwrapApiData } from "@/lib/api/response";
import { useCallback, useEffect, useState } from "react";

interface MonitoringStatusSummary {
  open: number;
  closed: number;
  pending: number;
}

export default function ChecklistPage() {
  const { t } = useTranslation();
  const { userData, ready } = useResolvedAuth();
  const { records, todayStatus, topProblems, loading, refresh } = useChecklist();
  const [monitoringStatus, setMonitoringStatus] =
    useState<MonitoringStatusSummary | null>(null);

  const loadMonitoring = useCallback(async () => {
    if (!ready || !userData?.stasiun_id) return;
    try {
      const res = await monitoringService.getStatus(userData.stasiun_id);
      const data =
        unwrapApiData<MonitoringStatusSummary>(res) ??
        (res as MonitoringStatusSummary);
      setMonitoringStatus(data);
    } catch {
      setMonitoringStatus(null);
    }
  }, [ready, userData?.stasiun_id]);

  useEffect(() => {
    loadMonitoring();
    refresh();
  }, [loadMonitoring, refresh]);

  const openCount = Number(monitoringStatus?.open) || 0;
  const inProgressCount = Number(monitoringStatus?.pending) || 0;
  const closedCount = Number(monitoringStatus?.closed) || 0;
  const reportTotal = openCount + inProgressCount + closedCount;

  const problemItems = (topProblems as Array<{ item_name?: string; count?: number }>) ?? [];
  const recordItems = (records as ChecklistRecordItem[]) ?? [];

  return (
    <>
      {/* Mobile & tablet */}
      <div className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden xl:hidden">
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4 sm:gap-3 sm:p-15">
          <ChecklistPageHeader />
          <ChecklistMonitoring
            counts={monitoringStatus}
            topProblems={problemItems}
            loading={loading && !monitoringStatus}
          />
          <div className="grid min-h-[9rem] grid-cols-2 gap-2 sm:gap-3">
            <ChecklistCreateCard todayStatus={todayStatus} loading={loading} />
            <ChecklistShiftLog todayStatus={todayStatus} loading={loading} />
          </div>
          <ChecklistRecords records={recordItems} loading={loading} />
        </div>
      </div>

      {/* Desktop */}
      <div className="relative mx-auto hidden w-full max-w-7xl flex-1 flex-col space-y-6 p-4 sm:p-15 xl:block xl:p-8">
        <PageHeader title={t("operations_review")} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold whitespace-pre-line text-gray-900 dark:text-white">
                {t("Area Issues\nMonitoring")}
              </h3>
              <Button as={Link} href="/monitoring" size="xs" color="light">
                {t("Enter")} <HiArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
            <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span>{t("Open")}: {openCount}</span>
              <span>{t("In Progress")}: {inProgressCount}</span>
              <span>{t("Closed")}: {closedCount}</span>
            </div>
            <Progress progress={reportTotal ? Math.round((openCount / reportTotal) * 100) : 0} />
          </Card>

          <Card>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t("Top 5 Problematic Items")}</h3>
            {loading ? (
              <Spinner />
            ) : problemItems.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">-</p>
            ) : (
              <ul className="space-y-2">
                {problemItems.slice(0, 5).map((item, i) => (
                  <li key={i} className="flex justify-between text-sm text-gray-800 dark:text-gray-200">
                    <span>{item.item_name ?? `Item ${i + 1}`}</span>
                    <Badge color="warning">{item.count ?? 0} {t("times")}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("Create")} Checklist</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t("detailed_overview_checklist")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button as={Link} href="/checklist/form" color="primary">
                <HiPlus className="mr-2 h-4 w-4" />
                {t("Create")}
              </Button>
              <Button as={Link} href="/report" color="light">
                <HiDocumentReport className="mr-2 h-4 w-4" />
                {t("report")}
              </Button>
              <Button as={Link} href="/monitoring" color="light">
                {t("Area Issues\nMonitoring")}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{t("Checklist Record")}</h3>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : recordItems.length === 0 ? (
            <p className="py-6 text-center text-gray-500 dark:text-gray-400">{t("Checklist has't been created")}</p>
          ) : (
            <div className="overflow-x-auto">
              <Table hoverable>
                <TableHead>
                  <TableHeadCell>{t("date")}</TableHeadCell>
                  <TableHeadCell>{t("Status")}</TableHeadCell>
                  <TableHeadCell>{t("by")}</TableHeadCell>
                  <TableHeadCell>{t("detail")}</TableHeadCell>
                </TableHead>
                <TableBody>
                  {recordItems.map((row, idx) => (
                    <TableRow key={String(row.id ?? idx)}>
                      <TableCell>{String(row.date ?? row.created_at ?? "-")}</TableCell>
                      <TableCell>
                        <Badge color="info">{String(row.status ?? row.current_status ?? "-")}</Badge>
                      </TableCell>
                      <TableCell>{row.current_user?.username ?? "-"}</TableCell>
                      <TableCell>
                        <Button
                          size="xs"
                          color="light"
                          as={Link}
                          href={`/checklist/form?id=${row.id}`}
                        >
                          {t("detail")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
