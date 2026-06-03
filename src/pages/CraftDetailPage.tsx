import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { CraftForm } from '../components/CraftForm';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { useCrafts } from '../hooks/useCrafts';
import { useFriends } from '../hooks/useFriends';
import { updateIsPublic, updateSharedWith } from '../services/craftService';
import { sendCraftShareEmail } from '../services/emailService';
import type { Craft, CraftInput, CraftStatus } from '../types/Craft';
import { CircularProgress } from '../components/ProgressCircle';
import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export const CraftDetailPage = () => {
  const { craftId } = useParams();
  const navigate = useNavigate();
  const { crafts, editCraft, removeCraft } = useCrafts();
  const { user } = useAuth();
  const { friends } = useFriends();

  const [selectedInspirationCraft, setSelectedInspirationCraft] = useState<Craft | null>(null);
  const [editingCraft, setEditingCraft] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [inspirationSlideIndex, setInspirationSlideIndex] = useState(0);

  const craft = crafts.find((currentCraft) => currentCraft.id === craftId);

  const [progress, setProgress] = useState(0);
  const [progressReady, setProgressReady] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState('');
  const [copied, setCopied] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const renderDescription = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ghibli-forest underline break-all"
          >
            {part}
          </a>
        );
      }

      return part;
    });
  };

  useEffect(() => {
    if (craft) {
      setProgress(craft.progress ?? 0);
      setProgressReady(true);
      setCurrentPhotoIndex(0);
    }
  }, [craft]);

  useEffect(() => {
    if (!craftId) return;

    const existing: string[] = JSON.parse(
      localStorage.getItem('recentCrafts') || '[]'
    );

    const updated = [
      craftId,
      ...existing.filter((id) => id !== craftId),
    ].slice(0, 3);

    localStorage.setItem('recentCrafts', JSON.stringify(updated));
  }, [craftId]);

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

  const handleDelete = async () => {
    await removeCraft(craft.id);
    navigate('/');
  };

  const handleShareWithEmail = async (e: FormEvent) => {
    e.preventDefault();
    const email = shareEmail.trim().toLowerCase();
    if (!email) return;
    setSharing(true);
    setShareError('');
    try {
      const current = craft.sharedWith ?? [];
      if (!current.includes(email)) {
        await updateSharedWith(craft.id, [...current, email]);
      }
      const fromName = user?.displayName ?? user?.email ?? 'Someone';
      const fromEmail = user?.email ?? '';
      const craftUrl = `${window.location.origin}/public/${craft.id}`;
      await sendCraftShareEmail(fromName, fromEmail, email, craft.title, craftUrl);
      setShareEmail('');
    } catch {
      setShareError('Could not share. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  const revokeAccess = async (email: string) => {
    const current = craft.sharedWith ?? [];
    await updateSharedWith(craft.id, current.filter((e) => e !== email));
  };

  const togglePublic = async () => {
    await updateIsPublic(craft.id, !craft.isPublic);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/public/${craft.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allInspoTags = Array.from(
    new Set(
      crafts
        .filter((c) => c.status === 'inspiration')
        .flatMap((c) => c.tags ?? []),
    ),
  ).filter(Boolean) as string[];

  const suggestedTags = craft?.status === 'inspiration'
    ? allInspoTags.filter(
        (tag) => !craft.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()),
      )
    : [];

  const handleAddTag = async (value: string) => {
    if (!craft) return;
    const nextTag = value.trim();
    if (!nextTag) return;
    if (craft.tags?.some((tag) => tag.toLowerCase() === nextTag.toLowerCase()))
      return;

    const updatedTags = [...(craft.tags ?? []), nextTag];
    await editCraft(craft.id, { ...craft, tags: updatedTags });
    setTagInput('');
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!craft) return;
    const updatedTags = (craft.tags ?? []).filter((tag) => tag !== tagToRemove);
    await editCraft(craft.id, { ...craft, tags: updatedTags });
  };

  const selectedInspirationSourceUrl = selectedInspirationCraft?.sourceUrl
    ?? "SOURCE_URL_NOT_AVAILABLE";

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

  const sources = craft.sources?.length ? craft.sources : [];

  const currentPhotos = craft.photos.slice(currentPhotoIndex, currentPhotoIndex + photosPerLine);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <Link className="text-sm font-bold text-ghibli-forest hover:text-ghibli-deep" to={`/${folderRoute}`}>
          ← Back to {craft.status === 'inspiration' ? 'Inspo' : 'My Work'}
        </Link>
      </div>

      <section className="mt-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-4xl font-black tracking-tight text-ghibli-deep">
            {craft.title}
          </h1>

          {craft.status !== 'inspiration' ? (
            <CircularProgress value={progress} onChange={setProgress}/>
          ) : null}

          <button
            className="ml-auto flex items-center gap-2 rounded-full bg-ghibli-deep px-5 py-2 font-bold text-white hover:bg-ghibli-forest"
            type="button"
            onClick={() => setEditingCraft(true)}
          >
            <Pencil size={16} />
            {craft.status === 'inspiration' ? 'Edit Inspo' : 'Edit Craft'}
          </button>

          <button
            className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 font-semibold text-red-700 hover:bg-red-50"
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={16} />
            {craft.status === 'inspiration' ? 'Delete Inspo' : 'Delete Craft'}
          </button>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-stone-700">
          {renderDescription(craft.description)}
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-ghibli-deep">Photos</h2>

        {currentPhotos.length > 0 ? (
          <div>
            <div className="relative overflow-hidden rounded-3xl bg-ghibli-soft p-6">
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-2xl font-black text-ghibli-deep shadow hover:bg-white"
                    type="button"
                    onClick={goToPreviousPhoto}
                    aria-label="Previous photo"
                  >
                    ←
                  </button>

                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-2xl font-black text-ghibli-deep shadow hover:bg-white"
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

      {craft.status !== 'inspiration' && sources.length > 0 ? (
        <section className="mt-8 h-150 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-ghibli-deep">Inspiration Sources</h2>

          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {sources
                .slice(inspirationSlideIndex, inspirationSlideIndex + 2)
                .map((source) => {
                  if (source.type === 'external') {
                    return (
                      <button
                        key={source.id}
                        className="flex flex-col items-center overflow-hidden rounded-2xl hover:opacity-80 transition"
                        type="button"
                        onClick={() => window.open(source.url, '_blank')}
                      >
                        <div className="w-full h-100 bg-stone-100 rounded-2xl flex items-center justify-center overflow-hidden mb-2">
                          {source.imageUrl ? (
                            <img
                              src={source.imageUrl}
                              alt={'Image preview of external source link'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <p className="text-stone-500 text-sm">Image not available</p>
                          )}
                        </div>
                        <p className="text-center font-semibold text-ghibli-forest text-sm">External Link ({source.url.substring(8, 30)}...)</p>
                      </button>
                    );
                  }

                  const linkedCraft = crafts.find((currentCraft) => currentCraft.id === source.craftId);

                  return (
                    <button
                      key={source.id}
                      className="flex flex-col items-center overflow-hidden rounded-2xl hover:opacity-80 transition"
                      type="button"
                      onClick={() => {
                        if (linkedCraft) {
                          window.open(`/crafts/${linkedCraft.id}`);
                        }
                      }}
                    >
                      <div className="w-full h-100 bg-stone-100 rounded-2xl flex items-center justify-center overflow-hidden mb-2">
                        <img
                          src={linkedCraft?.photos[0]?.url}
                          alt={linkedCraft?.photos[0]?.alt || linkedCraft?.title || 'Image could not be loaded'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-center font-semibold text-ghibli-forest text-sm">
                        {linkedCraft?.title || 'Inspo (deleted)'}
                      </p>
                    </button>
                  );
                })}
            </div>

            {sources.length > 2 && (
              <div className="mt-4 flex justify-center gap-3">
                <button
                  className="rounded-full bg-ghibli-deep px-4 py-2 font-semibold text-white hover:bg-ghibli-forest disabled:opacity-50"
                  type="button"
                  onClick={() =>
                    setInspirationSlideIndex(
                      inspirationSlideIndex === 0
                        ? Math.max(0, sources.length - 2)
                        : inspirationSlideIndex - 2
                    )
                  }
                  disabled={inspirationSlideIndex === 0}
                >
                  ← Previous
                </button>
                <button
                  className="rounded-full bg-ghibli-deep px-4 py-2 font-semibold text-white hover:bg-ghibli-forest disabled:opacity-50"
                  type="button"
                  onClick={() =>
                    setInspirationSlideIndex(
                      inspirationSlideIndex + 2 >= sources.length
                        ? 0
                        : inspirationSlideIndex + 2
                    )
                  }
                  disabled={inspirationSlideIndex + 2 >= sources.length}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </section>
      ) : null}


      {craft.status === 'inspiration' && craft.sourceUrl ? (
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-ghibli-deep">
            Original Inspo Source
          </h2>

          <a
            href={craft.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center rounded-2xl bg-ghibli-light px-4 py-3 font-semibold text-ghibli-forest hover:underline"
          >
            Open → {craft.sourceUrl}
          </a>
        </section>
      ) : null}
      

      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.45fr]">
        {craft.status !== 'inspiration' ? (
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-ghibli-deep">Materials</h2>

            {craft.materials.length > 0 ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {craft.materials.map((material) => (
                  <li
                    className="rounded-2xl bg-ghibli-light px-4 py-3 text-stone-700"
                    key={material}
                  >
                    {material}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-stone-600">No materials added yet.</p>
            )}
          </section>
        ) : null}

        

        <aside className="grid gap-4">
          <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-ghibli-deep">Share</h2>

            {friends.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-stone-700">Share with friends</p>
                <ul className="space-y-2">
                  {friends.map((friend) => {
                    const isShared = craft.sharedWith?.includes(friend.toEmail) ?? false;
                    return (
                      <li key={friend.id} className="flex items-center justify-between">
                        <span className="truncate text-sm text-stone-700">{friend.toEmail}</span>
                        <button
                          className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-bold transition ${isShared ? 'bg-ghibli-forest text-white hover:bg-ghibli-deep' : 'border border-stone-300 text-stone-700 hover:bg-ghibli-light'}`}
                          type="button"
                          onClick={async () => {
                            const current = craft.sharedWith ?? [];
                            const next = isShared
                              ? current.filter((e) => e !== friend.toEmail)
                              : [...current, friend.toEmail];
                            await updateSharedWith(craft.id, next);
                            if (!isShared) {
                              const fromName = user?.displayName ?? user?.email ?? 'Someone';
                              const fromEmail = user?.email ?? '';
                              const craftUrl = `${window.location.origin}/public/${craft.id}`;
                              await sendCraftShareEmail(fromName, fromEmail, friend.toEmail, craft.title, craftUrl);
                            }
                          }}
                        >
                          {isShared ? 'Shared ✓' : 'Share'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-stone-700">Public link</p>
                <p className="text-xs text-stone-500">Anyone with the link can view</p>
              </div>
              <button
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${craft.isPublic ? 'bg-ghibli-forest' : 'bg-stone-300'}`}
                type="button"
                role="switch"
                aria-checked={craft.isPublic}
                aria-label={craft.isPublic ? 'Disable public link' : 'Enable public link'}
                onClick={() => void togglePublic()}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${craft.isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {craft.isPublic ? (
              <button
                className="mt-3 flex w-full items-center justify-between gap-2 rounded-2xl bg-ghibli-light px-4 py-3 text-sm text-stone-700 hover:bg-ghibli-soft"
                type="button"
                onClick={() => void copyLink()}
              >
                <span className="truncate font-mono text-xs">{window.location.origin}/public/{craft.id}</span>
                <span className="shrink-0 font-semibold text-ghibli-forest">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            ) : null}

            <form className="mt-5" onSubmit={(e) => void handleShareWithEmail(e)}>
              <p className="mb-2 text-sm font-semibold text-stone-700">Share with someone</p>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-2xl border border-stone-200 px-3 py-2 text-sm focus:border-ghibli-sage focus:outline-none"
                  type="email"
                  placeholder="friend@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
                <button
                  className="shrink-0 rounded-full bg-ghibli-deep px-4 py-2 text-sm font-bold text-white hover:bg-ghibli-forest disabled:opacity-50"
                  type="submit"
                  disabled={sharing || !shareEmail.trim()}
                >
                  {sharing ? '...' : 'Send'}
                </button>
              </div>
              {shareError ? <p className="mt-2 text-xs text-red-600">{shareError}</p> : null}
            </form>

            {(craft.sharedWith ?? []).length > 0 ? (
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-stone-700">People with access</p>
                <ul className="space-y-2">
                  {(craft.sharedWith ?? []).map((email) => (
                    <li key={email} className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm text-stone-700">{email}</span>
                      <button
                        className="shrink-0 rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-600 hover:border-red-300 hover:text-red-600"
                        type="button"
                        onClick={() => void revokeAccess(email)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          {craft.status === 'inspiration' ? (
            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-ghibli-deep">Tags</h2>

              {craft.tags?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {craft.tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => void handleRemoveTag(tag)}
                      className="rounded-full bg-ghibli-soft px-3 py-1 text-sm font-semibold text-ghibli-forest hover:bg-ghibli-light"
                    >
                      {tag} ×
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-600">No tags added yet.</p>
              )}

              <div className="mt-4 space-y-2">
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        void handleAddTag(tagInput);
                      }
                    }}
                    placeholder="Add a tag"
                    className="flex-1 rounded-2xl border border-stone-200 px-3 py-2 text-sm focus:border-ghibli-forest focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void handleAddTag(tagInput)}
                    className="shrink-0 rounded-full bg-ghibli-deep px-4 py-2 text-sm font-bold text-white hover:bg-ghibli-forest"
                  >
                    Add
                  </button>
                </div>

                {suggestedTags.length > 0 ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-stone-600">Existing Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => void handleAddTag(tag)}
                          className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </aside>
      </section>


      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black text-ghibli-deep">Delete this craft?</h2>
            <p className="mt-3 text-stone-600">
              Are you sure you want to delete "{craft.title}"? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-full border border-stone-300 px-4 py-2 font-semibold text-stone-700 hover:bg-ghibli-light"
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
                {craft.status === 'inspiration' ? (
                  <h2 className="text-3xl font-black tracking-tight text-ghibli-deep">Edit Inspo</h2>
                ) : (
                  <h2 className="text-3xl font-black tracking-tight text-ghibli-deep">Edit Craft</h2>
                )}
                <p className="mt-1 text-sm text-stone-500">Update the craft details, sources, materials, and photos.</p>
              </div>

              <button
                className="rounded-full bg-ghibli-deep px-4 py-2 text-sm font-bold text-white hover:bg-ghibli-forest"
                type="button"
                onClick={() => setEditingCraft(false)}
              >
                Close
              </button>
            </div>

            <CraftForm initialCraft={craft} submitLabel="Update craft" onSubmit={handleSubmit} inspirationMode={craft.status === 'inspiration'}/>
          </div>
        </div>
      ) : null}

      {selectedInspirationCraft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4 py-8">
          <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-black tracking-tight text-ghibli-deep">{selectedInspirationCraft.title}</h2>
                  <StatusBadge status={selectedInspirationCraft.status} />
                </div>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-stone-700">{selectedInspirationCraft.description}</p>
              </div>

              <button
                className="rounded-full bg-ghibli-deep px-4 py-2 text-sm font-bold text-white hover:bg-ghibli-forest"
                type="button"
                onClick={() => setSelectedInspirationCraft(null)}
              >
                Close
              </button>
            </div>

            {selectedInspirationSourceUrl ? (
              <a
                className="mt-5 inline-flex font-semibold text-ghibli-forest underline"
                href={selectedInspirationSourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open original source
              </a>
            ) : null}

            <section className="mt-6 rounded-2xl bg-ghibli-light p-4">
              <h3 className="font-bold text-ghibli-deep">Materials</h3>
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