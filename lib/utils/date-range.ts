/** Rentang tanggal tanpa dependensi date-fns (hindari vendor-chunk error) */
export function getDateRangeMonthsBack(months: number): {
  start: string;
  end: string;
} {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}
