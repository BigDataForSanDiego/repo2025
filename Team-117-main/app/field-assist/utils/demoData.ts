import { ProcessedService, AIResponse, RouteInfo, TransitInfo } from '../types';

// Demo location: Storm Hall #335, San Diego State University
export const DEMO_LOCATION = {
  latitude: 32.7747,
  longitude: -117.0713,
  name: "SDSU Storm Hall",
  description: "5500 Campanile Drive, San Diego, CA 92182"
};

// Nearest major transit stops to SDSU (estimated based on San Diego transit network)
const NEAREST_TRANSIT_STOPS = [
  { name: "SDSU Transit Center", walkTime: 8, distance: 0.4 }, // Estimated campus transit
  { name: "El Cajon Blvd & College Ave", walkTime: 12, distance: 0.6 },
  { name: "College Ave Station", walkTime: 15, distance: 0.8 }
];

// Function to estimate transit time based on distance and location
function estimateTransitTime(distanceMiles: number, walkTimeMins: number, serviceId: string): TransitInfo {
  const nearestStop = NEAREST_TRANSIT_STOPS[0]; // Use closest transit point
  
  // Base calculation factors
  const walkToStopTime = nearestStop.walkTime;
  const averageWaitTime = 8; // Average wait for San Diego transit
  const busSpeedMph = 12; // Average bus speed in urban areas
  const transitTimeMins = Math.round((distanceMiles / busSpeedMph) * 60);
  
  const totalTransitTime = walkToStopTime + averageWaitTime + transitTimeMins;
  
  return {
    time: `~${totalTransitTime} min transit`,
    details: `${walkToStopTime} min walk + ~${averageWaitTime + transitTimeMins} min transit`, 
    via: nearestStop.name,
    serviceId: serviceId // Add service ID for specific routing
  };
}

// Detailed transit directions for each service
export const TRANSIT_DIRECTIONS: { [serviceId: string]: { 
  steps: { instruction: string; details: string; }[];
  route: string;
  line: string;
  exitStation: string;
} } = {
  'san-diego-wesley-house': {
    route: "Route 115",
    line: "Blue Line Express",
    exitStation: "College Station",
    steps: [
      {
        instruction: "Walk west on Campanile Drive toward College Avenue",
        details: "8 minutes (0.4 miles) to College Avenue Transit Center"
      },
      {
        instruction: "Board Route 115 (Blue Line Express) heading WEST toward Kearny Mesa",
        details: "Wait 8 minutes average, runs every 15 minutes during peak hours"
      },
      {
        instruction: "Ride 3 stops and exit at College Station (Clairemont Mesa Blvd)",
        details: "12 minute ride, stay on right side for easy exit"
      },
      {
        instruction: "Walk south on Director Drive toward Wesley House",
        details: "4 minute walk, building will be on your right side"
      }
    ]
  },
  'salvation-army-kroc': {
    route: "Route 7",
    line: "University Avenue Line",
    exitStation: "University & 70th Street",
    steps: [
      {
        instruction: "Walk west on Campanile Drive to College Avenue Transit Center",
        details: "8 minutes (0.4 miles) to main transit hub"
      },
      {
        instruction: "Board Route 7 (University Avenue Line) heading WEST toward City Heights",
        details: "Wait 6 minutes average, frequent service every 12 minutes"
      },
      {
        instruction: "Ride 8 stops and exit at University Avenue & 70th Street",
        details: "18 minute ride, request stop at 70th Street intersection"
      },
      {
        instruction: "Walk north on 70th Street to Kroc Center entrance",
        details: "3 minute walk, large building with Salvation Army signage"
      }
    ]
  },
  'voa-southwest': {
    route: "Green Line + Route 3",
    line: "Green Line to Downtown",
    exitStation: "City College Station",
    steps: [
      {
        instruction: "Walk west to SDSU Transit Center for Green Line Trolley",
        details: "8 minutes to trolley platform, follow green line signs"
      },
      {
        instruction: "Board Green Line Trolley heading WEST toward City College",
        details: "Wait 10 minutes average, trolleys run every 15 minutes"
      },
      {
        instruction: "Ride 6 stops and exit at City College Station (downtown)",
        details: "22 minute trolley ride, stay near doors for quick exit"
      },
      {
        instruction: "Transfer to Route 3 bus heading SOUTH on 25th Street",
        details: "5 minute walk to bus stop, then 8 minute bus ride to E Street"
      },
      {
        instruction: "Exit at 25th & E Street, walk east to VOA building",
        details: "2 minute walk east on E Street, building on south side"
      }
    ]
  },
  'feeding-san-diego-la-mesa': {
    route: "Orange Line",
    line: "Orange Line Trolley",
    exitStation: "Grossmont Center Station",
    steps: [
      {
        instruction: "Walk south on Campanile Drive to SDSU Orange Line Station",
        details: "12 minutes to Orange Line platform, follow orange signs"
      },
      {
        instruction: "Board Orange Line Trolley heading EAST toward Santee",
        details: "Wait 12 minutes average, check schedule for next eastbound trolley"
      },
      {
        instruction: "Ride 4 stops and exit at Grossmont Center Station",
        details: "15 minute trolley ride through La Mesa, prepare to exit right"
      },
      {
        instruction: "Walk north on Grossmont Center Drive to La Mesa Boulevard",
        details: "8 minute walk to La Mesa Boulevard, turn left (west)"
      },
      {
        instruction: "Walk west on La Mesa Boulevard to Feeding San Diego location",
        details: "5 minute walk, look for food distribution signage"
      }
    ]
  },
  'sharp-grossmont-behavioral': {
    route: "Orange Line",
    line: "Orange Line Trolley", 
    exitStation: "Grossmont Station",
    steps: [
      {
        instruction: "Walk south on Campanile Drive to SDSU Orange Line Station",
        details: "12 minutes to Orange Line platform, validate MTS pass"
      },
      {
        instruction: "Board Orange Line Trolley heading EAST toward El Cajon",
        details: "Wait 12 minutes average, eastbound toward Grossmont"
      },
      {
        instruction: "Ride 5 stops and exit at Grossmont Station (Hospital District)",
        details: "18 minute trolley ride, hospital district stop announcement"
      },
      {
        instruction: "Walk north on Grossmont Center Drive toward hospital complex",
        details: "6 minute walk uphill, follow Sharp Healthcare signs"
      },
      {
        instruction: "Enter Sharp Grossmont Hospital, find Behavioral Health wing",
        details: "2 minute walk inside hospital, ask information desk for directions"
      }
    ]
  }
};

