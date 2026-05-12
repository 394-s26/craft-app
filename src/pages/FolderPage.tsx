import { CraftGrid } from '../components/CraftGrid';
import { useCrafts } from '../hooks/useCrafts';
import type { CraftStatus } from '../types/Craft';

interface FolderPageProps {
  status: CraftStatus[];
  title: string;
  description: string;
}

export const FolderPage = ({ status, title, description }: FolderPageProps) => {
  const { crafts, loading, error } = useCrafts();
  const filteredCrafts = crafts.filter((craft) => status.includes(craft.status));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-stone-950">{title}</h1>
        <p className="mt-3 max-w-2xl text-stone-600">{description}</p>
      </section>
      {loading ? <p className="text-stone-600">Loading crafts...</p> : null}
      {error ? <p className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {!loading ? <CraftGrid crafts={filteredCrafts} emptyTitle={`No ${title.toLowerCase()} yet`} emptyMessage="Add a craft and choose this folder to see it here." /> : null}
    </main>
  );
};
