export function getDropChances(isDaily: boolean) {
  return {
    common: isDaily ? 18 : 50,
    uncommon: isDaily ? 7 : 25,
    rare: isDaily ? 3 : 15,
    epic: isDaily ? 1.5 : 8,
    legendary: isDaily ? 0.5 : 3,
  };
}
