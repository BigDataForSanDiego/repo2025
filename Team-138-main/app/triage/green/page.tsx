export default async function GreenPage({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  await searchParams; // Awaited but not used, just for type compatibility
  return (
    <div className="grid gap-4">
      <div className="card">
        <h2 className="h2 text-green-600">You're scheduled</h2>
        <p className="mt-2">Based on your responses, we'll schedule a follow-up appointment. You'll receive a reminder via SMS if you provided a phone number.</p>
        <p className="mt-2 text-sm text-gray-600">In the meantime, here are some resources:</p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>• <a href="https://211sandiego.org" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">211 San Diego</a> — Community resources and services</li>
          <li>• <a href="https://www.sandiegocounty.gov/hhsa/programs/ssp/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">County Behavioral Health Services</a></li>
          <li>• <a href="tel:211" className="text-blue-600 hover:underline">Call 211</a> for 24/7 help</li>
        </ul>
      </div>
      <div className="card">
        <a className="btn" href="/">Return home</a>
      </div>
    </div>
  );
}

