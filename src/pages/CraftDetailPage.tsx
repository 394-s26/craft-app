import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { CraftForm } from '../components/CraftForm';
import { StatusBadge } from '../components/StatusBadge';
import { useCrafts } from '../hooks/useCrafts';
import { useFriends } from '../hooks/useFriends';
import { updateSharedWith } from '../services/craftService';
import type { Craft, CraftInput, CraftStatus } from '../types/Craft';
import { CircularProgress } from '../components/ProgressCircle';
import { useEffect, useState } from 'react';

export const CraftDetailPage = () => {
  const { craftId } = useParams();
  const navigate = useNavigate();
  const { crafts, editCraft, moveCraft, removeCraft } = useCrafts();
  const { friends } = useFriends();

  const [selectedInspirationCraft, setSelectedInspirationCraft] = useState<Craft | null>(null);
  const [editingCraft, setEditingCraft] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const craft = crafts.find((currentCraft) => currentCraft.id === craftId);

  const [progress, setProgress] = useState(0);
  const [progressReady, setProgressReady] = useState(false);

  useEffect(() => {
    if (craft) {
      setProgress(craft.progress ?? 0);
      setProgressReady(true);
      setCurrentPhotoIndex(0);
    }
  }, [craft]);

  useEffect(() => {
    if (!craft || !progressReady) return;

    const nextStatus: CraftStatus =
      progress >= 100
        ? 'completed'
        : craft.status === 'completed'
          ? 'work-in-progress'
          : craft.status;

    const timeout = setTimeout(() => {
      void editCraft(craft.id, {
        ...craft,
        progress,
        status: nextStatus,
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
        <p className="rounded-3xl bg-white p-8 text-stone-700 shadow-sm">
          Craft not found. It may still be loading, or it may have been deleted.
        </p>
      </main>
    );
  }

  const handleSubmit = async (input: CraftInput) => {
    await editCraft(craft.id, input);
    setEditingCraft(false);
  };

  const handleMove = async (status: CraftStatus) => {
    await moveCraft(craft.id, status);
    navigate(`/${status === 'work-in-progress' || status === 'completed' ? 'work' : status}`);
  };

  const handleDelete = async () => {
    await removeCraft(craft.id);
    navigate('/');
  };

  const toggleShare = async (email: string) => {
    const current = craft.sharedWith ?? [];
    const next = current.includes(email)
      ? current.filter((e) => e !== email)
      : [...current, email];
    await updateSharedWith(craft.id, next);
  };

  const photosPerLine = 3;
  const lastPhotoViewIndex = (() => {
    const remainder = craft.photos.length % photosPerLine;
    return craft.photos.length - (remainder === 0 ? photosPerLine : remainder)
  })();

  const goToPreviousPhoto = () => {
    setCurrentPhotoIndex((currentIndex) =>
      currentIndex === 0 ? lastPhotoViewIndex : currentIndex - photosPerLine,
    );
  };

  const goToNextPhoto = () => {
    setCurrentPhotoIndex((currentIndex) =>
      currentIndex === lastPhotoViewIndex ? 0 : currentIndex + photosPerLine,
    );
  };

  const folderRoute = craft.status === 'work-in-progress' || craft.status === 'completed' ? 'work' : craft.status;

  const sources =
    craft.sources?.length
      ? craft.sources
      : craft.sourceUrl
        ? [{ id: 'source-url', type: 'external' as const, url: craft.sourceUrl }]
        : [];

  const currentPhotos = craft.photos.slice(currentPhotoIndex, currentPhotoIndex + photosPerLine);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <Link className="text-sm font-bold text-amber-800 hover:text-amber-950" to={`/${folderRoute}`}>
          ← Back to folder
        </Link>
      </div>

      <section className="mt-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-4xl font-black tracking-tight text-stone-950">
            {craft.title}
          </h1>

          {craft.status !== 'inspiration' ? (
            <CircularProgress value={progress} onChange={setProgress} />
          ) : null}

          <StatusBadge status={craft.status} />

          <button
            className="ml-auto rounded-full bg-stone-900 px-5 py-2 font-bold text-white hover:bg-stone-700"
            type="button"
            onClick={() => setEditingCraft(true)}
          >
            Edit craft
          </button>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-stone-700">
          {craft.description}
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-stone-950">Photos</h2>

        {currentPhotos.length > 0 ? (
          <div>
            <div className="relative overflow-hidden rounded-3xl bg-stone-100 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {currentPhotos.map((photo) => (
                  <img
                    key={`images-${photo.url}`}
                    className="h-[38rem] w-full rounded-2xl object-contain"
                    src={photo.url}
                    alt={photo.alt}
                  />
                ))}
              </div>

              {craft.photos.length > photosPerLine ? (
                <>
                  <button
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-2xl font-black text-stone-900 shadow hover:bg-white"
                    type="button"
                    onClick={goToPreviousPhoto}
                    aria-label="Previous photo"
                  >
                    ←
                  </button>

                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-2xl font-black text-stone-900 shadow hover:bg-white"
                    type="button"
                    onClick={goToNextPhoto}
                    aria-label="Next photo"
                  >
                    →
                  </button>
                </>
              ) : null}
            </div>

            {craft.photos.length > 1 ? (
              <p className="mt-3 text-center text-sm font-semibold text-stone-500">
                {currentPhotoIndex + 1} of {craft.photos.length}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-stone-600">No photos added yet.</p>
        )}
      </section>

      {sources.length > 0 ? (
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-stone-950">Inspiration sources</h2>

          <div className="mt-4 grid gap-3">
            {sources.map((source) => {
              if (source.type === 'external') {
                return (
                  <a
                    className="rounded-2xl bg-amber-50 px-4 py-3 font-semibold text-amber-800 underline"
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    key={source.id}
                  >
                    {source.url}
                  </a>
                );
              }

              const linkedCraft = crafts.find((currentCraft) => currentCraft.id === source.craftId);

              return (
                <button
                  className="rounded-2xl bg-amber-50 px-4 py-3 text-left font-semibold text-amber-800 underline"
                  type="button"
                  key={source.id}
                  onClick={() => {
                    if (linkedCraft) {
                      setSelectedInspirationCraft(linkedCraft);
                    }
                  }}
                >
                  {linkedCraft ? `${linkedCraft.title} (Inspo Craft)` : 'Linked inspiration craft not found'}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.45fr]">
        <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
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

        <aside className="space-y-4">
          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-stone-950">Move craft</h2>
            <div className="mt-4 grid gap-2">
              {craft.status === 'inspiration' ? (
                <button
                  className="rounded-full border border-stone-300 px-4 py-2 font-semibold hover:bg-stone-100"
                  onClick={() => void handleMove('work-in-progress')}
                >
                  Move to Work In Progress
                </button>
              ) : (
                <button
                  className="rounded-full border border-stone-300 px-4 py-2 font-semibold hover:bg-stone-100"
                  onClick={() => void handleMove('inspiration')}
                >
                  Move to Inspiration
                </button>
              )}

              <button
                className="rounded-full border border-red-200 px-4 py-2 font-semibold text-red-700 hover:bg-red-50"
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Craft
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-stone-950">Share</h2>
            {friends.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">
                Add friends on the Friends page to share this craft.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {friends.map((friend) => {
                  const isShared = craft.sharedWith?.includes(friend.toEmail) ?? false;
                  return (
                    <li key={friend.id} className="flex items-center justify-between">
                      <span className="truncate text-sm text-stone-700">{friend.toEmail}</span>
                      <button
                        className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-bold transition ${isShared ? 'bg-amber-700 text-white hover:bg-amber-900' : 'border border-stone-300 text-stone-700 hover:bg-stone-100'}`}
                        type="button"
                        onClick={() => void toggleShare(friend.toEmail)}
                      >
                        {isShared ? 'Shared ✓' : 'Share'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </aside>
      </section>


      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black text-stone-950">Delete this craft?</h2>
            <p className="mt-3 text-stone-600">
              Are you sure you want to delete "{craft.title}"? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-full border border-stone-300 px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100"
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="rounded-full bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-800"
                type="button"
                onClick={() => void handleDelete()}
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editingCraft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4 py-8">
          <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-stone-950">Edit craft</h2>
                <p className="mt-1 text-sm text-stone-500">Update the craft details, sources, materials, and photos.</p>
              </div>

              <button
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white hover:bg-stone-700"
                type="button"
                onClick={() => setEditingCraft(false)}
              >
                Close
              </button>
            </div>

            <CraftForm initialCraft={craft} submitLabel="Update craft" onSubmit={handleSubmit} />
          </div>
        </div>
      ) : null}

      {selectedInspirationCraft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4 py-8">
          <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-black tracking-tight text-stone-950">{selectedInspirationCraft.title}</h2>
                  <StatusBadge status={selectedInspirationCraft.status} />
                </div>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-stone-700">{selectedInspirationCraft.description}</p>
              </div>

              <button
                className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white hover:bg-stone-700"
                type="button"
                onClick={() => setSelectedInspirationCraft(null)}
              >
                Close
              </button>
            </div>

            {selectedInspirationCraft.sourceUrl ? (
              <a
                className="mt-5 inline-flex font-semibold text-amber-800 underline"
                href={selectedInspirationCraft.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open original source
              </a>
            ) : null}

            <section className="mt-6 rounded-2xl bg-amber-50 p-4">
              <h3 className="font-bold text-stone-900">Materials</h3>
              {selectedInspirationCraft.materials.length > 0 ? (
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {selectedInspirationCraft.materials.map((material) => (
                    <li className="rounded-2xl bg-white px-4 py-3 text-stone-700" key={material}>
                      {material}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-stone-600">No materials added.</p>
              )}
            </section>

            {selectedInspirationCraft.photos.length > 0 ? (
              <section className="mt-6 grid gap-4 sm:grid-cols-2">
                {selectedInspirationCraft.photos.map((photo) => (
                  <img className="h-72 w-full rounded-3xl object-cover shadow-sm" key={photo.id} src={photo.url} alt={photo.alt} />
                ))}
              </section>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
};