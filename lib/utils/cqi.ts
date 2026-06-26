import { differenceInCalendarDays, parseISO, subDays } from "date-fns";

export function getGrade(value: number): { grade: string } {
  if (value >= 90) return { grade: "A" };
  if (value >= 75) return { grade: "B" };
  if (value >= 60) return { grade: "C" };
  if (value >= 45) return { grade: "D" };
  return { grade: "E" };
}

export function parseSummaryGradeLetter(grade?: string | null): string | undefined {
  if (!grade || typeof grade !== "string") return undefined;
  const letter = grade.trim().charAt(0).toUpperCase();
  return /^[A-E]$/.test(letter) ? letter : undefined;
}

export function getProgressColor(value: number): string {
  const v = Math.max(0, Math.min(100, value));
  if (v >= 60) return "#8BC34A";
  if (v >= 45) return "#C5D93D";
  if (v >= 30) return "#EB8758";
  return "#D37375";
}

export function getCqiBadgeState(
  createdAt: string | undefined,
  submittedShiftsCount: number,
  t: (key: string) => string,
) {
  if (!createdAt) {
    return { label: t("cqi_badge_mandatory"), hasTodayCqi: false };
  }
  try {
    const getOperationalDate = (input: Date) =>
      input.getHours() < 6 ? subDays(input, 1) : input;
    const nowOperational = getOperationalDate(new Date());
    const parsed = parseISO(createdAt);
    if (Number.isNaN(parsed.getTime())) {
      return { label: t("cqi_badge_mandatory"), hasTodayCqi: false };
    }
    const latestOperational = getOperationalDate(parsed);
    const daysAgo = Math.max(
      0,
      differenceInCalendarDays(nowOperational, latestOperational),
    );
    if (daysAgo > 0) {
      return {
        label: `${t("cqi_data_prefix")} ${daysAgo} ${t("cqi_days_ago_suffix")}`,
        hasTodayCqi: false,
      };
    }
    if (submittedShiftsCount >= 3) {
      return { label: t("cqi_badge_complete"), hasTodayCqi: true };
    }
    if (submittedShiftsCount === 2) {
      return { label: t("shift2"), hasTodayCqi: true };
    }
    if (submittedShiftsCount === 1) {
      return { label: t("shift1"), hasTodayCqi: true };
    }
    return { label: t("cqi_badge_mandatory"), hasTodayCqi: false };
  } catch {
    return { label: t("cqi_badge_mandatory"), hasTodayCqi: false };
  }
}
