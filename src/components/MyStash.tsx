import { useState } from 'react';
import type { StashEntry } from '../hooks/useStash';

const UNIT_OPTIONS = [
  'yards', 'meters', 'inches', 'cm', 'grams', 'oz',
  'skeins', 'balls', 'spools', 'sheets', 'pieces',
];

interface MyStashProps {
  stash: StashEntry[];
  onAdd: (entry: Omit<StashEntry, 'id'>) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Omit<StashEntry, 'id'>>) => void;
}

interface EditState {
  name: string;
  quantity: string;
  unit: string;
  customUnit: string;
}

const toEditState = (entry: StashEntry): EditState => ({
  name: entry.name,
  quantity: entry.quantity,
  unit: UNIT_OPTIONS.includes(entry.unit) ? entry.unit : entry.unit ? 'custom' : '',
  customUnit: UNIT_OPTIONS.includes(entry.unit) ? '' : entry.unit,
});

export const MyStash = ({ stash, onAdd, onRemove, onUpdate }: MyStashProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: '', quantity: '', unit: '', customUnit: '' });

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [customUnit, setCustomUnit] = useState('');

  const add = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    const effectiveUnit = unit === 'custom' ? customUnit.trim() : unit;
    onAdd({ name: trimmedName, quantity: quantity.trim(), unit: effectiveUnit });
    setName('');
    setQuantity('');
    setUnit('');
    setCustomUnit('');
  };

  const startEdit = (entry: StashEntry) => {
    setEditingId(entry.id);
    setEditState(toEditState(entry));
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (id: string) => {
    const effectiveUnit = editState.unit === 'custom' ? editState.customUnit.trim() : editState.unit;
    onUpdate(id, {
      name: editState.name.trim() || undefined,
      quantity: editState.quantity.trim(),
      unit: effectiveUnit,
    });
    setEditingId(null);
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      {stash.length > 0 ? (
        <ul className="mb-4 space-y-2">
          {stash.map((entry) =>
            editingId === entry.id ? (
              <li key={entry.id} className="flex flex-wrap items-center gap-2 rounded-2xl border border-ghibli-forest bg-stone-50 px-4 py-2">
                <input
                  className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-1 text-sm outline-none focus:border-ghibli-forest"
                  value={editState.name}
                  onChange={(e) => setEditState((s) => ({ ...s, name: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(entry.id); if (e.key === 'Escape') cancelEdit(); }}
                  placeholder="Material name"
                />
                <input
                  className="w-20 rounded-xl border border-stone-300 px-3 py-1 text-sm outline-none focus:border-ghibli-forest"
                  value={editState.quantity}
                  onChange={(e) => setEditState((s) => ({ ...s, quantity: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(entry.id); if (e.key === 'Escape') cancelEdit(); }}
                  placeholder="Qty"
                />
                <select
                  className="rounded-xl border border-stone-300 px-2 py-1 text-sm outline-none focus:border-ghibli-forest"
                  value={editState.unit}
                  onChange={(e) => setEditState((s) => ({ ...s, unit: e.target.value, customUnit: '' }))}
                >
                  <option value="">Unit</option>
                  {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                  <option value="custom">Custom...</option>
                </select>
                {editState.unit === 'custom' && (
                  <input
                    className="w-24 rounded-xl border border-stone-300 px-3 py-1 text-sm outline-none focus:border-ghibli-forest"
                    value={editState.customUnit}
                    onChange={(e) => setEditState((s) => ({ ...s, customUnit: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(entry.id); if (e.key === 'Escape') cancelEdit(); }}
                    placeholder="e.g. skeins"
                  />
                )}
                <button
                  type="button"
                  onClick={() => saveEdit(entry.id)}
                  className="rounded-xl bg-ghibli-forest px-3 py-1 text-xs font-bold text-white hover:opacity-90"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-xl border border-stone-300 px-3 py-1 text-xs text-stone-500 hover:bg-stone-100"
                >
                  Cancel
                </button>
              </li>
            ) : (
              <li key={entry.id} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm">
                <span className="flex-1 text-ghibli-deep">{entry.name}</span>
                {(entry.quantity || entry.unit) && (
                  <span className="text-stone-500">
                    {[entry.quantity, entry.unit].filter(Boolean).join(' ')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(entry)}
                  className="text-xs text-stone-400 hover:text-ghibli-forest"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(entry.id)}
                  className="text-stone-400 hover:text-red-600"
                >
                  ×
                </button>
              </li>
            )
          )}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-stone-400">No materials in your stash yet.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-0 flex-1 rounded-2xl border border-stone-300 px-4 py-2 text-sm outline-none focus:border-ghibli-forest"
          placeholder="Material name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <input
          className="w-20 rounded-2xl border border-stone-300 px-4 py-2 text-sm outline-none focus:border-ghibli-forest"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        />
        <select
          className="rounded-2xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-ghibli-forest"
          value={unit}
          onChange={(e) => { setUnit(e.target.value); setCustomUnit(''); }}
        >
          <option value="">Unit</option>
          {UNIT_OPTIONS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
          <option value="custom">Custom...</option>
        </select>
        {unit === 'custom' && (
          <input
            className="w-28 rounded-2xl border border-stone-300 px-4 py-2 text-sm outline-none focus:border-ghibli-forest"
            placeholder="e.g. skeins"
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          />
        )}
        <button
          type="button"
          onClick={add}
          className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 hover:border-ghibli-forest"
        >
          Add
        </button>
      </div>
    </div>
  );
};