// Mock services data based on real San Diego homeless services near SDSU
export const DEMO_SERVICES: ProcessedService[] = [
  {
    id: 'san-diego-wesley-house',
    name: "San Diego Wesley House",
    organization: "San Diego Wesley House",
    address: "4852 Director Dr, San Diego, CA 92121",
    latitude: 32.7728779,
    longitude: -117.0728823,
    phone: "(619) 582-0773",
    website: "https://sdwesleyhouse.org",
    description: "Food pantry, emergency assistance, and support services. Provides groceries and meals to families and individuals in need.",
    categories: ['food', 'hygiene'],
    status: 'open',
    distance: "1.2 miles",
    walkTime: "22 min walk",
    transitTime: estimateTransitTime(1.2, 22, 'san-diego-wesley-house'),
    hours: "Mon-Thu 9am-11am, 1pm-4:30pm; Fri 9am-12pm, 2:30pm-4:30pm",
    eligibility: "Open to all in need",
    capacity: "Walk-ins welcome"
  },
  {
    id: 'salvation-army-kroc',
    name: "Salvation Army Kroc Center",
    organization: "Salvation Army",
    address: "6611 University Ave, San Diego, CA 92115",
    latitude: 32.7694017,
    longitude: -117.0495,
    phone: "(619) 269-1430",
    website: "https://salvationarmysd.org",
    description: "Food distribution, emergency assistance, and family services. Provides groceries and support to families experiencing hardship.",
    categories: ['food', 'shelter'],
    status: 'open',
    distance: "1.8 miles",
    walkTime: "32 min walk",
    transitTime: estimateTransitTime(1.8, 32, 'salvation-army-kroc'),
    hours: "Mon-Thu 8:30am-12pm, 1pm-4:30pm; Food: Fri 8:30am-2pm",
    eligibility: "Must register for food services",
    capacity: "Registration required"
  },
  {
    id: 'voa-southwest',
    name: "Volunteers of America Southwest",
    organization: "Volunteers of America Southwest",
    address: "3350 E St, San Diego, CA 92102",
    latitude: 32.778945,
    longitude: -117.118187,
    phone: "(619) 232-3150",
    website: "https://www.voasw.org/",
    description: "Comprehensive homeless services including emergency shelter, transitional housing, and case management support.",
    categories: ['shelter', 'health', 'mental-health'],
    status: 'open',
    distance: "3.2 miles",
    walkTime: "58 min walk",
    transitTime: estimateTransitTime(3.2, 58, 'voa-southwest'),
    hours: "Mon-Fri 9am-6pm",
    eligibility: "Adults experiencing homelessness",
    capacity: "Call for availability"
  },
  {
    id: 'feeding-san-diego-la-mesa',
    name: "Feeding San Diego - La Mesa",
    organization: "Feeding San Diego",
    address: "8304 La Mesa Blvd, La Mesa, CA 91942",
    latitude: 32.7647435,
    longitude: -117.0232495,
    phone: "(866) 350-3663",
    description: "Food distribution site providing free groceries and fresh produce to individuals and families in need.",
    categories: ['food'],
    status: 'open',
    distance: "2.5 miles",
    walkTime: "45 min walk",
    transitTime: estimateTransitTime(2.5, 45, 'feeding-san-diego-la-mesa'),
    hours: "2nd Wed of month, 1:30pm-2:30pm",
    eligibility: "Proof of residency required",
    capacity: "Walk-ins welcome on distribution days"
  },
  {
    id: 'sharp-grossmont-behavioral',
    name: "Sharp Grossmont Behavioral Health",
    organization: "Sharp Healthcare",
    address: "5555 Grossmont Center Dr, La Mesa, CA 91942",
    latitude: 32.7808025,
    longitude: -117.0070665,
    phone: "(619) 740-5811",
    website: "https://www.sharp.com",
    description: "Mental health and substance abuse treatment services. Provides outpatient counseling, crisis intervention, and psychiatric services.",
    categories: ['mental-health', 'substance-abuse', 'health'],
    status: 'open',
    distance: "2.8 miles",
    walkTime: "51 min walk",
    transitTime: estimateTransitTime(2.8, 51, 'sharp-grossmont-behavioral'),
    hours: "Mon-Fri 8am-4:30pm",
    eligibility: "Insurance accepted, sliding scale available",
    capacity: "Call for appointment"
  }
];

