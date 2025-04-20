// Total XP required to reach a specific level
export function getXpForLevel(level: number): number {
  return 5 * level * level; // You can adjust this scaling
}

// Get level and XP progress based on total XP
export function getLevelData(totalXp: number) {
  let level = 1;

  while (getXpForLevel(level) <= totalXp) {
    level++;
  }

  level--; // Go back to last level you had enough XP for

  const xpForCurrentLevel = getXpForLevel(level);
  const xpForNextLevel = getXpForLevel(level + 1);
  const xpIntoLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;

  const progressPercent = xpIntoLevel / xpNeeded;

  return {
    level,
    xpIntoLevel,
    xpNeeded,
    progressPercent,
  };
}

export function getTreeStageForLevel(level: number): string {
  if (level < 10) return "sprout";
  if (level < 20) return "smallTree";
  if (level < 30) return "mediumTree";
  return "grownTree";
}
