export const validateHabitTitle = (
  title: string,
  existingHabits: any[] = [],
): string => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    return 'Habit title is required';
  }

  if (trimmedTitle.length < 3) {
    return 'Habit title must be at least 3 characters long';
  }

  if (trimmedTitle.length > 50) {
    return 'Habit title must be less than 50 characters';
  }

  // Check for profanity or inappropriate content (basic check)
  const inappropriate = ['damn', 'shit', 'fuck']; // Add more as needed
  const hasInappropriate = inappropriate.some((word) =>
    trimmedTitle.toLowerCase().includes(word.toLowerCase()),
  );

  if (hasInappropriate) {
    return 'Please use appropriate language for habit titles';
  }

  // Check for duplicate habits
  const duplicateExists = existingHabits.some(
    (habit) => habit.title.toLowerCase() === trimmedTitle.toLowerCase(),
  );

  if (duplicateExists) {
    return 'A habit with this title already exists';
  }

  return '';
};

export const getHabitProgress = (
  habit: any,
  isUserA: boolean,
  timeWindow: number = 86400e3,
) => {
  const now = Date.now();
  const lastCheckinA = habit.last_checkin_at_userA ?? 0;
  const lastCheckinB = habit.last_checkin_at_userB ?? 0;

  const userCompleted = isUserA
    ? now - lastCheckinA < timeWindow
    : now - lastCheckinB < timeWindow;

  const partnerCompleted = isUserA
    ? now - lastCheckinB < timeWindow
    : now - lastCheckinA < timeWindow;

  return {
    userCompleted,
    partnerCompleted,
    bothCompleted: userCompleted && partnerCompleted,
    lastUserCheckin: isUserA ? lastCheckinA : lastCheckinB,
    lastPartnerCheckin: isUserA ? lastCheckinB : lastCheckinA,
  };
};

export const formatTimeRemaining = (targetTime: number): string => {
  const now = Date.now();
  const diff = targetTime - now;

  if (diff <= 0) return '00:00:00';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if (hours >= 24) {
    return `${Math.ceil(hours / 24)} day${Math.ceil(hours / 24) > 1 ? 's' : ''}`;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
