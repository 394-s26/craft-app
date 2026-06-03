import { useState } from 'react';
import type { Craft } from '../types/Craft';
import type { StashEntry } from '../hooks/useStash';

interface ShoppingListProps {
  crafts: Craft[];
  stash: StashEntry[];
}

interface ParsedMaterial {
  name: string;
  normalized: string;
  quantity: string;
  unit: string;
}

interface MaterialGroup {
  normalized: string;
  displayName: string;
  crafts: { craftId: string; craftTitle: string; quantity: string; unit: string }[];
  stashEntry: StashEntry | undefined;
}

const parseMaterial = (s: string): ParsedMaterial => {
  const match = s.match(/^(.+)\s+\((.+)\)$/);
  const name = match ? match[1].trim() : s.trim();
  const rest = match ? match[2].trim() : '';
  const parts = rest.split(/\s+/);
  const quantity = parts[0] || '';
  const unit = parts.slice(1).join(' ');
  return { name, normalized: name.toLowerCase(), quantity, unit };
};

const isSatisfied = (group: MaterialGroup): boolean => {
  if (!group.stashEntry) return false;

  const stashQtyRaw = group.stashEntry.quantity.trim();
  if (!stashQtyRaw) return true; // presence in stash with no qty = "I have it"

  const stashQty = parseFloat(stashQtyRaw);
  if (isNaN(stashQty)) return true;

  // Sum total needed across all crafts, ignoring units, defaulting to 1 per craft
  const totalNeeded = group.crafts.reduce((sum, c) => {
    const qty = parseFloat(c.quantity);
    return sum + (isNaN(qty) ? 1 : qty);
  }, 0);

  return stashQty >= totalNeeded;
};

export const ShoppingList = ({ crafts, stash }: ShoppingListProps) => {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Build material groups across all crafts, case-insensitively
  const groupMap = new Map<string, MaterialGroup>();

  for (const craft of crafts) {
    for (const raw of craft.materials) {
      const parsed = parseMaterial(raw);
      if (!groupMap.has(parsed.normalized)) {
        groupMap.set(parsed.normalized, {
          normalized: parsed.normalized,
          displayName: parsed.name,
          crafts: [],
          stashEntry: stash.find(
            (s) => s.name.toLowerCase().trim() === parsed.normalized,
          ),
        });
      }
      groupMap.get(parsed.normalized)!.crafts.push({
        craftId: craft.id,
        craftTitle: craft.title,
        quantity: parsed.quantity,
        unit: parsed.unit,
      });
    }
  }

  if (groupMap.size === 0) {
    return <p className="text-stone-500">No materials listed across your projects yet.</p>;
  }

  const groups = [...groupMap.values()];

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <ul className="divide-y divide-stone-100">
        {groups.map((group) => {
          const autoSatisfied = isSatisfied(group);
          const isChecked = checked.has(group.normalized);
          const satisfied = isChecked || autoSatisfied;
          const stashDisplay = group.stashEntry
            ? [group.stashEntry.quantity, group.stashEntry.unit].filter(Boolean).join(' ') || 'in stash'
            : 'none';

          return (
            <li key={group.normalized} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
              <input
                type="checkbox"
                checked={satisfied}
                onChange={() => toggle(group.normalized)}
                className="mt-0.5 h-4 w-4 accent-ghibli-forest"
              />
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-bold ${satisfied ? 'text-stone-400 line-through' : 'text-ghibli-deep'}`}>
                  {group.displayName}
                </span>
                <div className="mt-1 space-y-0.5">
                  {group.crafts.map((c) => (
                    <p key={c.craftId} className="text-xs text-stone-500">
                      <span className="font-medium text-stone-600">{c.craftTitle}:</span>{' '}
                      needs {c.quantity || '1'}{c.unit ? ` ${c.unit}` : ''}
                    </p>
                  ))}
                </div>
                <p className="mt-1.5 text-xs">
                  <span className="text-stone-400">Have: </span>
                  <span className={`font-semibold ${satisfied ? 'text-ghibli-forest' : 'text-stone-600'}`}>
                    {stashDisplay}
                  </span>
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
