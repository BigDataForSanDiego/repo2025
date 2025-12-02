import { NextRequest, NextResponse } from "next/server";
import { GISLookupRequest, GISLookupResponse, Resource } from "@/lib/types";

/**
 * POST /api/gis-lookup
 * Finds nearby resources based on user location
 */
export async function POST(request: NextRequest) {
  try {
    const body: GISLookupRequest = await request.json();

    // Validate request
    if (
      typeof body.latitude !== "number" ||
      typeof body.longitude !== "number" ||
      !body.resourceType
    ) {
      return NextResponse.json(
        {
          resources: [],
          error: "Invalid request: missing or invalid latitude, longitude, or resourceType",
        } as GISLookupResponse,
        { status: 400 }
      );
    }

    // Check for Google Maps API key or Supabase backend
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Try Supabase PostGIS backend first (existing resource-finder edge function)
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/resource-finder`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            latitude: body.latitude,
            longitude: body.longitude,
            type: body.resourceType,
            radius: 5000, // 5km radius
          }),
        });

        if (response.ok) {
          const data = await response.json();

          // Transform Supabase response to our schema
          const resources: Resource[] = (data.resources || []).map((r: any) => ({
            name: r.name,
            type: body.resourceType,
            latitude: r.latitude || r.lat,
            longitude: r.longitude || r.lng || r.lon,
            address: r.address,
            distanceMeters: r.distance || r.distanceMeters || 0,
            metadata: {
              phone: r.phone,
              hours: r.hours,
              description: r.description,
              ...r.metadata,
            },
          }));

          return NextResponse.json({
            resources,
            error: null,
          } as GISLookupResponse);
        }
      } catch (supabaseError) {
        console.warn("Supabase lookup failed, falling back to Google Maps:", supabaseError);
      }
    }

    // Fallback to Google Maps Places API
    if (googleMapsApiKey) {
      return await getGoogleMapsResources(body, googleMapsApiKey);
    }

    // If no services available, return mock data for development
    console.warn("No GIS services configured, using mock data");
    return getMockResources(body);
  } catch (error) {
    console.error("GIS lookup error:", error);

    return NextResponse.json(
      {
        resources: [],
        error: error instanceof Error ? error.message : "GIS lookup failed",
      } as GISLookupResponse,
      { status: 500 }
    );
  }
}

/**
 * Get resources from Google Maps Places API
 */
async function getGoogleMapsResources(
  request: GISLookupRequest,
  apiKey: string
): Promise<NextResponse> {
  try {
    const typeMapping: Record<string, string> = {
      shelter: "lodging",
      food: "restaurant|cafe|meal_takeaway",
      other: "point_of_interest",
    };

    const placesType = typeMapping[request.resourceType] || "point_of_interest";

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${request.latitude},${request.longitude}&radius=5000&type=${placesType}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    const resources: Resource[] = (data.results || []).slice(0, 10).map((place: any) => ({
      name: place.name,
      type: request.resourceType,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      address: place.vicinity || place.formatted_address || "",
      distanceMeters: 0, // Google API doesn't return distance directly
      metadata: {
        rating: place.rating,
        open_now: place.opening_hours?.open_now,
      },
    }));

    return NextResponse.json({
      resources,
      error: null,
    } as GISLookupResponse);
  } catch (error) {
    console.error("Google Maps lookup error:", error);
    return NextResponse.json(
      {
        resources: [],
        error: "Failed to fetch from Google Maps",
      } as GISLookupResponse,
      { status: 500 }
    );
  }
}

/**
 * Mock resources for development/testing
 */
function getMockResources(request: GISLookupRequest): NextResponse {
  const mockResources: Resource[] = [
    {
      name: "Downtown Shelter",
      type: "shelter",
      latitude: request.latitude + 0.01,
      longitude: request.longitude + 0.01,
      address: "123 Main St, San Diego, CA 92101",
      distanceMeters: 1200,
      metadata: {
        phone: "(619) 555-0100",
        hours: "24/7",
        description: "Emergency overnight shelter with meals",
      },
    },
    {
      name: "Community Food Bank",
      type: "food",
      latitude: request.latitude - 0.01,
      longitude: request.longitude - 0.01,
      address: "456 Oak Ave, San Diego, CA 92102",
      distanceMeters: 800,
      metadata: {
        phone: "(619) 555-0200",
        hours: "Mon-Fri 9AM-5PM",
        description: "Free meals and groceries",
      },
    },
    {
      name: "St. Vincent de Paul",
      type: "shelter",
      latitude: request.latitude + 0.02,
      longitude: request.longitude - 0.01,
      address: "789 Pine St, San Diego, CA 92103",
      distanceMeters: 2400,
      metadata: {
        phone: "(619) 555-0300",
        hours: "Check-in 5PM-7PM",
        description: "Family shelter with case management",
      },
    },
  ];

  // Filter by resource type
  const filteredResources = mockResources.filter(
    (r) => r.type === request.resourceType || request.resourceType === "other"
  );

  return NextResponse.json({
    resources: filteredResources,
    error: null,
  } as GISLookupResponse);
}
