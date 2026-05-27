import heic2any from 'heic2any';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

const isHeic = (file: File): boolean =>
  file.type === 'image/heic' ||
  file.type === 'image/heif' ||
  /\.(heic|heif)$/i.test(file.name);

const convertHeicToJpeg = async (file: File): Promise<File> => {
  const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
  const converted = Array.isArray(blob) ? blob[0]! : blob;
  const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg');
  return new File([converted], newName, { type: 'image/jpeg' });
};

export const uploadCraftPhoto = async (file: File, userId: string): Promise<string> => {
  const uploadFile = isHeic(file) ? await convertHeicToJpeg(file) : file;
  const photoRef = ref(storage, `users/${userId}/photos/${crypto.randomUUID()}-${uploadFile.name}`);
  await uploadBytes(photoRef, uploadFile);
  return await getDownloadURL(photoRef);
};
