export function getTodayDateStr(): string {
  return new Date().toISOString().split("T")[0];
}
