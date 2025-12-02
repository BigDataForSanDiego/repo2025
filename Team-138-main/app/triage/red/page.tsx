export default async function RedPage({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  await searchParams; // Awaited but not used, just for type compatibility
  return (
    <div className="card">
      <h2 className="h2 text-red-600">You may need urgent help</h2>
      <p className="mt-2">Please call <strong>911</strong> or the Suicide & Crisis Lifeline at <strong>988</strong> now. If you prefer, a staff member can also help connect you.</p>
      <div className="mt-4 flex gap-2">
        <a className="btn btn-primary" href="tel:988">Call 988</a>
        <a className="btn" href="/intake">Start over</a>
      </div>
    </div>
  );
}

