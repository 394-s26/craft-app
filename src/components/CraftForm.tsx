import { useState, type FormEvent } from 'react';
import type { Craft, CraftInput, CraftPhoto, CraftSource, CraftStatus } from '../types/Craft';
import { useAuth } from '../hooks/useAuth';
import { useCrafts } from '../hooks/useCrafts';
import { uploadCraftPhoto } from '../services/storageService';

interface CraftFormProps {
  initialCraft?: Craft;
  submitLabel: string;
  onSubmit: (input: CraftInput) => Promise<void>;
}

interface MaterialEntry {
  id: string;
  name: string;
  quantity: string;
}

const parseMaterial = (s: string): MaterialEntry => {
  const match = s.match(/^(.+)\s+\((.+)\)$/);
  return match
    ? { id: crypto.randomUUID(), name: match[1], quantity: match[2] }
    : { id: crypto.randomUUID(), name: s, quantity: '' };
};

const serializeMaterial = (m: MaterialEntry): string =>
  m.quantity.trim() ? `${m.name.trim()} (${m.quantity.trim()})` : m.name.trim();

const statusOptions: { label: string; value: CraftStatus }[] = [
  { label: 'Inspiration', value: 'inspiration' },
  { label: 'Work in Progress', value: 'work-in-progress' },
  { label: 'Completed', value: 'completed' },
];

