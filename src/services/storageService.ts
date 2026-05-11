import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

export const uploadCraftPhoto = async (file: File, userId: string): Promise<string> => {
  const photoRef = ref(storage, `users/${userId}/photos/${crypto.randomUUID()}-${file.name}`);
  await uploadBytes(photoRef, file);
  return await getDownloadURL(photoRef);
};
