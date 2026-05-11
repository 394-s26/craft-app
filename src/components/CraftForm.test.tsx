import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CraftForm } from './CraftForm';

const { uploadCraftPhotoMock } = vi.hoisted(() => ({
  uploadCraftPhotoMock: vi.fn(),
}));

vi.mock('../services/storageService', () => ({
  uploadCraftPhoto: (...args: unknown[]) => uploadCraftPhotoMock(...args),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user-1' } }),
}));

describe('CraftForm photo upload', () => {
  const onSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const selectFile = (name: string) => {
    const file = new File(['image'], name, { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText(/upload photos/i), {
      target: { files: [file] },
    });
    return file;
  };

  it('shows an uploading indicator and disables controls while uploading', async () => {
    let resolveUpload!: (url: string) => void;
    uploadCraftPhotoMock.mockImplementation(
      () => new Promise<string>((res) => { resolveUpload = res; }),
    );

    render(<CraftForm submitLabel="Save" onSubmit={onSubmit} />);
    selectFile('craft.jpg');

    expect(await screen.findByText('Uploading photos...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByLabelText(/upload photos/i)).toBeDisabled();

    await act(async () => { resolveUpload('https://storage.example.com/craft.jpg'); });

    expect(screen.queryByText('Uploading photos...')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled();
    expect(screen.getByLabelText(/upload photos/i)).not.toBeDisabled();
  });

  it('adds the photo to the grid when upload succeeds', async () => {
    uploadCraftPhotoMock.mockResolvedValue('https://storage.example.com/quilt.jpg');

    render(<CraftForm submitLabel="Save" onSubmit={onSubmit} />);
    selectFile('quilt.jpg');

    expect(await screen.findByRole('img', { name: 'quilt.jpg' })).toHaveAttribute(
      'src',
      'https://storage.example.com/quilt.jpg',
    );
  });

  it('calls uploadCraftPhoto with the selected file and the current user id', async () => {
    uploadCraftPhotoMock.mockResolvedValue('https://storage.example.com/photo.jpg');

    render(<CraftForm submitLabel="Save" onSubmit={onSubmit} />);
    const file = selectFile('sewing.jpg');

    await screen.findByRole('img', { name: 'sewing.jpg' });
    expect(uploadCraftPhotoMock).toHaveBeenCalledWith(file, 'user-1');
  });

  it('shows an error message when upload fails', async () => {
    uploadCraftPhotoMock.mockRejectedValue(new Error('Network error'));

    render(<CraftForm submitLabel="Save" onSubmit={onSubmit} />);
    selectFile('bad.jpg');

    expect(await screen.findByText(/failed to upload.*bad\.jpg/i)).toBeInTheDocument();
  });

  it('re-enables the file input after a failed upload', async () => {
    uploadCraftPhotoMock.mockRejectedValue(new Error('Network error'));

    render(<CraftForm submitLabel="Save" onSubmit={onSubmit} />);
    selectFile('bad.jpg');

    await screen.findByText(/failed to upload/i);
    expect(screen.getByLabelText(/upload photos/i)).not.toBeDisabled();
  });
});
