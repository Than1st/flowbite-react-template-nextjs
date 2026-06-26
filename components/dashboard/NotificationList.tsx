"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  HiBell,
  HiCheck,
  HiCheckCircle,
  HiClock,
  HiInformationCircle,
  HiXCircle,
  HiExclamation,
} from "react-icons/hi";
import { Button, Checkbox, Spinner } from "flowbite-react";
import { notificationService } from "@/lib/api/services/notification.service";
import { useTranslation } from "@/hooks/useTranslation";
import type { DashboardNotification } from "@/types/dashboard";

interface NotificationListProps {
  notifications: DashboardNotification[];
  loading?: boolean;
  onRefresh: () => void;
  className?: string;
}

function getNotifStyle(type: string) {
  switch (type) {
    case "error":
      return {
        accent: "bg-high",
        iconWrap: "bg-red-100",
        iconColor: "text-high",
        title: "text-high",
      };
    case "success":
      return {
        accent: "bg-[#1C5E1C]",
        iconWrap: "bg-green-100",
        iconColor: "text-[#1C5E1C]",
        title: "text-[#1C5E1C]",
      };
    case "warning":
      return {
        accent: "bg-warning",
        iconWrap: "bg-orange-100",
        iconColor: "text-warning",
        title: "text-orange-700",
      };
    default:
      return {
        accent: "bg-secondary-700",
        iconWrap: "bg-secondary-50",
        iconColor: "text-secondary-700",
        title: "text-gray-900",
      };
  }
}

function NotificationIcon({
  type,
  className,
}: {
  type: string;
  className: string;
}) {
  switch (type) {
    case "error":
      return <HiXCircle className={className} />;
    case "success":
      return <HiCheckCircle className={className} />;
    case "warning":
      return <HiExclamation className={className} />;
    default:
      return <HiInformationCircle className={className} />;
  }
}

function timeSince(dateString: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  );
  const intervals: [string, number][] = [
    ["tahun", 31536000],
    ["bulan", 2592000],
    ["minggu", 604800],
    ["hari", 86400],
    ["jam", 3600],
    ["menit", 60],
  ];
  for (const [unit, sec] of intervals) {
    const n = Math.floor(seconds / sec);
    if (n >= 1) return `${n} ${unit} lalu`;
  }
  return "Baru saja";
}

function formatNotifTime(dateString: string) {
  const d = new Date(dateString);
  const datePart = format(d, "d MMM, HH.mm", { locale: idLocale });
  return `${datePart} • ${timeSince(dateString)}`;
}

