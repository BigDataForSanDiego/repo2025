"use client";
import { useEffect, useState } from "react";
import { QueueItem, Client } from "@/lib/store";

export default function StaffPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [staffId] = useState(() => "staff_" + Math.random().toString(36).slice(2, 8));

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/queue");
      const data = await res.json();
      setQueue(data.queue || []);
      setClients(data.clients || {});
    }, 2000);
    fetch("/api/queue").then(r => r.json()).then(data => {
      setQueue(data.queue || []);
      setClients(data.clients || {});
    });
    return () => clearInterval(interval);
  }, []);

  async function claim(roomId: string) {
    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, staffId }),
    });
    if (res.ok) {
      window.location.href = `/session?roomId=${roomId}`;
    }
  }

  return (
    <div className="grid gap-4">
      <div className="card">
        <h1 className="h1">Staff Console</h1>
        <p className="text-sm text-gray-600 mt-1">Staff ID: {staffId}</p>
      </div>
      <div className="card">
        <h2 className="h2">Waiting Queue ({queue.length})</h2>
        {queue.length === 0 ? (
          <p className="text-sm text-gray-500 mt-2">No clients waiting.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {queue.map((item) => {
              const client = clients[item.clientId];
              const waitTime = Math.floor((Date.now() - item.createdAt) / 1000 / 60);
              return (
                <div key={item.roomId} className="border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{client?.name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">Room: {item.roomId} • Waiting {waitTime}m</div>
                  </div>
                  <button className="btn btn-primary" onClick={() => claim(item.roomId)} disabled={!!item.claimedBy}>
                    {item.claimedBy ? "Claimed" : "Claim"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

