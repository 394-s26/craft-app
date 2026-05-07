import type { PropsWithChildren } from 'react';
import { useAuth } from '../hooks/useAuth';

export const AuthGate = ({ children }: PropsWithChildren) => {
  const { user, loading, error, signIn } = useAuth();

  if (loading) {
    return <main className="mx-auto max-w-3xl px-4 py-16 text-center text-stone-600">Loading your craft room...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center">
        <section>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-amber-700">Non-addictive project tracking</p>
          <h1 className="text-5xl font-black tracking-tight text-stone-950">Keep your craft ideas, progress, and finished pieces in one calm place.</h1>
          <p className="mt-5 text-lg leading-8 text-stone-700">
            Crafter helps sewists, crocheters, knitters, scrapbookers, and makers save inspiration, plan materials, update project photos, and move projects from work in progress to completed.
          </p>
        </section>
        <section className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-stone-900">Sign in to start</h2>
          <p className="mt-2 text-stone-600">Use Google Sign-In so your projects can be saved in Firestore.</p>
          <button className="mt-6 w-full rounded-full bg-stone-900 px-5 py-3 font-semibold text-white hover:bg-stone-700" onClick={signIn}>
            Continue with Google
          </button>
          {error ? <p className="mt-4 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        </section>
      </main>
    );
  }

  return children;
};