// Mock AI responses for common inputs
export const AI_RESPONSES: { [key: string]: AIResponse } = {
  "food_shelter": {
    identifiedNeeds: ["Emergency food assistance", "Safe overnight shelter"],
    categories: ['food', 'shelter'],
    confidence: 0.95,
    explanation: "I understand you need food assistance and emergency shelter. Let me find the closest services that provide meals and safe places to stay."
  },
  "medical_mental": {
    identifiedNeeds: ["Medical care", "Mental health support"],
    categories: ['health', 'mental-health'],
    confidence: 0.92,
    explanation: "I can help you find medical care and mental health services. Looking for clinics and counseling centers near you."
  },
  "work_shelter": {
    identifiedNeeds: ["Employment assistance", "Temporary housing"],
    categories: ['employment', 'shelter'],
    confidence: 0.88,
    explanation: "I'll help you find job placement services and transitional housing options in your area."
  },
  "hygiene_food": {
    identifiedNeeds: ["Hygiene facilities", "Food assistance"],
    categories: ['hygiene', 'food'],
    confidence: 0.93,
    explanation: "Looking for places where you can get cleaned up and find meals. Searching for facilities with showers and food programs."
  },
  "crisis_shelter": {
    identifiedNeeds: ["Crisis support", "Emergency shelter"],
    categories: ['crisis', 'shelter'],
    confidence: 0.97,
    explanation: "I understand this is urgent. Finding crisis intervention services and emergency shelter options immediately."
  }
};

