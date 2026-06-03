import { useState } from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { useCrafts } from '../hooks/useCrafts';
import { useStash } from '../hooks/useStash';
import { ShoppingList } from '../components/ShoppingList';
import { MyStash } from '../components/MyStash';

type Tab = 'stash' | 'list';

export const ShoppingListPage = () => {
  const { crafts } = useCrafts();
  const { stash, addEntry, removeEntry, updateEntry } = useStash();
  const [tab, setTab] = useState<Tab>('list');

  const myWorkCrafts = crafts.filter(
    (craft) => craft.status === 'work-in-progress' || craft.status === 'completed',
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <section className="mb-6">
        <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-ghibli-deep">
          <ShoppingCart size={30} />
          Shopping List
        </h1>
      </section>

      <div className="mb-6 flex gap-2 border-b border-stone-200">
        <button
          onClick={() => setTab('list')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
            tab === 'list'
              ? 'border-b-2 border-ghibli-deep text-ghibli-deep'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <ShoppingCart size={15} />
          Shopping List
        </button>
        <button
          onClick={() => setTab('stash')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
            tab === 'stash'
              ? 'border-b-2 border-ghibli-deep text-ghibli-deep'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Package size={15} />
          My Stash
        </button>
      </div>

      {tab === 'list' ? (
        <ShoppingList crafts={myWorkCrafts} stash={stash} />
      ) : (
        <MyStash stash={stash} onAdd={addEntry} onRemove={removeEntry} onUpdate={updateEntry} />
      )}
    </main>
  );
};
