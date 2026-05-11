import { beforeEach, describe, expect, it, vi } from 'vitest';
import { uploadCraftPhoto } from './storageService';

const { refMock, uploadBytesMock, getDownloadURLMock } = vi.hoisted(() => ({
  refMock: vi.fn(() => 'photoRef'),
  uploadBytesMock: vi.fn(),
  getDownloadURLMock: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  ref: (...args: unknown[]) => refMock(...args),
  uploadBytes: (...args: unknown[]) => uploadBytesMock(...args),
  getDownloadURL: (...args: unknown[]) => getDownloadURLMock(...args),
}));

vi.mock('./firebase', () => ({
  storage: 'mockStorage',
}));

describe('uploadCraftPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads the file to a user-scoped path and returns the download URL', async () => {
    uploadBytesMock.mockResolvedValue(undefined);
    getDownloadURLMock.mockResolvedValue('https://storage.example.com/photo.jpg');

    const file = new File(['image content'], 'quilt.jpg', { type: 'image/jpeg' });
    const url = await uploadCraftPhoto(file, 'user-42');

    expect(refMock).toHaveBeenCalledWith(
      'mockStorage',
      expect.stringMatching(/^users\/user-42\/photos\/.+-quilt\.jpg$/),
    );
    expect(uploadBytesMock).toHaveBeenCalledWith('photoRef', file);
    expect(getDownloadURLMock).toHaveBeenCalledWith('photoRef');
    expect(url).toBe('https://storage.example.com/photo.jpg');
  });

  it('includes the original filename in the storage path', async () => {
    uploadBytesMock.mockResolvedValue(undefined);
    getDownloadURLMock.mockResolvedValue('https://storage.example.com/knitting.png');

    const file = new File(['image'], 'my-knitting-project.png', { type: 'image/png' });
    await uploadCraftPhoto(file, 'user-1');

    const [, path] = refMock.mock.calls[0] as [string, string];
    expect(path).toMatch(/my-knitting-project\.png$/);
  });
});
