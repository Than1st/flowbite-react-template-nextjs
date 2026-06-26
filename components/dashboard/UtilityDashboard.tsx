"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  HiArrowPath,
  HiBeaker,
  HiBattery100,
  HiBolt,
  HiClock,
  HiPencil,
} from "react-icons/hi2";
import { Modal, Spinner } from "flowbite-react";
import { ConsumptionForm } from "@/components/dashboard/ConsumptionForm";
import { useTranslation } from "@/hooks/useTranslation";
import type { ConsumptionRecord } from "@/types/dashboard";

interface UtilityDashboardProps {
  data: ConsumptionRecord[];
  loading?: boolean;
  error?: string | null;
  onRefresh: () => void;
  className?: string;
}

const defaultUtilities: ConsumptionRecord[] = [
  { category: "electricity", value: 0, status: false },
  { category: "water", value: 0, status: false },
  { category: "genset", value: 0, status: false },
];

function mergeUtilities(data: ConsumptionRecord[]) {
  return defaultUtilities.map((def) => {
    const found = data.find((d) => d.category === def.category);
    return found ?? def;
  });
}

function formatRecordDate(date?: string) {
  if (!date) return "-";
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    const day = d.toLocaleDateString("id-ID", { weekday: "long" });
    const time = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${day}, ${time}`;
  } catch {
    return "-";
  }
}

function getCardStyle(category: ConsumptionRecord["category"], active: boolean) {
  const inactive = {
    cardBg: "bg-white",
    iconColor: "text-gray-400",
    badgeBg: "bg-gray-300",
    badgeText: "text-gray-700",
    valueColor: "text-gray-900",
  };

  const base = {
    electricity: {
      icon: HiBolt,
      title: "electricity",
      statusOn: "POWER ON",
      statusOff: "POWER OFF",
      unit: "VA",
      active: {
        cardBg: "bg-gradient-to-br from-white to-amber-50",
        iconColor: "text-amber-400",
        badgeBg: "bg-amber-300",
        badgeText: "text-orange-700",
        valueColor: "text-orange-700",
      },
      inactive,
    },
    water: {
      icon: HiBeaker,
      title: "water",
      statusOn: "PUMP ON",
      statusOff: "PUMP OFF",
      unit: "m³",
      active: {
        cardBg: "bg-gradient-to-br from-white to-cyan-50",
        iconColor: "text-cyan-400",
        badgeBg: "bg-white",
        badgeText: "text-secondary-700",
        valueColor: "text-secondary-700",
      },
      inactive,
    },
    genset: {
      icon: HiBattery100,
      title: "genset",
      statusOn: "STANDBY",
      statusOff: "OFF",
      unit: "Liter",
      active: {
        cardBg: "bg-gradient-to-br from-white to-amber-50",
        iconColor: "text-amber-400",
        badgeBg: "bg-amber-300",
        badgeText: "text-orange-700",
        valueColor: "text-orange-700",
      },
      inactive,
    },
  };

  const config = base[category];
  const palette = active ? config.active : config.inactive;

  return {
    icon: config.icon,
    title: config.title,
    statusLabel: active ? config.statusOn : config.statusOff,
    unit: config.unit,
    ...palette,
  };
}

function TrapzHeader({ title }: { title: string }) {
  return (
    <div className="relative z-20 w-full shrink-0">
      <div className="dashboard-trapz-shadow relative h-14 w-full sm:h-[3.75rem] xl:h-[4rem]">
        <div className="absolute inset-0 scale-y-[-1]">
          <Image
            src="/assets/image/trapz.png"
            alt=""
            fill
            className="object-fill"
            aria-hidden
          />
        </div>
        <div className="absolute inset-0 z-10 flex items-start justify-center pt-1 sm:pt-1.5 xl:pt-2">
          <span className="font-heading text-lg font-semibold text-gray-900 sm:text-xl xl:text-2xl">
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}

function UtilityCard({
  item,
  className,
}: {
  item: ConsumptionRecord;
  className?: string;
}) {
  const { t } = useTranslation();
  const style = getCardStyle(item.category, item.status);
  const Icon = style.icon;
  const recordDate = formatRecordDate(item.record_date ?? item.updated_at);

  return (
    <div
      className={`utility-card flex h-full min-h-[7.5rem] flex-col justify-between overflow-hidden rounded-xl p-2.5 shadow-lg xl:min-h-[9.5rem] xl:p-3 ${style.cardBg} ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <Icon
          className={`h-12 w-12 shrink-0 xl:h-14 xl:w-14 ${style.iconColor}`}
        />
        <div className="flex min-w-0 flex-col items-end gap-1">
          <span
            className={`max-w-full truncate rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide xl:text-[10px] ${style.badgeBg} ${style.badgeText}`}
          >
            {style.statusLabel}
          </span>
          <p
            className={`font-heading text-base font-bold leading-none xl:text-xl ${style.valueColor}`}
          >
            {item.value || 0} {style.unit}
          </p>
        </div>
      </div>

      <div className="min-w-0">
        <p className="font-heading text-sm font-semibold text-gray-900 xl:text-base">
          {t(style.title)}
        </p>
        <div className="mt-1 flex items-center gap-1 text-gray-500">
          <HiClock className="h-3 w-3 shrink-0" />
          <span className="truncate text-[10px] font-medium xl:text-xs">
            {recordDate}
          </span>
        </div>
      </div>
    </div>
  );
}

