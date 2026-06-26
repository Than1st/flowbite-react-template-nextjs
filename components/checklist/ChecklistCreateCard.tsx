"use client";

import Link from "next/link";
import { HiIdentification, HiCloud } from "react-icons/hi";
import { Spinner } from "flowbite-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ChecklistCreateCardProps {
  todayStatus: unknown;
  loading?: boolean;
}

function getShiftTitle(status: string | null, t: (key: string) => string) {
  if (!status) return "Waiting For Start";
  if (status === "completed") return t("Completed");
  if (status === "approved") return t("Evening Shift");
  if (status === "reviewer") return t("Afternoon Shift");
  if (status === "submitted") return t("Morning Shift");
  if (status === "draft") return t("Draft");
  return "Waiting For Start";
}

function getStatusLabel(status: string | null, t: (key: string) => string) {
  if (!status) return t("Not Started");
  if (status === "completed") return t("Completed");
  if (status === "approved") return t("Approved");
  if (status === "reviewer") return t("Reviewed");
  if (status === "submitted") return t("Submitted");
  if (status === "draft") return t("checklist");
  return t("Not Started");
}

export function ChecklistCreateCard({ todayStatus, loading }: ChecklistCreateCardProps) {
  const { t } = useTranslation();
  const status =
    ((todayStatus as { current_status?: string } | null)?.current_status as
      | string
      | undefined) ?? null;
  const canCreate = !status || status === "draft";

  if (loading) {
    return (
      <div className="dashboard-card-solid flex h-full min-h-[9rem] items-center justify-center rounded-xl p-3">
        <Spinner size="md" color="purple" />
      </div>
    );
  }

  return (
    <div className="dashboard-card-solid flex h-full min-h-[9rem] flex-col justify-between rounded-xl p-3 shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-heading text-sm font-semibold text-gray-900 sm:text-base">
            {getShiftTitle(status, t)}
          </p>
          <div className="mt-1.5 flex items-center gap-1.5">
            <HiIdentification className="h-4 w-4 shrink-0 text-secondary-700" />
            <span className="text-[10px] font-medium text-gray-700 sm:text-xs">
              {getStatusLabel(status, t)}
            </span>
          </div>
        </div>
        <HiCloud className="h-10 w-10 shrink-0 text-low" />
      </div>

      <Link
        href="/checklist/form"
        className={`mt-2 block rounded-full px-3 py-2 text-center text-xs font-semibold text-white shadow-md sm:text-sm ${
          canCreate ? "bg-primary hover:bg-primary-600" : "pointer-events-none bg-gray-300"
        }`}
      >
        {status === "draft" ? t("Lanjutkan") : canCreate ? t("Create") : t("Has Created")}
      </Link>
    </div>
  );
}
