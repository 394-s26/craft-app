import { Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const SettingsPage = () => {
  const { user, signOut, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete account.');
      setDeleting(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-ghibli-deep">
        <Settings size={30} />
        Settings
      </h1>

      <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-ghibli-deep">Account info</h2>
        <p className="mt-1 text-sm text-stone-500">Your details from Google sign-in.</p>
        <dl className="mt-5 space-y-4">
          {user?.displayName ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-400">Name</dt>
              <dd className="mt-1 text-stone-700">{user.displayName}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-400">Email</dt>
            <dd className="mt-1 text-stone-700">{user?.email}</dd>
          </div>
          {user?.photoURL ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-stone-400">Photo</dt>
              <dd className="mt-2">
                <img src={user.photoURL} alt="Profile" className="h-12 w-12 rounded-full object-cover" />
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-ghibli-deep">Session</h2>
        <p className="mt-3 text-sm text-stone-600">You are signed in as <strong>{user?.email}</strong>.</p>
        <button
          className="mt-4 rounded-full border border-ghibli-soft px-5 py-2 text-sm font-semibold text-ghibli-forest hover:bg-ghibli-light"
          type="button"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </section>

      <section className="mt-6 rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-red-700">Danger zone</h2>
        <p className="mt-2 text-sm text-stone-600">
          Permanently delete your account. Your crafts, photos, and data will not be automatically removed — contact support if you need a full data wipe.
        </p>
        <button
          className="mt-4 rounded-full border border-red-300 px-5 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
        >
          Delete account
        </button>
      </section>

      {showDeleteConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-black text-red-700">Delete your account?</h2>
            <p className="mt-3 text-stone-600">
              This will permanently delete your login. This cannot be undone.
            </p>
            {deleteError ? (
              <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-full border border-stone-300 px-4 py-2 font-semibold text-stone-700 hover:bg-ghibli-light"
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-full bg-red-700 px-4 py-2 font-bold text-white hover:bg-red-800 disabled:opacity-50"
                type="button"
                disabled={deleting}
                onClick={() => void handleDelete()}
              >
                {deleting ? 'Deleting…' : 'Yes, delete my account'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};
