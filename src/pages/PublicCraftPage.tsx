import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { getCraftById } from '../services/craftService';
import type { Craft } from '../types/Craft';

export const PublicCraftPage = () => {
  const { craftId } = useParams();
  const [craft, setCraft] = useState<Craft | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!craftId) return;
    getCraftById(craftId)
      .then((result) => {
        if (!result || !result.isPublic) setNotFound(true);
        else setCraft(result);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [craftId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ghibli-light">
        <p className="text-stone-600">Loading...</p>
      </main>
    );
  }

  if (notFound || !craft) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ghibli-light px-4">
        <p className="text-xl font-bold text-stone-700">This craft is private or doesn't exist.</p>
        <Link className="rounded-full bg-ghibli-deep px-6 py-3 font-bold text-white hover:bg-ghibli-forest" to="/">
          Open Crafter
        </Link>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-ghibli-light">
      <header className="border-b border-ghibli-soft bg-ghibli-light/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-2xl font-black tracking-tight text-ghibli-deep">Crafter</Link>
          <Link className="rounded-full bg-ghibli-deep px-4 py-2 text-sm font-bold text-white hover:bg-ghibli-forest" to="/">
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-black tracking-tight text-ghibli-deep">{craft.title}</h1>
          <StatusBadge status={craft.status} />
        </div>

        {craft.description ? (
          <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-stone-700">{craft.description}</p>
        ) : null}

        {craft.photos.length > 0 ? (
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            {craft.photos.map((photo) => (
              <img
                key={photo.id}
                className="w-full rounded-3xl object-cover shadow-sm"
                src={photo.url}
                alt={photo.alt}
              />
            ))}
          </section>
        ) : null}

        {craft.materials.length > 0 ? (
          <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-ghibli-deep">Materials</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {craft.materials.map((material) => (
                <li key={material} className="rounded-2xl bg-ghibli-light px-4 py-3 text-stone-700">
                  {material}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-12 rounded-3xl bg-ghibli-soft p-8 text-center">
          <p className="text-lg font-bold text-ghibli-deep">Track your own crafts on Crafter</p>
          <p className="mt-1 text-sm text-ghibli-forest">Save inspiration, log progress, share your work.</p>
          <Link
            className="mt-4 inline-block rounded-full bg-ghibli-deep px-6 py-3 font-bold text-white hover:bg-ghibli-forest"
            to="/"
          >
            Get started
          </Link>
        </div>
      </main>
    </div>
  );
};
