export const getRarityColors = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return {
        primary: '#6b7280',
        secondary: '#9ca3af',
        light: '#f3f4f6',
        border: '#d1d5db',
        accent: '#4b5563',
      };
    case 'uncommon':
      return {
        primary: '#10b981',
        secondary: '#34d399',
        light: '#d1fae5',
        border: '#a7f3d0',
        accent: '#059669',
      };
    case 'rare':
      return {
        primary: '#3b82f6',
        secondary: '#60a5fa',
        light: '#dbeafe',
        border: '#93c5fd',
        accent: '#2563eb',
      };
    case 'epic':
      return {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        light: '#ede9fe',
        border: '#c4b5fd',
        accent: '#7c3aed',
      };
    case 'legendary':
      return {
        primary: '#f59e0b',
        secondary: '#fbbf24',
        light: '#fef3c7',
        border: '#fcd34d',
        accent: '#d97706',
      };
    default:
      return {
        primary: '#6b7280',
        secondary: '#9ca3af',
        light: '#f3f4f6',
        border: '#d1d5db',
        accent: '#4b5563',
      };
  }
};
