import { Link } from 'react-router-dom';
import type { Craft } from '../types/Craft';
import { CircularProgress } from '../components/ProgressCircle';
import { useState } from 'react';
import { useCrafts } from '../hooks/useCrafts';

interface CraftCardProps {
  craft: Craft;
}

export const CraftCard = ({ craft }: CraftCardProps) => {
  const coverPhoto = craft.photos[0];
  const { removeCraft } = useCrafts();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Prevent navigation when clicking trash
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const confirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    setDeleting(true);
    await removeCraft(craft.id);
    setDeleting(false);
    setShowConfirm(false);
  };

  return (
    <div className="relative group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {craft.status === 'inspiration' && (
        <button
          className="absolute top-3 right-3 z-20 rounded-full bg-red-100 p-2 text-red-700 hover:bg-red-200 shadow"
          title="Delete inspiration"
          onClick={handleDelete}
        >
          {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg> */}
          <img
            src="/trash-can.svg"
            alt="Delete"
            className="h-5 w-5"
          />
        </button>
      )}
      <Link className="block" to={`/crafts/${craft.id}`} tabIndex={-1}>
        {coverPhoto || craft.status !== 'inspiration' ? (
          <div className="h-56 bg-ghibli-soft">
            {coverPhoto ? (
              <img
                className="h-full w-full object-cover"
                src={coverPhoto.url}
                alt={coverPhoto.alt}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-stone-500">
                No photo yet
              </div>
            )}
          </div>
        ) : null}
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-ghibli-deep group-hover:text-ghibli-forest">{craft.title}</h2>
            {craft.status !== 'inspiration' ? (
              <CircularProgress value={craft.progress} onChange={() =>{}} size={50} strokeWidth={4}/>
            ) : null}
          </div>
          <p className="line-clamp-3 text-sm leading-6 text-stone-600">{craft.description}</p>
          <div className="flex items-center justify-between">
            {craft.status !== 'inspiration' ? (
              <p className="text-sm font-semibold text-stone-700">{craft.materials.length} material{craft.materials.length === 1 ? '' : 's'}</p>
            ) : null}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${craft.isPublic ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
              {craft.isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
      </Link>
      {showConfirm && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl bg-white p-6 shadow-xl flex flex-col items-center">
            <p className="mb-4 text-stone-900 font-semibold">Delete this inspiration?</p>
            <div className="flex gap-3">
              <button
                className="rounded-full border border-stone-300 px-4 py-2 font-semibold text-stone-700 hover:bg-stone-100"
                onClick={e => { e.preventDefault(); setShowConfirm(false); }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-800"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
