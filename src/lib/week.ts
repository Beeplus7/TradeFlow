/** ISO date (YYYY-MM-DD) for Monday of the current UTC week. */
export function currentWeekStart(d = new Date()): string {
  const day = d.getUTCDay(); // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff),
  );
  return monday.toISOString().slice(0, 10);
}
