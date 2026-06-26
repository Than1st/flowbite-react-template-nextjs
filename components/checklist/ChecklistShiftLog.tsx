"use client";

import { HiClock, HiPencil } from "react-icons/hi2";
import { Spinner } from "flowbite-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ChecklistShiftLogProps {
  todayStatus: unknown;
  loading?: boolean;
}

export function ChecklistShiftLog({ todayStatus, loading }: ChecklistShiftLogProps) {
  const { t } = useTranslation();
  const status =
    ((todayStatus as { current_status?: string } | null)?.current_status as
      | string
      | undefined) ?? null;
  const hasStarted = !!status && status !== "draft";

  if (loading) {
    return (
      <div className="flex h-full min-h-[9rem] items-center justify-center rounded-xl bg-gradient-to-r from-secondary-700 to-secondary-300 p-3 shadow-lg">
        <Spinner size="md" color="purple" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[9rem] flex-col overflow-hidden rounded-xl bg-gradient-to-r from-secondary-700 to-secondary-300 p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-heading text-xs font-semibold text-white sm:text-sm">
          {t("Shift Activity Log")}
        </h3>
        <HiClock className="h-4 w-4 text-white/90 sm:h-5 sm:w-5" />
      </div>

      {hasStarted ? (
        <div className="flex flex-1 flex-col justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-2.5 py-2 backdrop-blur-sm">
          <p className="text-[10px] font-medium text-white/90 sm:text-xs">
            {status === "submitted"
              ? t("Morning Shift")
              : status === "reviewer"
                ? t("Afternoon Shift")
                : status === "approved" || status === "completed"
                  ? t("Evening Shift")
                  : t("Started Shift")}
          </p>
          <p className="text-[10px] font-semibold text-white sm:text-xs">
            {(todayStatus as { current_user?: { username?: string } })?.current_user
              ?.username ?? "-"}
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-2 py-3 backdrop-blur-sm">
          <HiPencil className="h-6 w-6 text-white sm:h-7 sm:w-7" />
          <p className="text-center text-[10px] font-medium text-white sm:text-xs">
            {t("Shift Not Started")}
          </p>
        </div>
      )}
    </div>
  );
}