function NotificationItem({
  notif,
  selectMode,
  selected,
  onToggleSelect,
  onMarkRead,
  markAsReadLabel,
}: {
  notif: DashboardNotification;
  selectMode: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onMarkRead: () => void;
  markAsReadLabel: string;
}) {
  const style = getNotifStyle(notif.notification_type);

  return (
    <li
      className={`flex overflow-hidden border-b border-gray-100 last:border-b-0 ${
        selectMode && selected ? "bg-light/10" : "bg-white"
      }`}
    >
      <div className={`w-1 shrink-0 ${style.accent}`} aria-hidden />
      <div className="flex min-w-0 flex-1 gap-2 py-2.5 pl-2.5 pr-1 xl:gap-3 xl:py-3 xl:pl-3 xl:pr-2">
        {selectMode && (
          <Checkbox
            checked={selected}
            onChange={onToggleSelect}
            className="mt-1 shrink-0"
          />
        )}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full xl:h-9 xl:w-9 ${style.iconWrap}`}
        >
          <NotificationIcon
            type={notif.notification_type}
            className={`h-4 w-4 xl:h-5 xl:w-5 ${style.iconColor}`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`line-clamp-1 text-[11px] font-semibold leading-tight xl:text-sm ${style.title}`}
          >
            {notif.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-gray-900 xl:text-xs">
            {notif.description}
          </p>
          <div className="mt-1 flex items-center gap-0.5 text-[9px] text-gray-500 xl:text-xs">
            <HiClock className="h-2.5 w-2.5 shrink-0 xl:h-3.5 xl:w-3.5" />
            <span className="truncate">{formatNotifTime(notif.timestamp)}</span>
          </div>
        </div>
        {!selectMode && (
          <button
            type="button"
            onClick={onMarkRead}
            className="hidden shrink-0 self-start text-xs text-secondary-700 hover:underline xl:inline"
          >
            {markAsReadLabel}
          </button>
        )}
      </div>
    </li>
  );
}

export function NotificationList({
  notifications,
  loading,
  onRefresh,
  className,
}: NotificationListProps) {
  const { t } = useTranslation();
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [marking, setMarking] = useState(false);

  const unread = useMemo(
    () => notifications.filter((n) => n.unread),
    [notifications],
  );

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    if (selected.length === unread.length) {
      setSelected([]);
    } else {
      setSelected(unread.map((n) => n.id));
    }
  };

  const markSelectedRead = async () => {
    if (!selected.length) return;
    setMarking(true);
    try {
      await notificationService.markBulkRead(selected);
      setSelected([]);
      setSelectMode(false);
      onRefresh();
    } finally {
      setMarking(false);
    }
  };

  const markOneRead = async (id: number) => {
    await notificationService.markRead(id);
    onRefresh();
  };

  if (loading) {
    return (
      <div
        className={`dashboard-card-solid flex h-full min-h-0 items-center justify-center px-3 pt-3 pb-0 xl:px-5 xl:pt-5 xl:pb-0 ${className ?? ""}`}
      >
        <div className="text-center">
          <Spinner size="lg" color="purple" />
          <p className="mt-2 text-[11px] font-medium text-gray-700 xl:mt-4 xl:text-sm">
            {t("loading_notifications")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dashboard-card-solid flex h-full min-h-0 flex-col overflow-hidden px-3 pt-3 pb-0 xl:px-5 xl:pt-5 xl:pb-0 ${className ?? ""}`}
    >
      <div className="shrink-0 border-b border-gray-200 pb-2 xl:pb-3">
        <h3 className="font-heading text-lg font-semibold text-gray-900 xl:text-2xl">
          {t("notifications")}
        </h3>
        <p className="mt-0.5 text-[11px] font-medium text-gray-500 xl:text-sm">
          {unread.length > 0
            ? `${unread.length} ${t("unread_notifications")}`
            : t("no_unread_notifications")}
          {selectMode &&
            selected.length > 0 &&
            ` • ${selected.length} ${t("selected_count")}`}
        </p>
      </div>

      <div className="min-h-0 max-h-[10.5rem] flex-1 overflow-y-auto xl:max-h-none">
        {unread.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-5 xl:py-8">
            <div className="mb-2 rounded-full bg-amber-100 p-3 xl:mb-3 xl:p-4">
              <HiBell className="h-6 w-6 text-amber-500 xl:h-8 xl:w-8" />
            </div>
            <p className="text-[11px] font-medium text-gray-800 xl:text-sm">
              {t("no_notifications_title")}
            </p>
            <p className="mt-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-gray-700 xl:px-3 xl:py-1 xl:text-xs">
              {t("no_notifications_subtitle")}
            </p>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-sm">
            {unread.map((notif) => (
              <NotificationItem
                key={notif.id}
                notif={notif}
                selectMode={selectMode}
                selected={selected.includes(notif.id)}
                onToggleSelect={() => toggleSelect(notif.id)}
                onMarkRead={() => markOneRead(notif.id)}
                markAsReadLabel={t("mark_as_read")}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-end border-t border-gray-100 pt-1.5 xl:pt-2 sm:pb-4">
        {unread.length > 0 && !selectMode && (
          <button
            type="button"
            className="rounded-full bg-light px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm hover:bg-light/90 xl:px-4 xl:py-2 xl:text-xs"
            onClick={() => setSelectMode(true)}
          >
            {t("select_multiple")}
          </button>
        )}
        {selectMode && (
          <>
            <button
              type="button"
              onClick={selectAll}
              className="flex items-center gap-1 text-sm font-semibold text-secondary-700"
            >
              <HiCheck className="h-4 w-4" />
              {t("select_all")}
            </button>
            <Button
              size="xs"
              disabled={marking || selected.length === 0}
              className="rounded-full bg-light text-white hover:bg-light/90"
              onClick={markSelectedRead}
            >
              {marking ? <Spinner size="sm" /> : t("mark_as_read")}
            </Button>
            <Button
              size="xs"
              color="gray"
              className="rounded-full"
              onClick={() => setSelectMode(false)}
            >
              ✕
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
