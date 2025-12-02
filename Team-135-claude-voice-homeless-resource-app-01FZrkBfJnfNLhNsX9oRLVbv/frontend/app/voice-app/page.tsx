"use client";

import { useState, useEffect, useRef } from "react";
import { VoiceButton } from "@/components/voice-button";
import { TranscriptionDisplay } from "@/components/transcription-display";
import { ResourceCard } from "@/components/resource-card";
import { VapiClient } from "@/lib/vapi-client";
import { GISService } from "@/lib/gis-service";
import { TranscriptEntry, Resource } from "@/lib/types";
import { AlertCircle } from "lucide-react";

type AppState = "initial" | "listening" | "processing" | "showing_resource" | "error";

export default function VoiceAppPage() {
  const [appState, setAppState] = useState<AppState>("initial");
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const vapiClientRef = useRef<VapiClient | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize Vapi client and get user location on mount
  useEffect(() => {
    vapiClientRef.current = new VapiClient();

    // Register transcription callback
    vapiClientRef.current.onTranscriptionUpdate((data) => {
      setTranscripts((prev) => [...prev, data]);
    });

    // Get user location
    GISService.getCurrentLocation().then((location) => {
      if (location.error) {
        console.warn("Location error:", location.error);
      }
      setUserLocation({ lat: location.latitude, lng: location.longitude });
    });

    // Add initial prompt
    addAgentMessage("Is this an emergency or do you want resources? Say 'emergency' or say 'resources'.");
  }, []);

  const addAgentMessage = (text: string) => {
    const entry: TranscriptEntry = {
      text,
      timestamp: Date.now(),
      speaker: "agent",
    };
    setTranscripts((prev) => [...prev, entry]);
  };

  const addUserMessage = (text: string) => {
    const entry: TranscriptEntry = {
      text,
      timestamp: Date.now(),
      speaker: "user",
    };
    setTranscripts((prev) => [...prev, entry]);
  };

  const handleVoiceButtonClick = async () => {
    if (appState === "listening") {
      stopListening();
    } else if (appState === "initial" || appState === "showing_resource") {
      startListening();
    }
  };

  const startListening = async () => {
    try {
      setError(null);
      setAppState("listening");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Could not access microphone. Please grant permission and try again.");
      setAppState("error");
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setAppState("processing");
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert audio to base64
      const base64Audio = await blobToBase64(audioBlob);

      if (!vapiClientRef.current) {
        throw new Error("Vapi client not initialized");
      }

      // Send to Vapi
      const response = await vapiClientRef.current.sendAudio(base64Audio);

      if (response.error) {
        throw new Error(response.error);
      }

      // Update transcripts
      response.transcript.forEach((entry) => {
        if (!transcripts.find((t) => t.timestamp === entry.timestamp)) {
          setTranscripts((prev) => [...prev, entry]);
        }
      });

      // Handle intent and resources
      if (response.intent && response.intent.toLowerCase().includes("resource")) {
        await handleResourceRequest(response);
      } else if (response.intent && response.intent.toLowerCase().includes("emergency")) {
        await handleEmergencyRequest();
      }

      setAppState("initial");
    } catch (err) {
      console.error("Audio processing error:", err);
      setError(err instanceof Error ? err.message : "Failed to process audio");
      setAppState("error");

      // Add error message to transcript
      addAgentMessage("Sorry, I encountered an error. Please try again.");
    }
  };

  const handleResourceRequest = async (response: any) => {
    if (response.resources && response.resources.length > 0) {
      // Show first resource
      setCurrentResource(response.resources[0]);
      setAppState("showing_resource");
    } else if (userLocation) {
      // Fallback: Use GIS to find nearby resources
      const gisResponse = await GISService.findNearbyResources({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        resourceType: "shelter", // Default to shelter
      });

      if (gisResponse.error) {
        throw new Error(gisResponse.error);
      }

      if (gisResponse.resources.length > 0) {
        setCurrentResource(gisResponse.resources[0]);
        setAppState("showing_resource");
      } else {
        addAgentMessage("I couldn't find any resources nearby. Please try a different request.");
        setAppState("initial");
      }
    } else {
      addAgentMessage("I need your location to find nearby resources. Please enable location access.");
      setAppState("initial");
    }
  };

  const handleEmergencyRequest = async () => {
    addAgentMessage("I'm connecting you to emergency services. Stay on the line.");

    // In a real implementation, this would trigger emergency dispatch
    // For now, show emergency message
    setTimeout(() => {
      addAgentMessage("If this is a life-threatening emergency, please call 911 immediately.");
      setAppState("initial");
    }, 1000);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const base64 = reader.result.split(",")[1];
          resolve(base64);
        } else {
          reject(new Error("Failed to convert blob to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleCloseResource = () => {
    setCurrentResource(null);
    setAppState("initial");
    addAgentMessage("Would you like to find another resource?");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--navy)] via-[var(--navy)]/95 to-[var(--sage)]/20 flex flex-col items-center justify-between p-6 pb-12">
      {/* Header */}
      <div className="w-full max-w-2xl text-center mt-8">
        <h1 className="text-4xl font-bold text-white mb-2">Home Base</h1>
        <p className="text-white/70 text-lg">Voice-First Resource Finder</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-2xl flex flex-col justify-center items-center gap-8">
        {/* Error Display */}
        {error && appState === "error" && (
          <div className="w-full bg-red-500/20 border border-red-500/50 rounded-2xl p-4 flex items-start gap-3 backdrop-blur-sm">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-300 font-semibold mb-1">Error</h3>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Resource Card (slides in from top) */}
        {currentResource && appState === "showing_resource" && (
          <div className="w-full">
            <ResourceCard resource={currentResource} onClose={handleCloseResource} />
          </div>
        )}

        {/* Voice Button */}
        <div
          className={`transition-all duration-500 ${
            appState === "showing_resource" ? "translate-y-8" : ""
          }`}
        >
          <VoiceButton
            isListening={appState === "listening"}
            isProcessing={appState === "processing"}
            onClick={handleVoiceButtonClick}
          />
        </div>

        {/* Status Text */}
        <div className="text-center">
          <p className="text-white/80 text-lg">
            {appState === "listening" && "Listening..."}
            {appState === "processing" && "Processing..."}
            {appState === "initial" && "Tap to speak"}
            {appState === "showing_resource" && "Resource found"}
            {appState === "error" && "Error occurred"}
          </p>
        </div>
      </div>

      {/* Transcription Display (always visible at bottom) */}
      <div className="w-full max-w-2xl mt-8">
        <TranscriptionDisplay transcripts={transcripts} />
      </div>
    </div>
  );
}
