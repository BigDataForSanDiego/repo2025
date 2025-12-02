"use client";

import { Resource } from "@/lib/types";
import { GISService } from "@/lib/gis-service";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceCardProps {
  resource: Resource;
  onClose?: () => void;
  className?: string;
}

export function ResourceCard({ resource, onClose, className }: ResourceCardProps) {
  const getResourceIcon = () => {
    switch (resource.type) {
      case "shelter":
        return "🏠";
      case "food":
        return "🍽️";
      case "other":
        return "📍";
      default:
        return "📍";
    }
  };

  const getResourceColor = () => {
    switch (resource.type) {
      case "shelter":
        return "from-blue-500/20 to-blue-600/20 border-blue-500/30";
      case "food":
        return "from-green-500/20 to-green-600/20 border-green-500/30";
      case "other":
        return "from-purple-500/20 to-purple-600/20 border-purple-500/30";
      default:
        return "from-gray-500/20 to-gray-600/20 border-gray-500/30";
    }
  };

  const openInMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div
      className={cn(
        "w-full max-w-lg mx-auto bg-gradient-to-br backdrop-blur-md rounded-3xl border shadow-2xl p-6",
        "animate-in slide-in-from-top-10 duration-500",
        getResourceColor(),
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-5xl" role="img" aria-label={resource.type}>
            {getResourceIcon()}
          </span>
          <div>
            <h3 className="text-2xl font-bold text-white">{resource.name}</h3>
            <p className="text-sm text-white/60 capitalize">{resource.type}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Details */}
      <div className="space-y-3 mb-6">
        {/* Address */}
        <div className="flex items-start gap-3 text-white/90">
          <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm leading-relaxed">{resource.address}</p>
        </div>

        {/* Distance */}
        <div className="flex items-center gap-3 text-white/90">
          <Navigation className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">
            {GISService.formatDistance(resource.distanceMeters)} away
          </p>
        </div>

        {/* Phone (if available) */}
        {resource.metadata?.phone && (
          <div className="flex items-center gap-3 text-white/90">
            <Phone className="w-5 h-5 flex-shrink-0" />
            <a
              href={`tel:${resource.metadata.phone}`}
              className="text-sm hover:underline"
            >
              {resource.metadata.phone}
            </a>
          </div>
        )}

        {/* Hours (if available) */}
        {resource.metadata?.hours && (
          <div className="flex items-start gap-3 text-white/90">
            <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{resource.metadata.hours}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={openInMaps}
          className="flex-1 bg-[var(--coral)] hover:bg-[var(--coral)]/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          Get Directions
        </button>
        {resource.metadata?.phone && (
          <a
            href={`tel:${resource.metadata.phone}`}
            className="flex-1 bg-[var(--sage)] hover:bg-[var(--sage)]/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-center"
          >
            Call Now
          </a>
        )}
      </div>
    </div>
  );
}
