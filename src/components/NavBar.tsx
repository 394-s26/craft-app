import { Home, Lightbulb, LogOut, Scissors, Settings, ShoppingCart, Spool, User, Users } from 'lucide-react';
import { useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-ghibli-deep text-white'
      : 'text-ghibli-forest hover:bg-ghibli-soft'
  }`;

export const NavBar = () => {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <header className="sticky top-0 z-10 border-b border-ghibli-soft bg-ghibli-light/90 backdrop-blur">
      <nav className="mx-auto grid max-w-6xl grid-cols-3 items-center px-4 py-4">

        {/* LEFT: Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2 text-3xl font-black tracking-tight text-ghibli-deep font-atma justify-self-start"
        >
          <Scissors size={28} strokeWidth={2.5} />
          Crafter
        </NavLink>

        {/* CENTER: Nav Links */}
        <div className="flex items-center justify-center gap-2">
          <NavLink className={linkClass} to="/">
            <Home size={15} />
            Home
          </NavLink>

          <NavLink className={linkClass} to="/inspiration">
            <Lightbulb size={15} />
            Inspo
          </NavLink>

          <NavLink className={linkClass} to="/work">
            <Spool size={15} />
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

        {/* RIGHT: User menu */}
        <div className="relative justify-self-end" ref={menuRef}>
          {user ? (
            <>
              <button
                className="flex items-center gap-1.5 text-base font-bold text-ghibli-forest hover:text-ghibli-deep"
                onClick={() => setMenuOpen((o) => !o)}
              >
                <User size={15} />
                {user.displayName ?? user.email}
              </button>

              {menuOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-10 h-screen"
                    onClick={() => setMenuOpen(false)}
                  />

                  <div
                    className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-ghibli-soft bg-white shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-4">
                      <p className="text-lg font-black leading-tight text-ghibli-deep">
                        {user.displayName ?? user.email}
                      </p>
                      {user.displayName ? (
                        <p className="mt-0.5 text-xs text-stone-400">{user.email}</p>
                      ) : null}
                    </div>

                    <div className="border-t border-stone-100">
                      <NavLink
                        to="/settings"
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-ghibli-forest hover:bg-ghibli-light"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Settings size={14} />
                        Settings
                      </NavLink>

                      <button
                        className="flex w-full items-center gap-2 border-t border-stone-100 px-4 py-3 text-sm font-semibold text-ghibli-forest hover:bg-ghibli-light"
                        onClick={() => {
                          setMenuOpen(false);
                          void signOut();
                        }}
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </>
          ) : null}
        </div>

      </nav>
    </header>
  );
};