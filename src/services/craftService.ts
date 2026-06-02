import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Craft, CraftInput, CraftSource, CraftStatus } from '../types/Craft';

const craftsCollection = collection(db, 'crafts');

const mapSources = (data: DocumentData): CraftSource[] => {
  if (Array.isArray(data.sources)) {
    return data.sources
      .map((source): CraftSource | null => {
        if (source?.type === 'external' && source.url) {
          return {
            id: String(source.id ?? crypto.randomUUID()),
            type: 'external',
            url: String(source.url),
            ...(source.label ? { label: String(source.label) } : {}),
            ...(source.imageUrl ? { imageUrl: String(source.imageUrl) } : {}),
          };
        }

        if (source?.type === 'craft' && source.craftId) {
          return {
            id: String(source.id ?? crypto.randomUUID()),
            type: 'craft',
            craftId: String(source.craftId),
          };
        }

        return null;
      })
      .filter((source): source is CraftSource => source !== null);
  }
  return [];
};

const mapCraft = (id: string, data: DocumentData): Craft => ({
  id,
  userId: String(data.userId),
  title: String(data.title),
  description: String(data.description),
  materials: Array.isArray(data.materials) ? data.materials.map(String) : [],
  photos: Array.isArray(data.photos) ? data.photos : [],
  status: data.status as CraftStatus,
  sourceUrl: data.sourceUrl ? String(data.sourceUrl) : undefined,
  sources: mapSources(data),
  progress: typeof data.progress === 'number' ? data.progress : 0,
  isPublic: data.isPublic === true,
  tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
  sharedWith: Array.isArray(data.sharedWith) ? data.sharedWith.map(String) : [],
  createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
  updatedAt: data.updatedAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
});

export const subscribeToCrafts = (
  userId: string,
  callback: (crafts: Craft[]) => void,
  onError: (message: string) => void,
): (() => void) => {
  const craftsQuery = query(craftsCollection, where('userId', '==', userId), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    craftsQuery,
    (snapshot) => callback(snapshot.docs.map((craftDoc) => mapCraft(craftDoc.id, craftDoc.data()))),
    (error) => onError(error.message),
  );
};

export const createCraft = async (userId: string, input: CraftInput): Promise<string> => {
  try {
    const data: Record<string, unknown> = { userId, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    for (const [k, v] of Object.entries(input)) {
      if (v !== undefined) data[k] = v;
    }
    const docRef = await addDoc(craftsCollection, data);

    return docRef.id;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Could not create craft.');
  }
};

export const updateCraft = async (craftId: string, input: CraftInput): Promise<void> => {
  try {
    const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
    for (const [k, v] of Object.entries(input)) {
      if (v !== undefined) data[k] = v;
    }
    await updateDoc(doc(db, 'crafts', craftId), data);
  } catch (error) {
    throw error instanceof Error ? error : new Error('Could not update craft.');
  }
};

export const updateCraftStatus = async (craftId: string, status: CraftStatus): Promise<void> => {
  try {
    await updateDoc(doc(db, 'crafts', craftId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Could not update craft status.');
  }
};

export const deleteCraft = async (craftId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'crafts', craftId));
  } catch (error) {
    throw error instanceof Error ? error : new Error('Could not delete craft.');
  }
};

export const updateSharedWith = async (craftId: string, sharedWith: string[]): Promise<void> => {
  try {
    await updateDoc(doc(db, 'crafts', craftId), { sharedWith });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Could not update sharing.');
  }
};

export const getCraftById = async (craftId: string): Promise<Craft | null> => {
  const craftDoc = await getDoc(doc(db, 'crafts', craftId));
  if (!craftDoc.exists()) return null;
  return mapCraft(craftDoc.id, craftDoc.data());
};

export const updateIsPublic = async (craftId: string, isPublic: boolean): Promise<void> => {
  try {
    await updateDoc(doc(db, 'crafts', craftId), { isPublic });
  } catch (error) {
    throw error instanceof Error ? error : new Error('Could not update visibility.');
  }
};

export const subscribeToSharedCrafts = (
  email: string,
  callback: (crafts: Craft[]) => void,
  onError: (message: string) => void,
): (() => void) => {
  const q = query(craftsCollection, where('sharedWith', 'array-contains', email));
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((d) => mapCraft(d.id, d.data()))),
    (err) => onError(err.message),
  );
};