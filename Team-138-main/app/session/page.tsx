"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { VideoCallMock } from "@/components/VideoCallMock";

function SessionContent() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") || "";

  if (!roomId) {
    return <div className="card">Missing room ID.</div>;
  }

  return (
    <div className="grid gap-4">
      <VideoCallMock roomId={roomId} />
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="card">Loading...</div>}>
      <SessionContent />
    </Suspense>
  );
}

