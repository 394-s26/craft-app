import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { CraftForm } from '../components/CraftForm';
import { StatusBadge } from '../components/StatusBadge';
import { useCrafts } from '../hooks/useCrafts';
import type { CraftInput, CraftStatus } from '../types/Craft';
import { CircularProgress } from '../components/ProgressCircle';
import { useEffect, useState } from 'react';

export const CraftDetailPage = () => {
  const { craftId } = useParams();
  const navigate = useNavigate();
  const { crafts, editCraft, moveCraft, removeCraft } = useCrafts();
  const craft = crafts.find((currentCraft) => currentCraft.id === craftId);
  const [progress, setProgress] = useState(0);
  const [progressReady, setProgressReady] = useState(false);
  useEffect(() => {
  if (craft) {
      setProgress(craft.progress ?? 0);
      setProgressReady(true); 
    }
  }, [craft]);

  useEffect(() => {
    if (!craft || !progressReady) return; 

    const timeout = setTimeout(() => {
      void editCraft(craft.id, {
        ...craft,
        progress,
      });
    }, 150);

    return () => clearTimeout(timeout);
  }, [progress]);

  if (!craftId) {
    return <Navigate to="/" replace />;
  }

  if (!craft) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-3xl bg-white p-8 text-stone-700 shadow-sm">Craft not found. It may still be loading, or it may have been deleted.</p>
      </main>
    );
  }

  

  

  const handleSubmit = async (input: CraftInput) => {
    await editCraft(craft.id, input);
    navigate(`/${input.status}`);
  };

  const handleMove = async (status: CraftStatus) => {
    await moveCraft(craft.id, status);
    navigate(`/${status}`);
  };

  const handleDelete = async () => {
    await removeCraft(craft.id);
    navigate('/');
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link className="text-sm font-bold text-amber-800 hover:text-amber-950" to={`/${craft.status}`}>
        ← Back to folder
      </Link>
      <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-stone-950">{craft.title}</h1>
            <StatusBadge status={craft.status} />
          </div>
          <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-stone-700">{craft.description}</p>
          {craft.sourceUrl ? (
            <a className="mt-4 inline-flex font-semibold text-amber-800 underline" href={craft.sourceUrl} target="_blank" rel="noreferrer">
              Open inspiration source
            </a>
          ) : null}
          <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-stone-950">Materials</h2>
            {craft.materials.length > 0 ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {craft.materials.map((material) => (
                  <li className="rounded-2xl bg-amber-50 px-4 py-3 text-stone-700" key={material}>
                    {material}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-stone-600">No materials added yet.</p>
            )}
          </section>
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            {craft.photos.map((photo) => (
              <img className="h-72 w-full rounded-3xl object-cover shadow-sm" key={photo.id} src={photo.url} alt={photo.alt} />
            ))}
          </section>
        </div>
        <aside className="space-y-4">
          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm flex items-center gap-4">
            <CircularProgress
              value={progress}
              onChange={setProgress}
            />
            <div>
              <p className="font-bold text-stone-900">Progress</p>
              <p className="text-sm text-stone-500">Drag the ring to update</p>
            </div>
          </section>
          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-stone-950">Move craft</h2>
            <div className="mt-4 grid gap-2">
              <button className="rounded-full border border-stone-300 px-4 py-2 font-semibold hover:bg-stone-100" onClick={() => void handleMove('inspiration')}>Move to Inspiration</button>
              <button className="rounded-full border border-stone-300 px-4 py-2 font-semibold hover:bg-stone-100" onClick={() => void handleMove('work-in-progress')}>Move to Work in Progress</button>
              <button className="rounded-full bg-stone-900 px-4 py-2 font-semibold text-white hover:bg-stone-700" onClick={() => void handleMove('completed')}>Mark Completed</button>
              <button className="rounded-full border border-red-200 px-4 py-2 font-semibold text-red-700 hover:bg-red-50" onClick={() => void handleDelete()}>Delete Craft</button>
            </div>
          </section>
          <CraftForm initialCraft={craft} submitLabel="Update craft" onSubmit={handleSubmit} />
        </aside>
      </section>
    </main>
  );
};
