import { useState } from 'react';
import { CraftGrid } from '../components/CraftGrid';
import { useCrafts } from '../hooks/useCrafts';
import type { CraftStatus } from '../types/Craft';
import { formatStatus } from '../utilities/formatStatus';

interface FolderPageProps {
  status: CraftStatus[];
  title: string;
  description: string;
}

const statusStyles: Record<CraftStatus, { active: string; inactive: string }> = {
  inspiration: {
    active: 'border-blue-600 bg-blue-600 text-white',
    inactive: 'border-stone-300 bg-white text-stone-700 hover:border-blue-600',
  },
  'work-in-progress': {
    active: 'border-amber-700 bg-amber-700 text-white',
    inactive: 'border-stone-300 bg-white text-stone-700 hover:border-amber-700',
  },
  completed: {
    active: 'border-green-700 bg-green-700 text-white',
    inactive: 'border-stone-300 bg-white text-stone-700 hover:border-green-700',
  },
};

type VisibilityFilter = 'all' | 'public' | 'private';

export const FolderPage = ({ status, title, description }: FolderPageProps) => {
  const { crafts, loading, error } = useCrafts();
  const [activeFilters, setActiveFilters] = useState<CraftStatus[]>(status);
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');

  const toggleFilter = (s: CraftStatus) => {
    setActiveFilters((prev) =>
      prev.includes(s)
        ? prev.length > 1 ? prev.filter((f) => f !== s) : prev
        : [...prev, s],
    );
  };

  const filteredCrafts = crafts
    .filter((craft) => activeFilters.includes(craft.status))
    .filter((craft) => {
      if (visibilityFilter === 'public') return craft.isPublic;
      if (visibilityFilter === 'private') return !craft.isPublic;
      return true;
    });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-stone-950">{title}</h1>
        <p className="mt-3 max-w-2xl text-stone-600">{description}</p>
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        {status.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-stone-600">Status:</span>
            {status.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleFilter(s)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${activeFilters.includes(s) ? statusStyles[s].active : statusStyles[s].inactive}`}
              >
                {formatStatus(s)}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-stone-600">Visibility:</span>
          {(['all', 'public', 'private'] as VisibilityFilter[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisibilityFilter(v)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                visibilityFilter === v
                  ? 'border-stone-700 bg-stone-700 text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:border-stone-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-stone-600">Loading crafts...</p> : null}
      {error ? <p className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {!loading ? <CraftGrid crafts={filteredCrafts} emptyTitle={`No ${title.toLowerCase()} yet`} emptyMessage="Add a craft and choose this folder to see it here." /> : null}
    </main>
  );
};
