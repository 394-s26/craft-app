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
          <p className="text-4xl font-black text-stone-950">{inspirationCount}</p>
          <h2 className="mt-2 font-bold text-stone-900">Inspiration crafts</h2>
          <p className="mt-2 text-sm text-stone-600">Save ideas from Instagram, Etsy, patterns, blogs, or your own sketches.</p>
        </Link>
        <Link className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md" to="/work-in-progress">
          <p className="text-4xl font-black text-stone-950">{progressCount}</p>
          <h2 className="mt-2 font-bold text-stone-900">Works in progress</h2>
          <p className="mt-2 text-sm text-stone-600">Track current project photos, descriptions, and materials.</p>
        </Link>
        <Link className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm hover:shadow-md" to="/completed">
          <p className="text-4xl font-black text-stone-950">{completedCount}</p>
          <h2 className="mt-2 font-bold text-stone-900">Completed crafts</h2>
          <p className="mt-2 text-sm text-stone-600">Keep a gallery of everything you have finished.</p>
        </Link>
      </section>
      
      <section className="mt-10 rounded-[2rem] bg-stone-900 p-8 text-white md:p-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-200">Crafter dashboard</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">An app to track you crafts and inspirations.</h1>
        <Link className="mt-8 inline-flex rounded-full bg-amber-500 px-6 py-3 font-bold text-stone-950 hover:bg-amber-400" to="/new">
          Create a craft
        </Link>
      </section>
    </main>
  );
};
