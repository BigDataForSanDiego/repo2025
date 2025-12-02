import { TriageForm } from "@/components/TriageForm";

export default async function TriagePage({ searchParams }: { searchParams: Promise<{ clientId?: string }> }) {
  const params = await searchParams;
  const clientId = params.clientId || "";
  if (!clientId) return <div className="card">Missing client ID. Go to <a className="underline" href="/intake">intake</a>.</div>;
  return (
    <div className="grid gap-4">
      <div className="card"><h1 className="h1">Triage</h1><p className="text-sm text-gray-600">Answer a few quick questions so we can route you to the right help.</p></div>
      <TriageForm clientId={clientId} />
    </div>
  );
}

