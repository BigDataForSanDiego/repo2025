// Vapi Voice Agent Client

import {
  VoiceAgentRequest,
  VoiceAgentResponse,
  LiveTranscriptionData,
} from "./types";

const VAPI_API_URL = process.env.NEXT_PUBLIC_VAPI_API_URL || "/api/vapi";

export class VapiClient {
  private sessionId: string;
  private onTranscription?: (data: LiveTranscriptionData) => void;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Register callback for live transcription updates
   */
  onTranscriptionUpdate(callback: (data: LiveTranscriptionData) => void) {
    this.onTranscription = callback;
  }

  /**
   * Send audio input to Vapi voice agent
   */
  async sendAudio(audioInput: string): Promise<VoiceAgentResponse> {
    const request: VoiceAgentRequest = {
      audioInput,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    try {
      const response = await fetch(VAPI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Vapi API error: ${response.statusText}`);
      }

      const data: VoiceAgentResponse = await response.json();

      // Trigger transcription callback for latest entry
      if (this.onTranscription && data.transcript.length > 0) {
        const latest = data.transcript[data.transcript.length - 1];
        this.onTranscription(latest);
      }

      return data;
    } catch (error) {
      console.error("Vapi client error:", error);
      return {
        transcript: [],
        intent: "",
        error: error instanceof Error ? error.message : "Unknown error",
        resources: [],
      };
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Reset session
   */
  resetSession() {
    this.sessionId = this.generateSessionId();
  }
}
