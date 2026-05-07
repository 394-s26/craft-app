import { createContext, useEffect, useState, type PropsWithChildren } from 'react';
import { createCraft, deleteCraft, subscribeToCrafts, updateCraft, updateCraftStatus } from '../services/craftService';
import type { Craft, CraftInput, CraftStatus } from '../types/Craft';
import { useAuth } from '../hooks/useAuth';

interface CraftContextValue {
  crafts: Craft[];
  loading: boolean;
  error: string | null;
  addCraft: (input: CraftInput) => Promise<void>;
  editCraft: (craftId: string, input: CraftInput) => Promise<void>;
  moveCraft: (craftId: string, status: CraftStatus) => Promise<void>;
  removeCraft: (craftId: string) => Promise<void>;
}

export const CraftContext = createContext<CraftContextValue | undefined>(undefined);

export const CraftProvider = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const [crafts, setCrafts] = useState<Craft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCrafts([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const unsubscribe = subscribeToCrafts(
      user.uid,
      (nextCrafts) => {
        setCrafts(nextCrafts);
        setLoading(false);
      },
      (message) => {
        setError(message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [user]);

  const addCraft = async (input: CraftInput) => {
    if (!user) {
      setError('You must be signed in to create crafts.');
      return;
    }

    setError(null);
    try {
      await createCraft(user.uid, input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create craft.');
    }
  };

  const editCraft = async (craftId: string, input: CraftInput) => {
    setError(null);
    try {
      await updateCraft(craftId, input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update craft.');
    }
  };

  const moveCraft = async (craftId: string, status: CraftStatus) => {
    setError(null);
    try {
      await updateCraftStatus(craftId, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not move craft.');
    }
  };

  const removeCraft = async (craftId: string) => {
    setError(null);
    try {
      await deleteCraft(craftId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete craft.');
    }
  };

  return <CraftContext value={{ crafts, loading, error, addCraft, editCraft, moveCraft, removeCraft }}>{children}</CraftContext>;
};
