/** Placeholder for screens delivered in a later milestone. */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="text-center py-5">
      <h1 className="h4 fw-bold">{title}</h1>
      <p className="text-secondary">This screen is part of an upcoming milestone.</p>
    </div>
  );
}
