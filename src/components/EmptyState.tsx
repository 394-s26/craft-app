interface EmptyStateProps {
  message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => (
  <section className="rounded-3xl border border-dashed border-stone-300 bg-white p-10 text-center">
    <h2 className="text-2xl font-bold text-ghibli-deep">{message}</h2>
  </section>
);
