// Base XP reward that scales with level
export function getBaseXpReward(level: number): number {
  // Scales from 50 XP at level 1 to ~500 XP at level 50
  // Uses a logarithmic curve for smooth progression
  const baseXp = 50;
  const scalingFactor = 1 + (Math.log(level) / Math.log(50)) * 9; // Scales 1x to 10x
  return Math.floor(baseXp * scalingFactor);
}

// XP required to reach the next level (not cumulative)
export function getXpForNextLevel(level: number): number {
  // More realistic progression that doesn't explode exponentially
  // Starts at 100 XP for level 2, grows to reasonable amounts
  const baseXp = 100;
  const growthRate = 0.15; // 15% growth per level
  const levelingFactor = Math.pow(1 + growthRate, level - 1);

  // Add a small linear component to smooth early levels
  const linearComponent = level * 10;

  return Math.floor(baseXp * levelingFactor + linearComponent);
}

// Total XP required to reach a specific level (cumulative)
export function getTotalXpForLevel(level: number): number {
  if (level <= 1) return 0;

  let totalXp = 0;
  for (let i = 1; i < level; i++) {
    totalXp += getXpForNextLevel(i);
  }
  return totalXp;
}

// Get level and XP progress based on total XP
export function getLevelData(totalXp: number) {
  let level = 1;
  let xpUsed = 0;

  // Find current level
  while (true) {
    const xpForNext = getXpForNextLevel(level);
    if (xpUsed + xpForNext > totalXp) break;
    xpUsed += xpForNext;
    level++;
  }

  const xpForCurrentLevel = xpUsed;
  const xpForNextLevel = getXpForNextLevel(level);
  const xpIntoLevel = totalXp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpIntoLevel;

  const progressPercent = xpIntoLevel / xpForNextLevel;

  return {
    level,
    xpIntoLevel,
    xpNeeded: xpForNextLevel,
    xpToNextLevel: xpNeeded,
    progressPercent,
    totalXpForCurrentLevel: xpForCurrentLevel,
    totalXpForNextLevel: xpForCurrentLevel + xpForNextLevel,
    baseXpReward: getBaseXpReward(level),
  };
}

// Tree stages with more granular progression
export function getTreeStageForLevel(level: number): string {
  if (level < 4) return "tree-1";
  if (level < 8) return "tree-1.5";
  if (level < 16) return "tree-2";
  if (level < 24) return "tree-3";
  return "tree-4";
}

// Bonus multipliers for streaks, difficulty, etc.
export function calculateXpReward(
  baseLevel: number,
  options: {
    streak?: number;
    difficulty?: "easy" | "medium" | "hard";
    perfect?: boolean;
  } = {}
): number {
  let xp = getBaseXpReward(baseLevel);

  // Streak bonus (up to 50% bonus for 30+ day streaks)
  if (options.streak && options.streak > 0) {
    const streakBonus = Math.min(0.5, options.streak * 0.02); // 2% per day, capped at 50%
    xp *= 1 + streakBonus;
  }

  // Difficulty multiplier
  const difficultyMultipliers = {
    easy: 0.8,
    medium: 1.0,
    hard: 1.3,
  };
  xp *= difficultyMultipliers[options.difficulty || "medium"];

  // Perfect completion bonus
  if (options.perfect) {
    xp *= 1.1; // 10% bonus
  }

  return Math.floor(xp);
}

// Utility function to get leveling preview
export function getLevelingPreview(maxLevel: number = 20): Array<{
  level: number;
  xpForNext: number;
  totalXp: number;
  baseReward: number;
  completionsNeeded: number;
}> {
  const preview = [];

  for (let level = 1; level <= maxLevel; level++) {
    const xpForNext = getXpForNextLevel(level);
    const totalXp = getTotalXpForLevel(level);
    const baseReward = getBaseXpReward(level);
    const completionsNeeded = Math.ceil(xpForNext / baseReward);

    preview.push({
      level,
      xpForNext,
      totalXp,
      baseReward,
      completionsNeeded,
    });
  }

  return preview;
}
