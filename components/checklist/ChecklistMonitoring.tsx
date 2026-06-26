"use client";

import Link from "next/link";
import { Spinner } from "flowbite-react";
import { TrapzHeader } from "@/components/checklist/TrapzHeader";
import { useTranslation } from "@/hooks/useTranslation";

interface MonitoringCounts {
  open: number;
  pending: number;
  closed: number;
}

interface ChecklistMonitoringProps {
  counts: MonitoringCounts | null;
  topProblems: Array<{ item_name?: string; count?: number }>;
  loading?: boolean;
}

function ProgressItem({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        <span className="truncate text-[10px] font-medium text-gray-800 sm:text-xs">{label}</span>
      </div>
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[3px] text-xs font-semibold text-gray-900"
        style={{ borderColor: color }}
      >
        {count}
      </div>
    </div>
  );
}

function weightedProgress(counts: MonitoringCounts) {
  const total = counts.open + counts.pending + counts.closed;
  if (total === 0) return 0;
  const progress =
    counts.pending * 0.5 + counts.closed * 1;
  return Math.round((progress / total) * 100);
}

function rankColor(rank: number) {
  if (rank === 1) return "#DC2626";
  if (rank === 2) return "#EA580C";
  if (rank === 3) return "#D97706";
  if (rank === 4) return "#CA8A04";
  return "#65A30D";
}

export function ChecklistMonitoring({
  counts,
  topProblems,
  loading,
}: ChecklistMonitoringProps) {
  const { t } = useTranslation();
  const open = counts?.open ?? 0;
  const pending = counts?.pending ?? 0;
  const closed = counts?.closed ?? 0;
  const total = open + pending + closed;
  const progress = counts ? weightedProgress({ open, pending, closed }) : 0;

  return (
    <div className="dashboard-card flex min-h-0 shrink-0 flex-col overflow-hidden pt-0">
      <TrapzHeader title={t("Area Issues\nMonitoring")} fit />
      <div className="flex min-h-0 gap-2 p-2 sm:gap-3 sm:p-3">
        <div className="flex w-[42%] shrink-0 flex-col justify-between rounded-xl bg-white p-2.5 shadow-md sm:p-3">
          {loading ? (
            <div className="flex flex-1 items-center justify-center py-6">
              <Spinner size="md" color="purple" />
            </div>
          ) : (
            <>
              <div>
                <p className="font-heading text-xs font-semibold text-gray-900 sm:text-sm">
                  {t("Progress")}
                </p>
                <div className="relative mt-2 h-5 overflow-hidden rounded-full bg-error">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-success transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-[9px] font-medium text-gray-600 sm:text-[10px]">
                  {progress}% Overall Progress
                </p>
                <p className="mt-1 flex items-center gap-1 text-[9px] font-medium text-gray-700 sm:text-[10px]">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  {t("Progress")}: Total: {total}
                </p>
              </div>

              <div className="mt-3 space-y-1.5">
                <p className="font-heading text-xs font-semibold text-gray-900 sm:text-sm">
                  {t("Status")}
                </p>
                <ProgressItem label={t("Open")} count={open} color="#D37375" />
                <ProgressItem label={t("In Progress")} count={pending} color="#EFD16E" />
                <ProgressItem label={t("Closed")} count={closed} color="#1C5E1C" />
              </div>

              <Link
                href="/monitoring"
                className="mt-3 block rounded-full bg-primary px-2 py-2 text-center text-[10px] font-semibold text-white shadow-md hover:bg-primary-600 sm:text-xs"
              >
                {t("Ticket Issue")}
              </Link>
            </>
          )}
        </div>

        <div className="min-w-0 flex-1 rounded-xl bg-white p-2.5 shadow-md sm:p-3">
          <p className="font-heading text-xs font-semibold text-gray-900 sm:text-sm">
            {t("Top 5 Problematic Items")}
          </p>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" color="purple" />
            </div>
          ) : topProblems.length === 0 ? (
            <p className="py-6 text-center text-[10px] text-gray-500 sm:text-xs">-</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {topProblems.slice(0, 5).map((item, index) => {
                const color = rankColor(index + 1);
                return (
                  <li
                    key={`${item.item_name}-${index}`}
                    className="flex items-center justify-between gap-1 border-b border-gray-100 py-1.5 last:border-0"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {index + 1}
                      </span>
                      <span className="line-clamp-2 text-[10px] font-medium text-gray-800 sm:text-xs">
                        {item.item_name ?? `Item ${index + 1}`}
                      </span>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white sm:text-[10px]"
                      style={{ backgroundColor: color }}
                    >
                      {item.count ?? 0} x
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
