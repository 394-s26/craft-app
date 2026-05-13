import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-stone-900 text-white' : 'text-stone-700 hover:bg-stone-200'}`;

export const NavBar = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-amber-50/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <NavLink to="/" className="text-2xl font-black tracking-tight text-stone-900">
          Crafter
        </NavLink>
        <div className="flex flex-wrap items-center gap-2">
          <NavLink className={linkClass} to="/inspiration">
            Inspo Crafts
          </NavLink>
          {/* <NavLink className={linkClass} to="/work-in-progress">
            Work in Progress
          </NavLink>
          <NavLink className={linkClass} to="/completed">
            Completed
          </NavLink> */}
          <NavLink className={linkClass} to="/work">
            My Work
          </NavLink>
          <NavLink className={linkClass} to="/shopping-list">
            Shopping List
          </NavLink>
          <NavLink className={linkClass} to="/new">
            New Craft
          </NavLink>
        </div>
        {user ? (
          <button className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-white" onClick={signOut}>
            Sign out
          </button>
        ) : null}
      </nav>
    </header>
  );
};
