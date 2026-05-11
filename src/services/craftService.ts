import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Craft, CraftInput, CraftStatus } from '../types/Craft';

const craftsCollection = collection(db, 'crafts');

const mapCraft = (id: string, data: DocumentData): Craft => ({
  id,
  userId: String(data.userId),
  title: String(data.title),
  description: String(data.description),
  materials: Array.isArray(data.materials) ? data.materials.map(String) : [],
  photos: Array.isArray(data.photos) ? data.photos : [],
  status: data.status as CraftStatus,
  sourceUrl: data.sourceUrl ? String(data.sourceUrl) : "",
  progress: typeof data.progress === 'number' ? data.progress : 0,
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
    const docRef = await addDoc(craftsCollection, {
      ...input,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Could not create craft.');
  }
};

export const updateCraft = async (craftId: string, input: CraftInput): Promise<void> => {
  //console.log('Saving to Firebase:', input);
  try {
    await updateDoc(doc(db, 'crafts', craftId), {
      ...input,
      updatedAt: serverTimestamp(),
    });
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
