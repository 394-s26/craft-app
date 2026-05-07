import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  message: string;
}

export const EmptyState = ({ title, message }: EmptyStateProps) => (
  <section className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center">
    <h2 className="text-2xl font-bold text-stone-900">{title}</h2>
    <p className="mx-auto mt-2 max-w-xl text-stone-600">{message}</p>
    <Link className="mt-6 inline-flex rounded-full bg-amber-700 px-5 py-3 font-semibold text-white hover:bg-amber-800" to="/new">
      Add a craft
    </Link>
  </section>
);
