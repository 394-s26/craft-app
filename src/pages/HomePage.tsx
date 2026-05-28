import { CheckCircle, Lightbulb, Pencil, Spool } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCrafts } from '../hooks/useCrafts';

export const HomePage = () => {
  const { crafts } = useCrafts();
  const inspirationCount = crafts.filter((craft) => craft.status === 'inspiration').length;
  const progressCount = crafts.filter((craft) => craft.status === 'work-in-progress').length;
  const completedCount = crafts.filter((craft) => craft.status === 'completed').length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md" to="/inspiration">
          <h2 className="flex items-center gap-2 font-bold text-ghibli-deep">
            <Lightbulb size={18} className="shrink-0 text-ghibli-sage" />
            Inspiration 
          </h2>
          <p className="mt-3 text-4xl font-black text-ghibli-deep">{inspirationCount}</p>
        </Link>
        <Link className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md" to="/work">
          <h2 className="flex items-center gap-2 font-bold text-ghibli-deep">
            <Spool size={18} className="shrink-0 text-ghibli-sage" />
            Works in progress
          </h2>
          <p className="mt-3 text-4xl font-black text-ghibli-deep">{progressCount}</p>
        </Link>
        <Link className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md" to="/work">
          <h2 className="flex items-center gap-2 font-bold text-ghibli-deep">
            <CheckCircle size={18} className="shrink-0 text-ghibli-sage" />
            Completed crafts
          </h2>
          <p className="mt-3 text-4xl font-black text-ghibli-deep">{completedCount}</p>
        </Link>
      </section>

      <section className="mt-10 rounded-4xl bg-ghibli-deep p-8 text-white md:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-ghibli-sage">Crafter dashboard</p>
        <Link className="mt-8 inline-flex items-center gap-2 rounded-full bg-ghibli-sage px-6 py-3 font-bold text-white hover:bg-ghibli-forest" to="/new">
          <Pencil size={16} />
          Create a craft
        </Link>
      </section>
    </main>
  );
};
