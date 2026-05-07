import type { CraftStatus } from '../types/Craft';
import { formatStatus } from '../utilities/formatStatus';

interface StatusBadgeProps {
  status: CraftStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-900">{formatStatus(status)}</span>
);
