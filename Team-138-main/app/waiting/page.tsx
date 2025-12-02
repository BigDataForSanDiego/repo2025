"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function WaitingContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") || "";
  const clientId = searchParams.get("clientId") || "";
  const [status, setStatus] = useState<"waiting" | "claimed">("waiting");

  useEffect(() => {
    if (!roomId) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/sessions?roomId=${roomId}`);
      const data = await res.json();
      if (data.claimedBy) {
        setStatus("claimed");
        window.location.href = `/session?roomId=${roomId}&clientId=${clientId}`;
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [roomId, clientId]);

  return (
    <div className="card text-center">
      <h2 className="h2">Waiting for a clinician...</h2>
      <p className="mt-2 text-sm text-gray-600">You're in the queue. A staff member will connect with you shortly.</p>
      <div className="mt-6">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <p className="mt-4 text-xs text-gray-500">Room ID: {roomId}</p>
    </div>
  );
}

export default function WaitingPage() {
  return (
    <Suspense fallback={<div className="card text-center">Loading...</div>}>
      <WaitingContent />
    </Suspense>
  );
}

