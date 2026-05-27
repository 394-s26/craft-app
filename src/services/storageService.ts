import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';

const isHeic = (file: File): boolean =>
  file.type === 'image/heic' ||
  file.type === 'image/heif' ||
  (/\.(heic|heif)$/i.test(file.name) && file.type !== 'image/jpeg' && file.type !== 'image/png');

const jpegName = (name: string) => name.replace(/\.(heic|heif)$/i, '.jpg');

const canvasToJpeg = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')?.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(new File([blob], jpegName(file.name), { type: 'image/jpeg' }));
          else reject(new Error('Canvas export failed'));
        },
        'image/jpeg',
        0.85,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not decode image'));
    };
    img.src = url;
  });

const convertHeicWithLibheif = async (file: File): Promise<File> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let libheif: any = (await import('libheif-js/wasm-bundle')).default;
  if (typeof libheif?.then === 'function') libheif = await libheif;

  const buffer = await file.arrayBuffer();
  const decoder = new libheif.HeifDecoder();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const images: any[] = decoder.decode(new Uint8Array(buffer));
  if (!images?.length) throw new Error('No images in HEIC file');

  const image = images[0];
  const width: number = image.get_width();
  const height: number = image.get_height();

  const imageData = await new Promise<ImageData>((resolve, reject) => {
    image.display(
      { data: new Uint8ClampedArray(width * height * 4), width, height },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result: any) => {
        if (!result) { reject(new Error('HEIF display error')); return; }
        resolve(new ImageData(result.data, result.width, result.height));
      },
    );
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(new File([blob], jpegName(file.name), { type: 'image/jpeg' }));
        else reject(new Error('Canvas export failed'));
      },
      'image/jpeg',
      0.85,
    );
  });
};

const convertHeicToJpeg = async (file: File): Promise<File> => {
  // Canvas first: handles files macOS silently converted to JPEG with a .heic name,
  // and real HEIC on Safari (native support)
  try {
    return await canvasToJpeg(file);
  } catch {
    // Canvas can't decode real HEIC on Chrome — use libheif-js (newer than heic2any)
    try {
      return await convertHeicWithLibheif(file);
    } catch (e) {
      console.error('libheif conversion failed:', e);
      throw new Error(`HEIC conversion failed: ${e instanceof Error ? e.message : JSON.stringify(e)}`);
    }
  }
};

export const uploadCraftPhoto = async (file: File, userId: string): Promise<string> => {
  const uploadFile = isHeic(file) ? await convertHeicToJpeg(file) : file;
  const photoRef = ref(storage, `users/${userId}/photos/${crypto.randomUUID()}-${uploadFile.name}`);
  await uploadBytes(photoRef, uploadFile);
  return await getDownloadURL(photoRef);
};
