import { Lightbulb, LogOut, Scissors, ShoppingCart, User, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-ghibli-deep text-white' : 'text-ghibli-forest hover:bg-ghibli-soft'}`;

export const NavBar = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-ghibli-soft bg-ghibli-light/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <NavLink to="/" className="flex items-center gap-2 text-2xl font-black tracking-tight text-ghibli-deep">
          <Scissors size={22} strokeWidth={2.5} />
          Crafter
        </NavLink>
        <div className="flex flex-wrap items-center gap-2">
          <NavLink className={linkClass} to="/inspiration">
            <Lightbulb size={15} />
            Inspo
          </NavLink>
          <NavLink className={linkClass} to="/work">
            <Scissors size={15} />
            My Work
          </NavLink>
          <NavLink className={linkClass} to="/shopping-list">
            <ShoppingCart size={15} />
            Shopping List
          </NavLink>
          <NavLink className={linkClass} to="/friends">
            <Users size={15} />
            My Friends
          </NavLink>
        </div>
        {user ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm text-stone-500">
              <User size={14} />
              {user.displayName ?? user.email}
            </span>
            <button
              className="flex items-center gap-1.5 rounded-full border border-ghibli-soft px-4 py-2 text-sm font-semibold text-ghibli-forest hover:bg-white"
              onClick={signOut}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        ) : null}
      </nav>
    </header>
  );
};
