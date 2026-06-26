"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { HiCheckCircle, HiClock, HiXCircle } from "react-icons/hi";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { formatDisplayName } from "@/lib/auth";

export interface ChecklistRecordItem {
  id?: number;
  date?: string;
  created_at?: string;
  current_status?: string;
  status?: string;
  current_user?: { username?: string };
  summary?: { total_ok?: number; total_not_ok?: number };
}

export function ChecklistRecordCard({ item }: { item: ChecklistRecordItem }) {
  const { t } = useTranslation();
  const lang = useLanguageStore((s) => s.currentLanguage);
  const dateLocale = lang === "id" ? idLocale : enUS;

  const dateStr = item.date ?? item.created_at ?? "";
  let parsedDate: Date | null = null;
  try {
    parsedDate = dateStr ? parseISO(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`) : null;
  } catch {
    parsedDate = null;
  }

  const createdAt = item.created_at ? parseISO(item.created_at) : parsedDate;
  const status = item.current_status ?? item.status ?? "";
  const okCount = item.summary?.total_ok ?? 0;
  const notOkCount = item.summary?.total_not_ok ?? 0;
  const userName = formatDisplayName(item.current_user?.username);

  const shiftLabel =
    status === "completed"
      ? t("approved_by")
      : status === "submitted"
        ? `${t("shift1")} ${t("by")}`
        : status === "reviewer"
          ? `${t("shift2")} ${t("by")}`
          : `${t("shift3")} ${t("by")}`;

  return (
    <div className="flex h-full w-[11.5rem] shrink-0 snap-start flex-col gap-2 rounded-xl bg-white/90 p-3 shadow-lg backdrop-blur-sm sm:w-[12.5rem]">
      <p className="font-heading text-sm font-semibold text-gray-900">
        {parsedDate
          ? format(parsedDate, "dd MMM yyyy", { locale: dateLocale })
          : "-"}
      </p>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-700">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary-700">
          <HiClock className="h-3 w-3 text-white" />
        </span>
        <span className="truncate">
          {parsedDate ? format(parsedDate, "EEEE", { locale: dateLocale }) : "-"}
          {createdAt ? ` • ${format(createdAt, "HH:mm a", { locale: dateLocale })}` : ""}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-xl shadow-md">
        <div className="flex flex-1 items-center justify-center gap-1.5 bg-gradient-to-r from-success to-white">
          <HiCheckCircle className="h-7 w-7 text-[#1C5E1C]" />
          <span className="font-heading text-xl font-bold text-gray-900">{okCount}</span>
        </div>
        <div className="flex flex-1 items-center justify-center gap-1.5 bg-gradient-to-r from-error to-white">
          <HiXCircle className="h-7 w-7 text-high" />
          <span className="font-heading text-xl font-bold text-gray-900">{notOkCount}</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-1">
        <div className="min-w-0">
          <p className="text-[9px] font-medium text-gray-700">{shiftLabel}</p>
          <p className="truncate text-[10px] font-semibold capitalize text-gray-900">
            {status === "completed" ? t("KS") : userName}
          </p>
        </div>
        <Link
          href={`/checklist/form?id=${item.id ?? ""}`}
          className="shrink-0 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold text-white hover:bg-primary-600"
        >
          {t("detail")}
        </Link>
      </div>
    </div>
  );
}
