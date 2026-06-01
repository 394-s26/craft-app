import { createContext, useEffect, useState, type PropsWithChildren } from 'react';
import {
  addFriend as addFriendService,
  removeFriend as removeFriendService,
  subscribeToFriendsAdded,
  subscribeToFriendsWhoAddedMe,
} from '../services/friendService';
import { sendFriendInviteEmail } from '../services/emailService';
import { subscribeToSharedCrafts } from '../services/craftService';
import type { Friend } from '../types/Friend';
import type { Craft } from '../types/Craft';
import { useAuth } from '../hooks/useAuth';

interface FriendContextValue {
  friends: Friend[];
  friendsWhoAddedMe: Friend[];
  sharedWithMe: Craft[];
  loading: boolean;
  error: string | null;
  addFriend: (email: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
}

export const FriendContext = createContext<FriendContextValue | undefined>(undefined);

export const FriendProvider = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsWhoAddedMe, setFriendsWhoAddedMe] = useState<Friend[]>([]);
  const [sharedWithMe, setSharedWithMe] = useState<Craft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setFriends([]);
      setFriendsWhoAddedMe([]);
      setSharedWithMe([]);
      return undefined;
    }

    setLoading(true);

    const unsubscribeFriendsAdded = subscribeToFriendsAdded(
      user.uid,
      setFriends,
      (msg) => setError(msg),
    );

    const unsubscribeFriendsWhoAddedMe = subscribeToFriendsWhoAddedMe(
      user.email,
      setFriendsWhoAddedMe,
      (msg) => setError(msg),
    );

    const unsubscribeShared = subscribeToSharedCrafts(
      user.email,
      (crafts) => {
        setSharedWithMe(crafts);
        setLoading(false);
      },
      (msg) => {
        setError(msg);
        setLoading(false);
      },
    );

    return () => {
      unsubscribeFriendsAdded();
      unsubscribeFriendsWhoAddedMe();
      unsubscribeShared();
    };
  }, [user]);

  const addFriend = async (toEmail: string) => {
    if (!user?.email) return;
    if (friends.some((f) => f.toEmail === toEmail)) {
      setError('You already added this person.');
      return;
    }
    setError(null);
    try {
      await addFriendService(user.uid, user.email, toEmail);
      const fromName = user.displayName ?? user.email;
      sendFriendInviteEmail(fromName, user.email, toEmail, window.location.origin).catch((err) => {
        console.warn('Invite email failed:', err);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add friend.');
    }
  };

  const removeFriend = async (friendId: string) => {
    setError(null);
    try {
      await removeFriendService(friendId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove friend.');
    }
  };

  return (
    <FriendContext value={{ friends, friendsWhoAddedMe, sharedWithMe, loading, error, addFriend, removeFriend }}>
      {children}
    </FriendContext>
  );
};
