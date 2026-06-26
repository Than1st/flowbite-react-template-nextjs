"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { formatShortRelativeTime } from "@/lib/utils/date";
import { useLanguageStore } from "@/stores/languageStore";

export interface StatusCardItem {
  type: "Open" | "Closed" | "In Progress";
  count: number;
  lastUpdated?: string | null;
}

interface StatusSummaryProps {
  data: StatusCardItem[];
  loading?: boolean;
}

const statusStyles = {
  Open: {
    badge: "bg-red-100 text-red-800 xl:bg-error xl:text-white",
    label: "Open",
  },
  Closed: {
    badge: "bg-green-100 text-green-800 xl:bg-success xl:text-white",
    label: "Closed",
  },
  "In Progress": {
    badge: "bg-orange-100 text-orange-800 xl:bg-warning xl:text-gray-900",
    label: "In Progress",
  },
};

export function StatusSummary({ data, loading }: StatusSummaryProps) {
  const { t } = useTranslation();
  const lang = useLanguageStore((s) => s.currentLanguage);

  if (loading) {
    return (
      <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3 xl:gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="dashboard-card-solid h-[4.5rem] animate-pulse sm:h-24"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3 xl:gap-4">
      {data.map((item) => {
        const style = statusStyles[item.type];
        const timeAgo = item.lastUpdated
          ? formatShortRelativeTime(item.lastUpdated, lang)
          : t("No updates");

        return (
          <div
            key={item.type}
            className="dashboard-card-solid flex flex-col justify-center gap-0.5 px-2 py-2.5 sm:gap-2 sm:px-4 sm:py-4 xl:px-5 xl:py-5"
          >
            <span className="font-heading text-2xl font-bold leading-none text-gray-900 sm:text-3xl">
              {item.count}
            </span>
            <span className="font-heading text-xs font-semibold text-gray-800 sm:text-base xl:text-lg">
              {t(style.label)}
            </span>
            <span
              className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-xs ${style.badge}`}
            >
              {timeAgo}
            </span>
          </div>
        );
      })}
    </div>
  );
}
