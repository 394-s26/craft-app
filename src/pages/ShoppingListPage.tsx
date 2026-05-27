import { ShoppingCart } from 'lucide-react';
import { useCrafts } from '../hooks/useCrafts';
import { ShoppingList } from '../components/ShoppingList';

export const ShoppingListPage = () => {
  const { crafts } = useCrafts();
  const myWorkCrafts = crafts.filter((craft) =>
    craft.status === 'work-in-progress' || craft.status === 'completed',
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-8">
        <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-ghibli-deep">
          <ShoppingCart size={30} />
          Shopping List
        </h1>
        <p className="mt-3 text-stone-600">Materials needed across all your projects.</p>
      </section>
      <ShoppingList crafts={myWorkCrafts} />
    </main>
  );
};
