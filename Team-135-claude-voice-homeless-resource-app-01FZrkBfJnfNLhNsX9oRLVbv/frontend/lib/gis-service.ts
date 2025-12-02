// GIS Location Service for Resource Lookup

import { GISLookupRequest, GISLookupResponse, Resource } from "./types";

const GIS_API_URL = process.env.NEXT_PUBLIC_GIS_API_URL || "/api/gis-lookup";

export class GISService {
  /**
   * Find nearby resources based on user location
   */
  static async findNearbyResources(
    request: GISLookupRequest
  ): Promise<GISLookupResponse> {
    try {
      const response = await fetch(GIS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`GIS API error: ${response.statusText}`);
      }

      const data: GISLookupResponse = await response.json();
      return data;
    } catch (error) {
      console.error("GIS service error:", error);
      return {
        resources: [],
        error: error instanceof Error ? error.message : "GIS lookup failed",
      };
    }
  }

  /**
   * Get user's current location
   */
  static async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    error: string | null;
  }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          latitude: 32.7157, // Default to San Diego
          longitude: -117.1611,
          error: "Geolocation not supported",
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          resolve({
            latitude: 32.7157, // Default to San Diego
            longitude: -117.1611,
            error: error.message,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Calculate distance between two points in meters
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Format distance for display
   */
  static formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }
}
