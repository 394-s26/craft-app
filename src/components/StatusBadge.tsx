import type { CraftStatus } from '../types/Craft';
import { formatStatus } from '../utilities/formatStatus';

interface StatusBadgeProps {
  status: CraftStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusStyles = {
    inspiration: 'bg-blue-100 text-blue-900',
    'work-in-progress': 'bg-amber-100 text-amber-900',
    completed: 'bg-green-100 text-green-900',
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
        statusStyles[status]
      }`}
    >
      {formatStatus(status)}
    </span>
  );
};