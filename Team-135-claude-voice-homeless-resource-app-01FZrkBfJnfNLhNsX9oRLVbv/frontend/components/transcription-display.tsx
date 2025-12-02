"use client";

import { useEffect, useRef } from "react";
import { TranscriptEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TranscriptionDisplayProps {
  transcripts: TranscriptEntry[];
  className?: string;
}

export function TranscriptionDisplay({
  transcripts,
  className,
}: TranscriptionDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcripts]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full max-h-64 overflow-y-auto space-y-3 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10",
        "scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
        className
      )}
    >
      {transcripts.length === 0 ? (
        <div className="text-center text-white/50 py-8">
          <p className="text-lg">Transcription will appear here...</p>
        </div>
      ) : (
        transcripts.map((entry, index) => (
          <div
            key={`${entry.timestamp}-${index}`}
            className={cn(
              "flex flex-col gap-1 p-3 rounded-xl transition-all duration-300",
              entry.speaker === "user"
                ? "bg-[var(--sage)]/20 ml-4"
                : "bg-[var(--navy)]/40 mr-4"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  entry.speaker === "user"
                    ? "text-[var(--sage)]"
                    : "text-[var(--coral)]"
                )}
              >
                {entry.speaker === "user" ? "You" : "Assistant"}
              </span>
              <span className="text-xs text-white/40">
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>
            <p className="text-white text-base leading-relaxed">{entry.text}</p>
          </div>
        ))
      )}
    </div>
  );
}
