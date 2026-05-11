import { useState, type FormEvent } from 'react';
import type { Craft, CraftInput, CraftPhoto, CraftStatus } from '../types/Craft';
import { useAuth } from '../hooks/useAuth';
import { uploadCraftPhoto } from '../services/storageService';

interface CraftFormProps {
  initialCraft?: Craft;
  submitLabel: string;
  onSubmit: (input: CraftInput) => Promise<void>;
}

const statusOptions: { label: string; value: CraftStatus }[] = [
  { label: 'Inspiration', value: 'inspiration' },
  { label: 'Work in Progress', value: 'work-in-progress' },
  { label: 'Completed', value: 'completed' },
];

export const CraftForm = ({ initialCraft, submitLabel, onSubmit }: CraftFormProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState(initialCraft?.title ?? '');
  const [description, setDescription] = useState(initialCraft?.description ?? '');
  const [materialsText, setMaterialsText] = useState(initialCraft?.materials.join('\n') ?? '');
  const [sourceUrl, setSourceUrl] = useState(initialCraft?.sourceUrl ?? '');
  const [status, setStatus] = useState<CraftStatus>(initialCraft?.status ?? 'work-in-progress');
  const [photos, setPhotos] = useState<CraftPhoto[]>(initialCraft?.photos ?? []);
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        } catch {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        materials: materialsText
          .split('\n')
          .map((material) => material.trim())
          .filter(Boolean),
        photos,
        status,
        sourceUrl: sourceUrl.trim() || "",
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
        <textarea className="mt-2 min-h-36 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What are you making? What look are you going for?" />
      </label>

      <label className="block">
        <span className="text-sm font-bold text-stone-700">Materials list</span>
        <textarea className="mt-2 min-h-28 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700" value={materialsText} onChange={(event) => setMaterialsText(event.target.value)} placeholder="One material per line" />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
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
        <label className="block">
          <span className="text-sm font-bold text-stone-700">Inspiration source URL</span>
          <input className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-amber-700" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="Instagram, Etsy, blog, Pinterest..." />
        </label>
      </div>

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

      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button className="w-full rounded-full bg-stone-900 px-5 py-3 font-bold text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400" type="submit" disabled={saving || uploading}>
        {saving ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};
