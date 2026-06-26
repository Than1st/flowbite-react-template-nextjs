"use client";

import Image from "next/image";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { StationTrainIcon } from "@/components/dashboard/StationTrainIcon";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguageStore } from "@/stores/languageStore";
import { formatDisplayName } from "@/lib/auth";

export function DashboardHeader() {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const lang = useLanguageStore((s) => s.currentLanguage);
  const name = formatDisplayName(userData?.nama ?? userData?.username);
  const station = userData?.stasiun_name ?? "-";

  const title = `${t("welcome_message")}, ${name}`;
  const formattedTitle = title
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const dateLocale = lang === "id" ? idLocale : enUS;
  const formattedDate = format(new Date(), "EEEE, dd MMM yyyy", {
    locale: dateLocale,
  });

  return (
    <div className="relative shrink-0 overflow-hidden rounded-xl shadow-xl">
      <Image
        src="/assets/image/station.png"
        alt=""
        fill
        className="object-cover object-right-bottom"
        aria-hidden
      />
      <div className="dashboard-header-gradient relative flex items-center justify-between gap-3 px-4 py-4 xl:min-h-[148px] xl:items-end xl:gap-4 xl:px-6 xl:py-8">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-lg font-bold leading-tight text-white xl:text-2xl">
            {formattedTitle}
          </h1>
          <div className="mt-1.5 flex items-center gap-2 xl:mt-2">
            <StationTrainIcon className="h-5 w-5 shrink-0 text-white xl:h-6 xl:w-6" />
            <span className="truncate font-paragraph text-sm font-semibold text-white xl:text-lg">
              {station}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-center gap-1 xl:justify-between xl:self-stretch xl:py-1">
          <Image
            src="/assets/image/immax.png"
            alt="IMMAX"
            width={140}
            height={48}
            className="h-8 w-auto brightness-0 invert xl:h-11"
          />
          <p className="whitespace-nowrap text-right font-paragraph text-xs font-semibold text-white xl:text-lg">
            {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
}
