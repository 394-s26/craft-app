import { Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CraftForm } from '../components/CraftForm';
import { useCrafts } from '../hooks/useCrafts';
import type { CraftInput } from '../types/Craft';

export const NewCraftPage = () => {
  const navigate = useNavigate();
  const { addCraft } = useCrafts();

  const handleSubmit = async (input: CraftInput) => {
    await addCraft(input);
    navigate(`/${input.status}`);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-ghibli-deep">
        <Pencil size={30} />
        Create a craft
      </h1>
      <p className="mt-3 text-stone-600">Add inspiration, a work in progress, or a completed project.</p>
      <div className="mt-8">
        <CraftForm submitLabel="Save craft" onSubmit={handleSubmit} />
      </div>
    </main>
  );
};
