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
  if (level < 4) return 'tree-1';
  if (level < 8) return 'tree-1.5';
  if (level < 16) return 'tree-2';
  if (level < 24) return 'tree-3';
  return 'tree-4';
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
