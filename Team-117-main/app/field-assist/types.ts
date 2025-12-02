export interface TransitInfo {
  time: string;
  details: string;
  via?: string;
  serviceId?: string;
}

export interface ProcessedService {
  id: string;
  name: string;
  organization: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  description: string;
  categories: string[];
  status: 'open' | 'closed' | 'unknown';
  distance: string;
  walkTime: string;
  transitTime?: TransitInfo;
  hours?: string;
  eligibility?: string;
  capacity?: string;
}

export interface DirectionStep {
  instruction: string;
  distance: string;
  duration?: string;
}

export interface RouteInfo {
  steps: DirectionStep[];
  totalDistance: string;
  totalDuration: string;
  mapImageUrl?: string;
}

export interface AIResponse {
  identifiedNeeds: string[];
  categories: string[];
  confidence: number;
  explanation: string;
}

export type ServiceCategory = 
  | 'shelter' 
  | 'food' 
  | 'health' 
  | 'hygiene' 
  | 'mental-health'
  | 'substance-abuse' 
  | 'employment' 
  | 'legal'
  | 'crisis'
  | 'other';

export interface DemoLocation {
  latitude: number;
  longitude: number;
  name: string;
  description: string;
}