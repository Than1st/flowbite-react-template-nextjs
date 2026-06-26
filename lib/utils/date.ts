import { formatDistanceToNow, parseISO, isValid } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";

export function formatShortRelativeTime(
  dateStr: string,
  lang: "id" | "en" = "id",
): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: lang === "id" ? idLocale : enUS,
    });
  } catch {
    return dateStr;
  }
}

export function formatDate(date: Date | string, pattern = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!isValid(d)) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  if (pattern === "dd/MM/yyyy") return `${day}/${month}/${year}`;
  return d.toLocaleDateString();
}

export { getDateRangeMonthsBack } from "@/lib/utils/date-range";
