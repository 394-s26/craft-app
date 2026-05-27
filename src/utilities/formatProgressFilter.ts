import type { CraftStatus } from '../types/Craft';

export const formatProgressFilter = (status: CraftStatus | 'all'): string => {
  const labels: Record<CraftStatus | 'all', string> = {
    inspiration: 'Inspiration',
    'work-in-progress': 'Work in Progress',
    completed: 'Completed',
    all: "All",
  };

  return labels[status];
};
