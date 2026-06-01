import { Users } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { useFriends } from '../hooks/useFriends';
import type { Craft } from '../types/Craft';

export const FriendsPage = () => {
  const { friends, friendsWhoAddedMe, sharedWithMe, loading, error, addFriend, removeFriend } = useFriends();
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [selectedCraft, setSelectedCraft] = useState<Craft | null>(null);

  const getOwnerEmail = (craft: Craft) =>
    friendsWhoAddedMe.find((f) => f.fromUserId === craft.userId)?.fromEmail ?? 'a friend';

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setAddError(null);
    setAdding(true);
    await addFriend(trimmed);
    setAdding(false);
    if (!error) setEmail('');
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="flex items-center gap-3 text-4xl font-black tracking-tight text-ghibli-deep">
        <Users size={30} />
        My Friends
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[22rem_1fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-ghibli-deep">Add a friend</h2>
            <p className="mt-1 text-sm text-stone-500">Enter their email to share crafts with them.</p>
            <form className="mt-4 flex gap-3" onSubmit={(event) => void handleAdd(event)}>
              <input
                className="min-w-0 flex-1 rounded-2xl border border-stone-300 px-4 py-3 outline-none focus:border-ghibli-forest"
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button
                className="rounded-2xl bg-ghibli-deep px-5 py-3 font-bold text-white hover:bg-ghibli-forest disabled:opacity-50"
                type="submit"
                disabled={adding}
              >
                Add
              </button>
            </form>
            {(addError ?? error) ? (
              <p className="mt-3 text-sm text-red-600">{addError ?? error}</p>
            ) : null}
          </section>

          {friends.length > 0 ? (
            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-ghibli-deep">People you've added</h2>
              <ul className="mt-4 space-y-2">
                {friends.map((friend) => (
                  <li key={friend.id} className="flex items-center justify-between rounded-2xl bg-ghibli-light px-4 py-3">
                    <span className="truncate text-sm text-stone-700">{friend.toEmail}</span>
                    <button
                      className="ml-3 shrink-0 rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                      type="button"
                      onClick={() => void removeFriend(friend.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <section>
          <h2 className="text-xl font-bold text-ghibli-deep">Shared with me</h2>
          {loading ? (
            <p className="mt-4 text-stone-600">Loading...</p>
          ) : sharedWithMe.length === 0 ? (
            <p className="mt-4 text-stone-500">Nothing shared with you yet.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sharedWithMe.map((craft) => (
                <button
                  key={craft.id}
                  className="overflow-hidden rounded-3xl border border-stone-200 bg-white text-left shadow-sm transition hover:shadow-md"
                  type="button"
                  onClick={() => setSelectedCraft(craft)}
                >
                  {craft.photos[0] ? (
                    <img
                      className="h-44 w-full object-cover"
                      src={craft.photos[0].url}
                      alt={craft.photos[0].alt}
                    />
                  ) : (
                    <div className="h-44 w-full bg-ghibli-soft" />
                  )}
                  <div className="p-4">
                    <p className="text-xs text-stone-500">From {getOwnerEmail(craft)}</p>
                    <h3 className="mt-1 font-bold text-ghibli-deep">{craft.title}</h3>
                    <div className="mt-2">
                      <StatusBadge status={craft.status} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedCraft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 px-4 py-8">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-stone-500">Shared by {getOwnerEmail(selectedCraft)}</p>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-black tracking-tight text-ghibli-deep">{selectedCraft.title}</h2>
                  <StatusBadge status={selectedCraft.status} />
                </div>
                {selectedCraft.description ? (
                  <p className="mt-3 whitespace-pre-wrap leading-7 text-stone-700">{selectedCraft.description}</p>
                ) : null}
              </div>
              <button
                className="shrink-0 rounded-full bg-ghibli-deep px-4 py-2 text-sm font-bold text-white hover:bg-ghibli-forest"
                type="button"
                onClick={() => setSelectedCraft(null)}
              >
                Close
              </button>
            </div>

            {selectedCraft.materials.length > 0 ? (
              <section className="mt-6 rounded-2xl bg-ghibli-light p-4">
                <h3 className="font-bold text-ghibli-deep">Materials</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {selectedCraft.materials.map((material) => (
                    <li className="rounded-2xl bg-white px-4 py-3 text-stone-700" key={material}>
                      {material}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {selectedCraft.photos.length > 0 ? (
              <section className="mt-6 grid gap-4 sm:grid-cols-2">
                {selectedCraft.photos.map((photo) => (
                  <img
                    className="h-64 w-full rounded-3xl object-cover"
                    key={photo.id}
                    src={photo.url}
                    alt={photo.alt}
                  />
                ))}
              </section>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
};
