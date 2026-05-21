import { useState, useRef, useEffect, useCallback } from 'react';
import { ImageIcon, X, Loader2 } from 'lucide-react';

export interface NewInspiration {
  title?: string;
  content?: string;
  imageData?: string;       // base64 data URL
  imageFileName?: string;
}

interface QuickAddInspirationProps {
  onSave: (inspiration: NewInspiration) => Promise<void>;
}

function isEmptyInspiration(v: NewInspiration) {
  return !v.title?.trim() && !v.content?.trim() && !v.imageData;
}

export const QuickAddInspiration = ({ onSave }: QuickAddInspirationProps) => {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageData, setImageData] = useState<string | undefined>();
  const [imageFileName, setImageFileName] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-grow textarea
  const autoGrow = () => {
    const el = contentRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  const reset = () => {
    setTitle('');
    setContent('');
    setImageData(undefined);
    setImageFileName(undefined);
    setExpanded(false);
    setDragOver(false);
    if (contentRef.current) contentRef.current.style.height = 'auto';
  };

  const handleSave = useCallback(async () => {
    if (saving) return;
    const value: NewInspiration = { title, content, imageData, imageFileName };
    if (isEmptyInspiration(value)) {
      reset();
      return;
    }
    setSaving(true);
    try {
      await onSave(value);
    } finally {
      setSaving(false);
      reset();
    }
  }, [saving, title, content, imageData, imageFileName, onSave]);

  // ESC → save
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSave();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [expanded, handleSave]);

  // Click outside → save
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };
    // Slight delay so the click that opened it doesn't immediately close it
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [expanded, handleSave]);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageData(e.target?.result as string);
      setImageFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Paste: capture image from clipboard anywhere in the card
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) processImageFile(file);
    }
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processImageFile(file);
  };

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
            : 'border-stone-200 shadow-sm hover:shadow-md cursor-text'
          }
          ${dragOver ? 'border-blue-400 ring-2 ring-blue-200' : ''}
        `}
      >
        {/* Collapsed state */}
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

        {/* Expanded state */}
        {expanded && (
          <div className="flex flex-col">
            {/* Image preview */}
            {imageData && (
              <div className="relative">
                <img
                  src={imageData}
                  alt="Inspiration"
                  className="max-h-64 w-full rounded-t-2xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => { setImageData(undefined); setImageFileName(undefined); }}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Drag-over overlay */}
            {dragOver && !imageData && (
              <div className="flex h-28 items-center justify-center rounded-t-2xl border-2 border-dashed border-blue-300 bg-blue-50 text-sm text-blue-500">
                Drop image here
              </div>
            )}

            {/* Title */}
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              className="w-full rounded-t-2xl px-4 pt-4 pb-1 text-sm font-semibold text-stone-800 placeholder-stone-300 outline-none"
            />

            {/* Content */}
            <textarea
              ref={contentRef}
              placeholder="Add a note…"
              value={content}
              onChange={(e) => { setContent(e.target.value); autoGrow(); }}
              rows={2}
              className="w-full resize-none px-4 py-2 text-sm text-stone-700 placeholder-stone-300 outline-none"
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between border-t border-stone-100 px-3 py-2">
              <div className="flex items-center gap-1">
                {/* Image upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Add image"
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
                >
                  <ImageIcon size={15} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) processImageFile(file);
                    e.target.value = '';
                  }}
                />
                <span className="ml-1 text-xs text-stone-300">
                  or paste / drop an image
                </span>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors disabled:opacity-50"
              >
                {saving
                  ? <Loader2 size={13} className="animate-spin" />
                  : null
                }
                {saving ? 'Saving…' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hint */}
      {!expanded && (
        <p className="mt-2 text-center text-xs text-stone-400">
          Press <kbd className="rounded border border-stone-200 bg-stone-100 px-1 py-0.5 font-mono text-[10px]">Esc</kbd> or click outside to save
        </p>
      )}
    </div>
  );
};