export const CraftForm = ({ initialCraft, submitLabel, onSubmit }: CraftFormProps) => {
  const { user } = useAuth();
  const { crafts } = useCrafts();

  const [title, setTitle] = useState(initialCraft?.title ?? '');
  const [description, setDescription] = useState(initialCraft?.description ?? '');
  const [materials, setMaterials] = useState<MaterialEntry[]>(
    (initialCraft?.materials ?? []).map(parseMaterial),
  );
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialQuantity, setNewMaterialQuantity] = useState('');
  const [isPublic, setIsPublic] = useState(initialCraft?.isPublic ?? false);

  const addMaterial = () => {
    const trimmedName = newMaterialName.trim();
    if (!trimmedName) return;
    setMaterials((prev) => [...prev, { id: crypto.randomUUID(), name: trimmedName, quantity: newMaterialQuantity.trim() }]);
    setNewMaterialName('');
    setNewMaterialQuantity('');
  };

  const removeMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };
  const [sources, setSources] = useState<CraftSource[]>(
    initialCraft?.sources?.length
      ? initialCraft.sources
      : initialCraft?.sourceUrl
        ? [{ id: crypto.randomUUID(), type: 'external', url: initialCraft.sourceUrl }]
        : [],
  );
  const [status, setStatus] = useState<CraftStatus>(initialCraft?.status ?? 'work-in-progress');
  const [photos, setPhotos] = useState<CraftPhoto[]>(initialCraft?.photos ?? []);
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const inspirationCrafts = crafts.filter(
    (craft) => craft.status === 'inspiration' && craft.id !== initialCraft?.id,
  );

  const addSource = () => {
    setSources((currentSources) => [
      ...currentSources,
      { id: crypto.randomUUID(), type: 'external', url: '' },
    ]);
  };

  const updateSource = (sourceId: string, nextSource: CraftSource) => {
    setSources((currentSources) =>
      currentSources.map((source) => (source.id === sourceId ? nextSource : source)),
    );
  };

  const removeSource = (sourceId: string) => {
    setSources((currentSources) => currentSources.filter((source) => source.id !== sourceId));
  };

  const addPhotoUrl = () => {
    const trimmedUrl = photoUrl.trim();
    if (!trimmedUrl) {
      return;
    }

    setPhotos((currentPhotos) => [
      ...currentPhotos,
      { id: crypto.randomUUID(), url: trimmedUrl, alt: `${title || 'Craft'} photo` },
    ]);
    setPhotoUrl('');
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || !user) return;

    const fileArray = Array.from(files);
    setUploading(true);
    setError(null);

    const newPhotos: CraftPhoto[] = [];
    const failed: string[] = [];

    await Promise.all(
      fileArray.map(async (file) => {
        try {
          const url = await uploadCraftPhoto(file, user.uid);
          newPhotos.push({ id: crypto.randomUUID(), url, alt: file.name });
        } catch (err) {
          console.error('Photo upload failed:', err);
          failed.push(file.name);
        }
      }),
    );

    setPhotos((prev) => [...prev, ...newPhotos]);
    setUploading(false);

    if (failed.length > 0) {
      setError(`Failed to upload: ${failed.join(', ')}`);
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos((currentPhotos) => currentPhotos.filter((photo) => photo.id !== photoId));
  };

  const cleanSources = (): CraftSource[] =>
    sources
      .map((source) => {
        if (source.type === 'external') {
          const trimmedUrl = source.url.trim();
          const trimmedLabel = source.label?.trim();

          return {
            id: source.id,
            type: 'external' as const,
            url: trimmedUrl,
            ...(trimmedLabel ? { label: trimmedLabel } : {}),
          };
        }

        return {
          id: source.id,
          type: 'craft' as const,
          craftId: source.craftId,
        };
      })
      .filter((source) => {
        if (source.type === 'external') return Boolean(source.url);
        return Boolean(source.craftId);
      });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);


    if (!title.trim()) {
      setError('Please add a title.');
      return;
    }

    const nextSources = cleanSources();
    const firstExternalSource = nextSources.find((source) => source.type === 'external');

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        materials: materials.map(serializeMaterial),
        isPublic,
        photos,
        status,
        sources: nextSources,
        sourceUrl: firstExternalSource?.url ?? '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save craft.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-sm font-bold text-stone-700">Craft title</span>
        <input className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Linen summer dress" />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-stone-700">Description / vision</span>
        <textarea className="mt-2 min-h-16 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700" value={description} 
        onChange={(event) => setDescription(event.target.value)} placeholder="What are you making? What look are you going for?" />
      </label>

      <div className="block">
        <span className="text-sm font-bold text-stone-700">Materials</span>
        {materials.length > 0 && (
          <ul className="mt-2 space-y-2">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm">
                <span className="flex-1 text-stone-800">{m.name}</span>
                {m.quantity && <span className="text-stone-500">{m.quantity}</span>}
                <button type="button" onClick={() => removeMaterial(m.id)} className="text-stone-400 hover:text-red-600">×</button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-2xl border border-stone-300 px-4 py-2 text-sm outline-none focus:border-amber-700"
            placeholder="Material name"
            value={newMaterialName}
            onChange={(e) => setNewMaterialName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } }}
          />
          <input
            className="w-32 rounded-2xl border border-stone-300 px-4 py-2 text-sm outline-none focus:border-amber-700"
            placeholder="Quantity"
            value={newMaterialQuantity}
            onChange={(e) => setNewMaterialQuantity(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMaterial(); } }}
          />
          <button
            type="button"
            onClick={addMaterial}
            className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 hover:border-amber-700"
          >
            Add
          </button>
        </div>
      </div>

      <label className="block">
        <span className="text-sm font-bold text-stone-700">Folder</span>
        <select className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700" value={status} onChange={(event) => setStatus(event.target.value as CraftStatus)}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <section className="rounded-2xl bg-amber-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-stone-900">Inspiration sources</h3>
            <p className="text-sm text-stone-600">Add an external link or connect an existing inspiration craft.</p>
          </div>
          <button className="rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white hover:bg-stone-700" type="button" onClick={addSource}>
            + Add
          </button>
        </div>

        {sources.length > 0 ? (
          <div className="mt-4 space-y-3">
            {sources.map((source) => (
              <div className="grid gap-3 rounded-2xl bg-white p-3 md:grid-cols-[160px_1fr_auto]" key={source.id}>
                <select
                  className="rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700"
                  value={source.type}
                  onChange={(event) => {
                    const nextType = event.target.value as CraftSource['type'];

                    updateSource(
                      source.id,
                      nextType === 'external'
                        ? { id: source.id, type: 'external', url: '' }
                        : { id: source.id, type: 'craft', craftId: '' },
                    );
                  }}
                >
                  <option value="external">External link</option>
                  <option value="craft">Existing craft</option>
                </select>

                {source.type === 'external' ? (
                  <input
                    className="rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700"
                    value={source.url}
                    onChange={(event) => updateSource(source.id, { ...source, url: event.target.value })}
                    placeholder="Instagram, Etsy, blog, Pinterest..."
                  />
                ) : (
                  <select
                    className="rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700"
                    value={source.craftId}
                    onChange={(event) => updateSource(source.id, { ...source, craftId: event.target.value })}
                  >
                    <option value="">Choose an inspiration craft</option>
                    {inspirationCrafts.map((craft) => (
                      <option key={craft.id} value={craft.id}>
                        {craft.title}
                      </option>
                    ))}
                  </select>
                )}

                <button className="rounded-2xl border border-red-200 px-4 py-3 font-semibold text-red-700 hover:bg-red-50" type="button" onClick={() => removeSource(source.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-stone-600">No inspiration sources added yet.</p>
        )}
      </section>

      <section className="rounded-2xl bg-amber-50 p-4">
        <h3 className="font-bold text-stone-900">Photos</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto]">
          <input className="rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-amber-700" value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} placeholder="Paste image URL" />
          <button className="rounded-2xl border border-stone-300 bg-white px-5 py-3 font-semibold text-stone-800 hover:bg-stone-100" type="button" onClick={addPhotoUrl}>
            Add URL
          </button>
        </div>
        <label className="mt-3 block">
          <span className="sr-only">Upload photos</span>
          <input className="block w-full text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:font-semibold file:text-white disabled:opacity-50" type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => void handleFileChange(event.target.files)} />
        </label>
        {uploading ? <p className="mt-2 text-sm text-amber-700">Uploading photos...</p> : null}
        {photos.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <img className="h-32 w-full object-cover" src={photo.url} alt={photo.alt} />
                <button className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-stone-900" type="button" onClick={() => removePhoto(photo.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="flex items-center justify-between rounded-2xl border border-stone-200 px-4 py-3">
        <div>
          <span className="text-sm font-bold text-stone-700">Visibility: {isPublic ? 'Public' : 'Private'}</span>
          <p className="text-xs text-stone-500">{isPublic ? 'Anyone can view this craft' : 'Only you can see this craft'}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsPublic((prev) => !prev)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPublic ? 'bg-amber-700' : 'bg-stone-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button className="w-full rounded-full bg-stone-900 px-5 py-3 font-bold text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400" type="submit" disabled={saving || uploading}>
        {saving ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};