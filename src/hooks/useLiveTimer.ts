import { useEffect, useState } from "react";

function getTimeUntilEndOfDay(): string {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const diff = endOfDay.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return diff >= 86400000
    ? `${Math.ceil(diff / 86400000)} days`
    : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
}

function getTimeUntilEndOfWeek(): string {
  const now = new Date();
  const day = now.getDay(); // Sunday = 0 ... Saturday = 6
  const daysUntilEndOfWeek = (7 - day) % 7;
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysUntilEndOfWeek);
  endOfWeek.setHours(23, 59, 59, 999);

  const diff = endOfWeek.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return diff >= 86400000
    ? `${Math.ceil(diff / 86400000)} days`
    : `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
        seconds
      ).padStart(2, "0")}`;
}

export const useLiveTimers = () => {
  const [timeToday, setTimeToday] = useState(getTimeUntilEndOfDay());
  const [timeWeek, setTimeWeek] = useState(getTimeUntilEndOfWeek());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeToday(getTimeUntilEndOfDay());
      setTimeWeek(getTimeUntilEndOfWeek());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { timeToday, timeWeek };
};