// Mock route directions for each service from SDSU Storm Hall
export const MOCK_DIRECTIONS: { [serviceId: string]: RouteInfo } = {
  'san-diego-wesley-house': {
    totalDistance: "1.2 miles",
    totalDuration: "22 minutes",
    steps: [
      { instruction: "Head west on Campanile Dr toward College Ave", distance: "0.3 mi" },
      { instruction: "Turn right on College Ave", distance: "0.4 mi" },
      { instruction: "Turn left on Director Dr", distance: "0.5 mi" },
      { instruction: "Destination will be on your right", distance: "" }
    ]
  },
  'salvation-army-kroc': {
    totalDistance: "1.8 miles", 
    totalDuration: "32 minutes",
    steps: [
      { instruction: "Head west on Campanile Dr", distance: "0.3 mi" },
      { instruction: "Turn right on College Ave", distance: "0.8 mi" },
      { instruction: "Turn left on University Ave", distance: "0.7 mi" },
      { instruction: "Destination will be on your left", distance: "" }
    ]
  },
  'voa-southwest': {
    totalDistance: "3.2 miles",
    totalDuration: "58 minutes", 
    steps: [
      { instruction: "Head west on Campanile Dr", distance: "0.5 mi" },
      { instruction: "Turn right on I-8 W", distance: "2.2 mi" },
      { instruction: "Take exit 2A for 25th St", distance: "0.3 mi" },
      { instruction: "Turn left on E St", distance: "0.2 mi" },
      { instruction: "Destination will be on your right", distance: "" }
    ]
  },
  'feeding-san-diego-la-mesa': {
    totalDistance: "2.5 miles",
    totalDuration: "45 minutes",
    steps: [
      { instruction: "Head south on Campanile Dr", distance: "0.8 mi" },
      { instruction: "Turn right on El Cajon Blvd", distance: "1.2 mi" },
      { instruction: "Turn left on La Mesa Blvd", distance: "0.5 mi" },
      { instruction: "Destination will be on your right", distance: "" }
    ]
  },
  'sharp-grossmont-behavioral': {
    totalDistance: "2.8 miles",
    totalDuration: "51 minutes",
    steps: [
      { instruction: "Head east on Campanile Dr", distance: "0.6 mi" },
      { instruction: "Turn right on Jackson Dr", distance: "1.1 mi" },
      { instruction: "Turn left on Grossmont Center Dr", distance: "1.1 mi" },
      { instruction: "Destination will be on your left", distance: "" }
    ]
  }
};

// Function to analyze user input and return mock AI response
export function analyzeDemoInput(input: string): AIResponse {
  const lowercaseInput = input.toLowerCase();
  
  if ((lowercaseInput.includes('food') || lowercaseInput.includes('hungry') || lowercaseInput.includes('eat')) && 
      (lowercaseInput.includes('sleep') || lowercaseInput.includes('shelter') || lowercaseInput.includes('stay'))) {
    return AI_RESPONSES.food_shelter;
  }
  
  if ((lowercaseInput.includes('medical') || lowercaseInput.includes('health')) && 
      (lowercaseInput.includes('mental') || lowercaseInput.includes('therapy') || lowercaseInput.includes('counseling'))) {
    return AI_RESPONSES.medical_mental;
  }
  
  if ((lowercaseInput.includes('work') || lowercaseInput.includes('job') || lowercaseInput.includes('employment')) && 
      (lowercaseInput.includes('housing') || lowercaseInput.includes('shelter'))) {
    return AI_RESPONSES.work_shelter;
  }
  
  if ((lowercaseInput.includes('shower') || lowercaseInput.includes('clean') || lowercaseInput.includes('hygiene')) && 
      (lowercaseInput.includes('food') || lowercaseInput.includes('meal'))) {
    return AI_RESPONSES.hygiene_food;
  }
  
  if (lowercaseInput.includes('crisis') || lowercaseInput.includes('emergency') || lowercaseInput.includes('urgent')) {
    return AI_RESPONSES.crisis_shelter;
  }
  
  // Default response
  return AI_RESPONSES.food_shelter;
}

// Function to filter services based on identified categories
export function filterServicesByCategories(categories: string[]): ProcessedService[] {
  return DEMO_SERVICES.filter(service => 
    service.categories.some(cat => categories.includes(cat))
  ).sort((a, b) => {
    // Sort by distance (convert to numbers for proper sorting)
    const distanceA = parseFloat(a.distance);
    const distanceB = parseFloat(b.distance);
    return distanceA - distanceB;
  }).slice(0, 5); // Return top 5 closest
}