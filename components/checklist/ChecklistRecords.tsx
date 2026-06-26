"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { HiDocumentReport } from "react-icons/hi";
import { Spinner } from "flowbite-react";
import {
  ChecklistRecordCard,
  type ChecklistRecordItem,
} from "@/components/checklist/ChecklistRecordCard";
import { useTranslation } from "@/hooks/useTranslation";

interface ChecklistRecordsProps {
  records: ChecklistRecordItem[];
  loading?: boolean;
}

export function ChecklistRecords({ records, loading }: ChecklistRecordsProps) {
  const { t } = useTranslation();
  const monthLabel = format(new Date(), "MMMM yyyy", { locale: idLocale });

  return (
    <div className="relative shrink-0 overflow-hidden rounded-xl bg-gradient-to-r from-secondary-700 via-secondary-300 to-white p-3 shadow-lg sm:p-4">
      <div className="flex gap-3">
        <div className="flex w-[38%] shrink-0 flex-col items-center gap-2 sm:w-[34%]">
          <h3 className="w-full text-center font-heading text-base font-semibold text-white sm:text-lg">
            {t("Checklist Record")}
          </h3>
          <span className="w-full rounded-full bg-white px-3 py-1 text-center text-xs font-semibold text-gray-900 shadow-md sm:text-sm">
            {monthLabel}
          </span>
          <Link
            href="/report"
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-white/90 px-2 py-2 text-center text-[10px] font-semibold text-secondary-700 shadow-md hover:bg-white sm:text-xs"
          >
            <HiDocumentReport className="h-4 w-4 shrink-0" />
            {t("report_checklist")}
          </Link>
          <Image
            src="/assets/image/LRT.png"
            alt=""
            width={120}
            height={80}
            className="mt-1 h-16 w-auto opacity-20 sm:h-20"
          />
        </div>

        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="flex h-full min-h-[10rem] items-center justify-center">
              <Spinner size="lg" color="purple" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex h-full min-h-[10rem] flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm font-semibold text-white">
                {t("Checklist has't been created")}
              </p>
            </div>
          ) : (
            <div className="flex h-full min-h-[10rem] snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {records.map((item, idx) => (
                <ChecklistRecordCard key={String(item.id ?? idx)} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
