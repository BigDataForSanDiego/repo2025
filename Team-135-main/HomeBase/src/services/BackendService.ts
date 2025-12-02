// Backend Service - Connects to Supabase Edge Functions

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

// Helper function to call Edge Functions
async function callEdgeFunction<T>(
  functionName: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT';
    body?: any;
    params?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = 'GET', body, params } = options;

  // Build URL with query parameters
  let url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
      'apikey': ANON_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok || (data.success === false)) {
    throw new Error(data.error?.message || 'API request failed');
  }

  return data;
}

// Emergency API
export interface EmergencyRequest {
  user_id: string;
  is_danger: boolean;
  location_lat: number;
  location_lng: number;
  additional_info?: string;
}

export interface EmergencyResponse {
  success: boolean;
  request_id: string;
  message: string;
  responder_type: '911' | 'outreach';
}

export const submitEmergency = async (request: EmergencyRequest): Promise<EmergencyResponse> => {
  return callEdgeFunction<EmergencyResponse>('emergency-handler', {
    method: 'POST',
    body: request,
  });
};

// Resources API
export interface Resource {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  distance_meters?: number;
  is_open: boolean;
  phone: string;
  hours: string;
  pet_friendly: boolean;
  verified_on: string;
  address?: string;
}

export interface ResourcesResponse {
  resources: Resource[];
}

export const findResources = async (
  lat: number,
  lng: number,
  options: {
    type?: string;
    radius?: number;
    pet_friendly?: boolean;
    is_open?: boolean;
  } = {}
): Promise<ResourcesResponse> => {
  const params: Record<string, string> = {
    lat: lat.toString(),
    lng: lng.toString(),
  };

  if (options.type) params.type = options.type;
  if (options.radius) params.radius = options.radius.toString();
  if (options.pet_friendly !== undefined) params.pet_friendly = options.pet_friendly.toString();
  if (options.is_open !== undefined) params.is_open = options.is_open.toString();

  return callEdgeFunction<ResourcesResponse>('resource-finder', { params });
};

// Programs/Info API
export interface Program {
  id: string;
  title: string;
  description: string;
  language: string;
  voice_enabled: boolean;
  contact_link: string;
  category: string;
}

export interface ProgramsResponse {
  programs: Program[];
}

export const getPrograms = async (
  options: {
    language?: string;
    category?: string;
    voice_enabled?: boolean;
  } = {}
): Promise<ProgramsResponse> => {
  const params: Record<string, string> = {};

  if (options.language) params.language = options.language;
  if (options.category) params.category = options.category;
  if (options.voice_enabled !== undefined) params.voice_enabled = options.voice_enabled.toString();

  return callEdgeFunction<ProgramsResponse>('info-handler', { params });
};

// Settings API
export interface UserSettings {
  user_id: string;
  voice_on: boolean;
  text_mode: boolean;
  language_pref: string;
  high_contrast: boolean;
  font_size: 'small' | 'medium' | 'large' | 'xlarge';
}

export interface SettingsResponse {
  settings: UserSettings;
}

export const getSettings = async (userId: string): Promise<SettingsResponse> => {
  return callEdgeFunction<SettingsResponse>('get-settings', {
    params: { user_id: userId },
  });
};

export const updateSettings = async (
  settings: Partial<UserSettings> & { user_id: string }
): Promise<{ success: boolean }> => {
  return callEdgeFunction<{ success: boolean }>('update-settings', {
    method: 'PUT',
    body: settings,
  });
};

// Analytics API
export interface UsageLog {
  module: string;
  language: string;
  location_lat?: number;
  location_lng?: number;
}

export const logUsage = async (log: UsageLog): Promise<{ success: boolean }> => {
  return callEdgeFunction<{ success: boolean }>('log-usage', {
    method: 'POST',
    body: log,
  });
};

// Export all as a service object
export const BackendService = {
  emergency: {
    submit: submitEmergency,
  },
  resources: {
    find: findResources,
  },
  programs: {
    get: getPrograms,
  },
  settings: {
    get: getSettings,
    update: updateSettings,
  },
  analytics: {
    logUsage,
  },
};

export default BackendService;
