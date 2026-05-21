import { useState, useRef, useEffect, useCallback } from 'react';
import { ImageIcon, X, Loader2, Link } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { uploadCraftPhoto } from '../services/storageService';
import type { CraftInput, CraftPhoto } from '../types/Craft';

interface InspoFormProps {
  onSave: (input: CraftInput) => Promise<void>;
}

function isEmpty(title: string, notes: string, photos: CraftPhoto[], sourceUrl: string) {
  return !title.trim() && !notes.trim() && photos.length === 0 && !sourceUrl.trim();
}

export const InspoForm = ({ onSave }: InspoFormProps) => {
  const { user } = useAuth();

  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [photos, setPhotos] = useState<CraftPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const autoGrow = () => {
    const el = notesRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const reset = useCallback(() => {
    setTitle('');
    setNotes('');
    setSourceUrl('');
    setPhotos([]);
    setExpanded(false);
    setDragOver(false);
    setError(null);
    if (notesRef.current) notesRef.current.style.height = 'auto';
  }, []);

  const handleSave = useCallback(async () => {
    if (saving || uploading) return;
    if (isEmpty(title, notes, photos, sourceUrl)) {
      reset();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const trimmedSourceUrl = sourceUrl.trim();
      await onSave({
        title: title.trim() || 'Untitled inspiration',
        description: notes.trim(),
        materials: [],
        photos,
        status: 'inspiration',
        ...(trimmedSourceUrl ? { sourceUrl: trimmedSourceUrl } : {}),
        isPublic: false,
      });
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }, [saving, uploading, title, notes, photos, sourceUrl, onSave, reset]);

  // ESC → save & close
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSave();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [expanded, handleSave]);

  // Click outside → save & close
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [expanded, handleSave]);

  // ── File handling ────────────────────────────────────────────────────────────

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/') || !user) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadCraftPhoto(file, user.uid);
      setPhotos((prev) => [...prev, { id: crypto.randomUUID(), url, alt: file.name }]);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Photo upload failed — try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = '';
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) await uploadFile(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await uploadFile(file);
  };

  const removePhoto = (id: string) =>
    setPhotos((prev) => prev.filter((p) => p.id !== id));

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="mb-8">
      <div
        ref={containerRef}
        onPaste={handlePaste}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative mx-auto max-w-xl rounded-2xl border bg-white transition-all duration-200
          ${expanded
            ? 'border-stone-200 shadow-[0_4px_24px_rgba(0,0,0,0.10)]'
            : 'cursor-text border-stone-200 shadow-sm hover:shadow-md'
          }
          ${dragOver ? 'border-blue-400 ring-2 ring-blue-200' : ''}
        `}
      >
        {/* ── Collapsed ── */}
        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
          >
            <span className="text-sm text-stone-400 select-none">
              Capture an inspiration…
            </span>
            <ImageIcon size={15} className="ml-auto shrink-0 text-stone-300" />
          </button>
        )}

        {/* ── Expanded ── */}
        {expanded && (
          <div className="flex flex-col">
            {/* Photo strip */}
            {photos.length > 0 && (
              <div className={`grid gap-1 rounded-t-2xl overflow-hidden ${photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {photos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="max-h-52 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop overlay (no photos yet) */}
            {dragOver && photos.length === 0 && (
              <div className="flex h-24 items-center justify-center rounded-t-2xl border-b border-dashed border-blue-300 bg-blue-50 text-sm text-blue-500">
                Drop image here
              </div>
            )}

            {/* Uploading indicator */}
            {uploading && (
              <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-2 text-xs text-amber-700">
                <Loader2 size={12} className="animate-spin" />
                Uploading photo…
              </div>
            )}

            {/* Title */}
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full rounded-t-2xl px-4 pb-1 pt-4 text-sm font-semibold text-stone-800 placeholder-stone-300 outline-none"
            />

            {/* Notes */}
            <textarea
              ref={notesRef}
              placeholder="Add a note…"
              value={notes}
              onChange={(e) => { setNotes(e.target.value); autoGrow(); }}
              rows={2}
              className="w-full resize-none px-4 py-2 text-sm text-stone-700 placeholder-stone-300 outline-none"
            />

            {/* Source URL (optional) */}
            <div className="flex items-center gap-2 border-t border-stone-100 px-4 py-2">
              <Link size={13} className="shrink-0 text-stone-300" />
              <input
                type="url"
                placeholder="Source link (Pinterest, Instagram, Etsy…)"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full text-sm text-stone-600 placeholder-stone-300 outline-none"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="mx-4 mb-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600">
                {error}
              </p>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between border-t border-stone-100 px-3 py-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || !user}
                  title="Add image"
                  className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 disabled:opacity-40"
                >
                  <ImageIcon size={15} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInput}
                />
                <span className="ml-1 text-xs text-stone-300">or paste / drop</span>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-50"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : null}
                {saving ? 'Saving…' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>

      {!expanded && (
        <p className="mt-2 text-center text-xs text-stone-400">
          Press{' '}
          <kbd className="rounded border border-stone-200 bg-stone-100 px-1 py-0.5 font-mono text-[10px]">
            Esc
          </kbd>{' '}
          or click outside to save
        </p>
      )}
    </div>
  );
};