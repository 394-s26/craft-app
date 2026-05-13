import { useState } from 'react';
import type { Craft } from '../types/Craft';

interface ShoppingListProps {
  crafts: Craft[];
}

export const ShoppingList = ({ crafts }: ShoppingListProps) => {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const craftsWithMaterials = crafts.filter((craft) => craft.materials.length > 0);

  if (craftsWithMaterials.length === 0) {
    return <p className="text-stone-500">No materials listed across your projects yet.</p>;
  }

  return (
    <div className="space-y-6">
      {craftsWithMaterials.map((craft) => (
        <div key={craft.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-bold text-stone-900">{craft.title}</h3>
          <ul className="space-y-2">
            {craft.materials.map((material) => {
              const key = `${craft.id}:${material}`;
              const isChecked = checked.has(key);
              return (
                <li key={key}>
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(key)}
                      className="h-4 w-4 accent-amber-700"
                    />
                    <span className={isChecked ? 'text-stone-400 line-through' : 'text-stone-800'}>
                      {material}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};
