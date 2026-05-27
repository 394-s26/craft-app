import { ShoppingCart } from 'lucide-react';
import { useCrafts } from '../hooks/useCrafts';
import { ShoppingList } from '../components/ShoppingList';

export const ShoppingListPage = () => {
  const { crafts } = useCrafts();
  const myWorkCrafts = crafts.filter((craft) =>
    craft.status === 'work-in-progress' || craft.status === 'completed',
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-2 flex items-center gap-3 text-3xl font-black text-ghibli-deep">
        <ShoppingCart size={28} />
        Shopping List
      </h1>
      <p className="mb-8 text-stone-500">Materials needed across all your projects.</p>
      <ShoppingList crafts={myWorkCrafts} />
    </main>
  );
};
