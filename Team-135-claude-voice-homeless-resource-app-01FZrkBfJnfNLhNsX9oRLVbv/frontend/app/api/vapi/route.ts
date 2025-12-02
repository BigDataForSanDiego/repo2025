import { NextRequest, NextResponse } from "next/server";
import { VoiceAgentRequest, VoiceAgentResponse } from "@/lib/types";

/**
 * POST /api/vapi
 * Handles communication with Vapi voice agent
 */
export async function POST(request: NextRequest) {
  try {
    const body: VoiceAgentRequest = await request.json();

    // Validate request
    if (!body.audioInput || !body.sessionId || !body.timestamp) {
      return NextResponse.json(
        {
          transcript: [],
          intent: "",
          error: "Invalid request: missing required fields",
          resources: [],
        } as VoiceAgentResponse,
        { status: 400 }
      );
    }

    // TODO: Replace with actual Vapi API integration
    // For now, this is a mock implementation
    const vapiApiKey = process.env.VAPI_API_KEY;
    const vapiApiUrl = process.env.VAPI_API_URL;

    if (!vapiApiKey || !vapiApiUrl) {
      console.warn("Vapi credentials not configured, using mock response");
      return getMockVapiResponse(body);
    }

    // Call actual Vapi API
    const vapiResponse = await fetch(vapiApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${vapiApiKey}`,
      },
      body: JSON.stringify({
        audio: body.audioInput,
        sessionId: body.sessionId,
        timestamp: body.timestamp,
      }),
    });

    if (!vapiResponse.ok) {
      throw new Error(`Vapi API error: ${vapiResponse.statusText}`);
    }

    const vapiData = await vapiResponse.json();

    // Transform Vapi response to our schema
    const response: VoiceAgentResponse = {
      transcript: vapiData.transcript || [],
      intent: vapiData.intent || "",
      error: null,
      resources: vapiData.resources || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Vapi API route error:", error);

    const errorResponse: VoiceAgentResponse = {
      transcript: [],
      intent: "",
      error: error instanceof Error ? error.message : "Unknown error occurred",
      resources: [],
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * Mock Vapi response for development/testing
 */
function getMockVapiResponse(request: VoiceAgentRequest): NextResponse {
  // Simulate processing delay
  const mockTranscript = "I need help finding a shelter";

  const response: VoiceAgentResponse = {
    transcript: [
      {
        text: mockTranscript,
        timestamp: Date.now(),
        speaker: "user",
      },
      {
        text: "I'll help you find nearby shelters. Let me search for options near you.",
        timestamp: Date.now() + 1000,
        speaker: "agent",
      },
    ],
    intent: "resource_request_shelter",
    error: null,
    resources: [],
  };

  return NextResponse.json(response);
}
