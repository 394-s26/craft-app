import { useState, useEffect } from 'react';
import { CraftGrid } from '../components/CraftGrid';
import { InspoForm } from '../components/InspoForm';
import { CraftForm } from '../components/CraftForm';
import { useCrafts } from '../hooks/useCrafts';
import type { CraftStatus, CraftInput } from '../types/Craft';
import { formatStatus } from '../utilities/formatStatus';

interface FolderPageProps {
  status: CraftStatus[];
  title: string;
  description: string;
  defaultFilters?: CraftStatus[];
}

const statusStyles: Record<CraftStatus, { active: string; inactive: string }> = {
  inspiration: {
    active: 'border-blue-600 bg-blue-600 text-white',
    inactive: 'border-stone-300 bg-white text-stone-700 hover:border-blue-600',
  },
  'work-in-progress': {
    active: 'border-ghibli-deep bg-ghibli-deep text-white',
    inactive: 'border-stone-300 bg-white text-stone-700 hover:border-ghibli-forest',
  },
  completed: {
    active: 'border-ghibli-deep bg-ghibli-deep text-white',
    inactive: 'border-stone-300 bg-white text-stone-700 hover:border-ghibli-deep',
  },
};

type VisibilityFilter = 'all' | 'public' | 'private';

export const FolderPage = ({ status, title, description, defaultFilters }: FolderPageProps) => {
  const { crafts, loading, error, addCraft } = useCrafts();

  const [activeFilters, setActiveFilters] = useState<CraftStatus[]>(
    defaultFilters ?? status,
  );
  useEffect(() => {
    setActiveFilters(defaultFilters ?? status);
  }, [defaultFilters, status]);
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [showNewCraftModal, setShowNewCraftModal] = useState(false);

  const isInspirationOnly = status.length === 1 && status[0] === 'inspiration';

  const toggleFilter = (s: CraftStatus) => {
    setActiveFilters((prev) =>
      prev.includes(s)
        ? prev.length > 1
          ? prev.filter((f) => f !== s)
          : prev
        : [...prev, s],
    );
  };

  const effectiveFilters = status.length > 1 ? activeFilters : status;

  const filteredCrafts = crafts
    .filter((craft) => effectiveFilters.includes(craft.status))
    .filter((craft) => {
      if (visibilityFilter === 'public') return craft.isPublic;
      if (visibilityFilter === 'private') return !craft.isPublic;
      return true;
    });

  const handleInspoSave = async (input: CraftInput) => {
    await addCraft(input);
  };

  const handleNewCraftSave = async (input: CraftInput) => {
    await addCraft(input);
    setShowNewCraftModal(false);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-ghibli-deep">{title}</h1>
          <p className="mt-3 max-w-2xl text-stone-600">{description}</p>
        </div>
        {!isInspirationOnly && (
          <button
            type="button"
            onClick={() => setShowNewCraftModal(true)}
            className="shrink-0 rounded-full bg-ghibli-deep px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            + New craft
          </button>
        )}
      </section>

      {isInspirationOnly && (
        <InspoForm onSave={handleInspoSave} />
      )}

      <div className="mb-6 flex flex-wrap items-center gap-4">
        {status.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-stone-600">Status:</span>
            {status.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleFilter(s)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                  activeFilters.includes(s) ? statusStyles[s].active : statusStyles[s].inactive
                }`}
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
                  ? 'border-ghibli-deep bg-ghibli-deep text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:border-ghibli-deep'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p className="text-stone-600">Loading crafts…</p> : null}
      {error ? (
        <p className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p>
      ) : null}
      {!loading ? (
        <div className={isInspirationOnly ? '[&>section]:items-start' : ''}>
          <CraftGrid
            crafts={filteredCrafts}
            emptyTitle={`No ${title.toLowerCase()} yet`}
            emptyMessage="Add a craft and choose this folder to see it here."
          />
        </div>
      ) : null}

      {/* New craft modal */}
      {showNewCraftModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowNewCraftModal(false); }}
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-ghibli-deep">New craft</h2>
              <button
                type="button"
                onClick={() => setShowNewCraftModal(false)}
                className="text-stone-400 hover:text-stone-600 text-xl leading-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <CraftForm submitLabel="Save craft" onSubmit={handleNewCraftSave} />
          </div>
        </div>
      )}
    </main>
  );
};