export function UtilityDashboard({
  data,
  loading,
  error,
  onRefresh,
  className,
}: UtilityDashboardProps) {
  const { t } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const utilities = useMemo(() => mergeUtilities(data), [data]);

  const shell = (children: React.ReactNode) => (
    <div
      className={`dashboard-card relative flex h-full min-h-0 flex-col overflow-hidden pt-0 ${className ?? ""}`}
    >
      <TrapzHeader title={t("static_data")} />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );

  if (loading) {
    return shell(
      <div className="flex min-h-0 flex-1 items-center justify-center py-4">
        <Spinner size="lg" color="purple" />
      </div>,
    );
  }

  if (error) {
    return shell(
      <p className="flex flex-1 items-center justify-center px-4 py-6 text-center text-sm text-high">
        {error}
      </p>,
    );
  }

  return (
    <>
      {shell(
        <>
          <div className="min-h-0 flex-1 overflow-hidden px-2 py-1.5 sm:px-2.5 sm:py-2 md:px-3">
            <div className="utility-carousel flex h-full snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth sm:gap-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {utilities.map((item) => (
                <div
                  key={item.category}
                  className="h-full w-[calc(50%-0.25rem)] shrink-0 snap-start sm:w-[calc(50%-0.3125rem)] md:w-[min(48%,220px)] lg:w-[min(45%,240px)] xl:w-[min(42%,260px)]"
                >
                  <UtilityCard item={item} className="h-full w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2.5 px-2.5 py-2 sm:gap-3 sm:px-3 sm:py-2.5 md:px-4">
            <button
              type="button"
              onClick={onRefresh}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-light text-white shadow-md hover:opacity-90 sm:h-9 sm:w-9 md:h-10 md:w-10"
              aria-label={t("refresh")}
            >
              <HiArrowPath className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-[18px] md:w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex h-8 flex-1 items-center justify-center gap-1 rounded-full bg-primary px-3 text-[11px] font-semibold text-white shadow-md hover:bg-primary-600 sm:h-9 sm:gap-1.5 sm:px-4 sm:text-xs md:h-10 md:text-sm"
            >
              <HiPencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Update
            </button>
          </div>
        </>,
      )}

      <Modal show={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            {t("input_consumption_data")}
          </h3>
          <p className="mb-4 text-sm text-gray-500">
            {t("enter_consumption_details")}
          </p>
          <ConsumptionForm
            onSuccess={() => {
              setModalOpen(false);
              setTimeout(onRefresh, 500);
            }}
            onCancel={() => setModalOpen(false)}
          />
        </div>
      </Modal>
    </>
  );
}
