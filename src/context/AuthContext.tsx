import { createContext, useEffect, useState, type PropsWithChildren } from 'react';
import { deleteAccount as deleteAccountService, signInWithGoogle, signOutUser, subscribeToAuthChanges } from '../services/authService';
import type { AuthUser } from '../types/AuthUser';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async () => {
    setError(null);
    try {
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await signOutUser();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign out.');
    }
  };

  const deleteAccount = async () => {
    setError(null);
    try {
      await deleteAccountService();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete account.');
      throw err;
    }
  };

  return <AuthContext value={{ user, loading, error, signIn, signOut, deleteAccount }}>{children}</AuthContext>;
};
