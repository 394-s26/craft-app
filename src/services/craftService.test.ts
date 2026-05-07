import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCraft, updateCraftStatus } from './craftService';
import type { CraftInput } from '../types/Craft';

const { addDocMock, updateDocMock } = vi.hoisted(() => ({
  addDocMock: vi.fn(),
  updateDocMock: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  addDoc: (...args: unknown[]) => addDocMock(...args),
  collection: vi.fn(() => 'craftsCollection'),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => 'craftDoc'),
  onSnapshot: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(),
  serverTimestamp: vi.fn(() => 'serverTimestamp'),
  updateDoc: (...args: unknown[]) => updateDocMock(...args),
  where: vi.fn(),
  getFirestore: vi.fn(() => 'db'),
}));

vi.mock('firebase/app', () => ({
  getApp: vi.fn(() => 'app'),
  getApps: vi.fn(() => ['app']),
  initializeApp: vi.fn(() => 'app'),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => 'auth'),
}));

describe('craftService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a craft with user id and timestamps', async () => {
    addDocMock.mockResolvedValue({ id: 'new-craft' });
    const input: CraftInput = {
      title: 'Dress',
      description: 'A linen dress',
      materials: ['linen'],
      photos: [],
      status: 'work-in-progress',
    };

    await expect(createCraft('user-1', input)).resolves.toBe('new-craft');
    expect(addDocMock).toHaveBeenCalledWith('craftsCollection', expect.objectContaining({ userId: 'user-1', title: 'Dress', createdAt: 'serverTimestamp', updatedAt: 'serverTimestamp' }));
  });

  it('updates craft status', async () => {
    updateDocMock.mockResolvedValue(undefined);

    await updateCraftStatus('craft-1', 'completed');

    expect(updateDocMock).toHaveBeenCalledWith('craftDoc', expect.objectContaining({ status: 'completed', updatedAt: 'serverTimestamp' }));
  });
});
