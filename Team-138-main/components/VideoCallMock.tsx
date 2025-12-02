"use client";
export function VideoCallMock({ roomId }: { roomId: string }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="h2">Session Room: {roomId}</h2>
        <span className="badge">Mock WebRTC</span>
      </div>
      <div className="mt-3 h-60 rounded-xl border bg-black/90 text-white grid place-items-center">
        <div>Video stream placeholder</div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn">Mic</button>
        <button className="btn">Camera</button>
        <button className="btn">Chat</button>
        <button className="btn bg-red-600 text-white">End</button>
      </div>
      <p className="text-xs text-gray-500 mt-2">Swap this with Twilio/Vonage/Daily WebRTC widget for production.</p>
    </div>
  );
}

