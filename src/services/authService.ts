import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import type { AuthUser } from '../types/AuthUser';
import { auth } from './firebase';

const mapFirebaseUser = (user: typeof auth.currentUser): AuthUser | null => {
  if (!user) {
    return null;
  }

  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
};

export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = mapFirebaseUser(result.user);

    if (!user) {
      throw new Error('Google sign-in failed.');
    }

    return user;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Google sign-in failed.');
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error instanceof Error ? error : new Error('Sign-out failed.');
  }
};

export const subscribeToAuthChanges = (callback: (user: AuthUser | null) => void): (() => void) => {
  return onAuthStateChanged(auth, (user) => callback(mapFirebaseUser(user)));
};
