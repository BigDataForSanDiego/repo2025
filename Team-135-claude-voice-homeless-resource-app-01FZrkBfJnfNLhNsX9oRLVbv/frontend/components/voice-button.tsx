"use client";

import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  onClick: () => void;
  className?: string;
}

export function VoiceButton({
  isListening,
  isProcessing,
  onClick,
  className,
}: VoiceButtonProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Ripple effect when listening */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full bg-[var(--coral)] opacity-30 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-[var(--coral)] opacity-20 animate-pulse" />
        </>
      )}

      {/* Main button */}
      <button
        onClick={onClick}
        disabled={isProcessing}
        className={cn(
          "relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
          "focus:outline-none focus:ring-4 focus:ring-[var(--coral)]/50",
          isListening
            ? "bg-[var(--coral)] scale-110"
            : "bg-[var(--navy)] hover:bg-[var(--navy)]/90 hover:scale-105",
          isProcessing && "opacity-50 cursor-not-allowed animate-pulse"
        )}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        {/* Icon */}
        <div className="relative">
          {isListening ? (
            <Mic className="w-16 h-16 text-white" strokeWidth={2} />
          ) : (
            <MicOff className="w-16 h-16 text-white opacity-80" strokeWidth={2} />
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>
      </button>

      {/* Outer glow when listening */}
      {isListening && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--coral)]/20 to-transparent blur-2xl" />
      )}
    </div>
  );
}
