import { useState, useEffect } from 'react';

export interface StashEntry {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

const STORAGE_KEY = 'craft-app-stash';

export const useStash = () => {
  const [stash, setStash] = useState<StashEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StashEntry[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stash));
  }, [stash]);

  const addEntry = (entry: Omit<StashEntry, 'id'>) => {
    setStash((prev) => [...prev, { ...entry, id: crypto.randomUUID() }]);
  };

  const removeEntry = (id: string) => {
    setStash((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEntry = (id: string, changes: Partial<Omit<StashEntry, 'id'>>) => {
    setStash((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));
  };

  return { stash, addEntry, removeEntry, updateEntry };
};
