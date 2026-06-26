"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { HiClock, HiCheckCircle, HiXCircle } from "react-icons/hi";
import { Spinner } from "flowbite-react";
import { CqiGauge } from "@/components/dashboard/CqiGauge";
import { useTranslation } from "@/hooks/useTranslation";
import { getCqiBadgeState } from "@/lib/utils/cqi";
import type { CqiDashboardInfo } from "@/types/dashboard";

interface CqiDashboardProps {
  data: CqiDashboardInfo;
  loading?: boolean;
  className?: string;
}

export function CqiDashboard({ data, loading, className }: CqiDashboardProps) {
  const { t } = useTranslation();
  const badge = getCqiBadgeState(
    data.createdAt,
    data.submittedShiftsCount,
    t,
  );

  if (loading) {
    return (
      <div
        className={`dashboard-card-solid flex h-full min-h-0 items-center justify-center xl:min-h-[380px] ${className ?? ""}`}
      >
        <Spinner size="lg" color="purple" />
      </div>
    );
  }

  return (
    <div
      className={`dashboard-card-solid flex h-full min-h-0 flex-col overflow-hidden px-2 py-2 sm:px-4 sm:py-3 xl:min-h-[380px] xl:px-6 xl:py-4 ${className ?? ""}`}
    >
      <div className="shrink-0 pt-1 text-center sm:pt-2 xl:pt-3">
        <h3 className="font-heading text-base font-semibold leading-tight text-gray-900 sm:text-lg xl:text-2xl">
          {t("cleanliness_quality_index")}
        </h3>
      </div>

      <Link
        href="/kebersihan"
        className="flex min-h-0 flex-1 items-center justify-center py-0.5 sm:py-2"
      >
        <CqiGauge
          value={data.value}
          gradeLetter={data.grade}
          fill
          className="xl:hidden"
        />
        <CqiGauge
          value={data.value}
          gradeLetter={data.grade}
          size={210}
          className="hidden xl:block"
        />
      </Link>

      <div className="flex min-h-0 shrink-0 flex-col items-center gap-1 px-1 pb-1.5 sm:gap-1.5 sm:pb-3 xl:gap-2 xl:pb-6">
        {data.createdAt && (
          <div className="flex w-full items-center justify-center gap-1 rounded-full bg-secondary-700 px-2.5 py-1.5 text-[9px] font-medium text-white sm:max-w-sm sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs xl:text-sm">
            <HiClock className="h-3 w-3 shrink-0 sm:h-4 sm:w-4" />
            <span className="truncate">
              {t("last_update")}:{" "}
              {format(parseISO(data.createdAt), "dd MMM, HH:mm", {
                locale: idLocale,
              })}
            </span>
          </div>
        )}
        <div
          className={`flex w-full items-center justify-center gap-1 rounded-full border px-2.5 py-1.5 text-[9px] font-semibold sm:max-w-sm sm:gap-1.5 sm:px-3 sm:py-2 sm:text-xs xl:text-sm ${
            badge.hasTodayCqi
              ? "border-yellow-300 bg-yellow-50 text-yellow-800 xl:bg-yellow-100"
              : "border-red-200 bg-red-50 text-high"
          }`}
        >
          {badge.hasTodayCqi ? (
            <HiCheckCircle className="h-3 w-3 shrink-0 text-yellow-700 sm:h-4 sm:w-4" />
          ) : (
            <HiXCircle className="h-3 w-3 shrink-0 text-high sm:h-4 sm:w-4" />
          )}
          <span className="truncate">{badge.label}</span>
        </div>
      </div>
    </div>
  );
}
