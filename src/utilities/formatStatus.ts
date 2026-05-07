import type { CraftStatus } from '../types/Craft';

export const formatStatus = (status: CraftStatus): string => {
  const labels: Record<CraftStatus, string> = {
    inspiration: 'Inspiration',
    'work-in-progress': 'Work in Progress',
    completed: 'Completed',
  };

  return labels[status];
};
