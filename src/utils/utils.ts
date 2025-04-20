import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export const cn = (...inputs) => twMerge(clsx(inputs));

export function calculateStreakLength(
  checkinHistory: Record<string, { userA: boolean; userB: boolean }>,
  isUserA: boolean,
  frequency: "daily" | "weekly",
  streakStart: number
): number {
  const start = new Date(streakStart);
  const now = new Date();

  let streak = 0;
  let current = new Date(start);

  while (current <= now) {
    const key = current.toISOString().split("T")[0];
    const entry = checkinHistory[key];

    const checkedIn = isUserA ? entry?.userA : entry?.userB;
    if (checkedIn) {
      streak++;
      current.setDate(current.getDate() + (frequency === "daily" ? 1 : 7));
    } else {
      break;
    }
  }

  return streak;
}

function calculateStreakStart(checkinDates: Date[]): Date | null {
  if (checkinDates.length === 0) return null;

  const sorted = [...checkinDates].sort((a, b) => b.getTime() - a.getTime());
  let streakStart = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const diff =
      (sorted[i - 1].getTime() - sorted[i].getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 1) {
      streakStart = sorted[i];
    } else {
      break;
    }
  }

  return streakStart;
}

function getCheckinsThisWeek(checkinDates: Date[]): number {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday

  return checkinDates.filter((d) => d >= startOfWeek && d <= now).length;
}
