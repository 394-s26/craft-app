import type { Craft } from '../types/Craft';
import { CraftCard } from './CraftCard';
import { EmptyState } from './EmptyState';

interface CraftGridProps {
  crafts: Craft[];
  emptyTitle: string;
  emptyMessage: string;
}

export const CraftGrid = ({ crafts, emptyTitle, emptyMessage }: CraftGridProps) => {
  if (crafts.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <section className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {crafts.map((craft) => (
        <CraftCard key={craft.id} craft={craft} />
      ))}
    </section>
  );
};
