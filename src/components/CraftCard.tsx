import { Link } from 'react-router-dom';
import type { Craft } from '../types/Craft';
import { StatusBadge } from './StatusBadge';

interface CraftCardProps {
  craft: Craft;
}

export const CraftCard = ({ craft }: CraftCardProps) => {
  const coverPhoto = craft.photos[0];

  return (
    <Link className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg" to={`/crafts/${craft.id}`}>
      <div className="h-56 bg-stone-200">
        {coverPhoto ? <img className="h-full w-full object-cover" src={coverPhoto.url} alt={coverPhoto.alt} /> : <div className="flex h-full items-center justify-center text-stone-500">No photo yet</div>}
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-stone-950 group-hover:text-amber-800">{craft.title}</h2>
          <StatusBadge status={craft.status} />
        </div>
        <p className="line-clamp-3 text-sm leading-6 text-stone-600">{craft.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-700">{craft.materials.length} material{craft.materials.length === 1 ? '' : 's'}</p>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${craft.isPublic ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
            {craft.isPublic ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
    </Link>
  );
};
