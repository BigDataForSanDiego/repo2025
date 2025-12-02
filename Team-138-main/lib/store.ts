// Very lightweight in-memory store for demo
export type Client = { id: string; name: string; phone?: string };
export type QueueItem = { roomId: string; clientId: string; createdAt: number; claimedBy?: string };

export type Shelter = {
  id: string;
  name: string;
  type: "temporary" | "permanent";
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  available: number;
  walkingDistance?: string; // in minutes
  transitInfo?: string;
  checkIns: Map<string, { clientId: string; checkIn: number; checkOut?: number }>;
  status?: "funding" | "building" | "ready";
  priority?: "families" | "all";
};

export type Resource = {
  id: string;
  name: string;
  type: "food_bank" | "social_service" | "shelter" | "transportation" | "affordable_grocery";
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  hours?: string;
  walkingDistance?: string;
  description?: string;
};

export type AffordableGrocery = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  hours: string;
  walkingDistance?: string;
  acceptsEBT: boolean;
  acceptsWIC: boolean;
  acceptsSNAP: boolean;
  acceptsSunBucks: boolean;
  description?: string;
  specialPrograms?: string[];
};

export type FoodPantry = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  days: string[]; // ["Monday", "Wednesday", "Friday"]
  hours: string;
  phone?: string;
  walkingDistance?: string;
};

export type HygieneStation = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  services: ("showers" | "restrooms" | "laundry" | "mail" | "storage")[];
  hours: string;
  phone?: string;
  walkingDistance?: string;
  available: boolean;
  lastUpdated: number;
  capacity?: number;
  currentUsers?: number;
};

export type MedicalClinic = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: "urgent_care" | "primary_care" | "mental_health" | "dental" | "specialty";
  acceptsMediCal: boolean;
  acceptsUninsured: boolean;
  walkInAvailable: boolean;
  hours: string;
  phone?: string;
  walkingDistance?: string;
  currentWaitTime?: number; // in minutes
  lastUpdated: number;
};

const mem = {
  clients: new Map<string, Client>(),
  queue: new Map<string, QueueItem>(),
  shelters: new Map<string, Shelter>(),
  resources: new Map<string, Resource>(),
  foodPantries: new Map<string, FoodPantry>(),
  hygieneStations: new Map<string, HygieneStation>(),
  medicalClinics: new Map<string, MedicalClinic>(),
  affordableGroceries: new Map<string, AffordableGrocery>(),
};

export function createClient(name: string, phone?: string) {
  const id = Math.random().toString(36).slice(2, 10);
  const c = { id, name, phone } as Client;
  mem.clients.set(id, c);
  return c;
}

export function getClient(id: string) {
  return mem.clients.get(id) || null;
}

export function createRoom(clientId: string) {
  const roomId = "room_" + Math.random().toString(36).slice(2, 8);
  const item: QueueItem = { roomId, clientId, createdAt: Date.now() };
  mem.queue.set(roomId, item);
  return item;
}

export function claimRoom(roomId: string, staffId: string) {
  const item = mem.queue.get(roomId);
  if (!item) return null;
  item.claimedBy = staffId;
  return item;
}

export function listQueue() {
  return Array.from(mem.queue.values()).sort((a,b)=>a.createdAt-b.createdAt);
}

export function listResources(type?: Resource["type"]) {
  const resources = Array.from(mem.resources.values());
  return type ? resources.filter(r => r.type === type) : resources;
}

export function listFoodPantries() {
  return Array.from(mem.foodPantries.values());
}

export function listHygieneStations() {
  return Array.from(mem.hygieneStations.values());
}

export function listMedicalClinics() {
  return Array.from(mem.medicalClinics.values());
}

export function updateHygieneStation(id: string, available: boolean, currentUsers?: number) {
  const station = mem.hygieneStations.get(id);
  if (!station) return null;
  station.available = available;
  station.lastUpdated = Date.now();
  if (currentUsers !== undefined) station.currentUsers = currentUsers;
  return station;
}

export function updateMedicalClinic(id: string, waitTime?: number) {
  const clinic = mem.medicalClinics.get(id);
  if (!clinic) return null;
  clinic.currentWaitTime = waitTime;
  clinic.lastUpdated = Date.now();
  return clinic;
}

export function listAffordableGroceries() {
  return Array.from(mem.affordableGroceries.values());
}

export function getQueueItem(roomId: string) {
  return mem.queue.get(roomId) || null;
}

// Shelter functions
export function listShelters(type?: "temporary" | "permanent") {
  const shelters = Array.from(mem.shelters.values());
  return type ? shelters.filter(s => s.type === type) : shelters;
}

export function getShelter(id: string) {
  return mem.shelters.get(id) || null;
}

export function checkInShelter(shelterId: string, clientId: string) {
  const shelter = mem.shelters.get(shelterId);
  if (!shelter || shelter.available <= 0) return null;
  const checkInId = Math.random().toString(36).slice(2, 10);
  shelter.checkIns.set(checkInId, { clientId, checkIn: Date.now() });
  shelter.available -= 1;
  return { checkInId, shelter };
}

export function checkOutShelter(shelterId: string, checkInId: string) {
  const shelter = mem.shelters.get(shelterId);
  if (!shelter) return null;
  const checkIn = shelter.checkIns.get(checkInId);
  if (!checkIn) return null;
  checkIn.checkOut = Date.now();
  shelter.available += 1;
  return shelter;
}

// Initialize sample data
function initSampleData() {
  // Temporary Shelters
  const tempShelters: Shelter[] = [
    {
      id: "shelter_1",
      name: "Downtown Emergency Shelter",
      type: "temporary",
      address: "123 Main St, San Diego, CA 92101",
      lat: 32.7157,
      lng: -117.1611,
      capacity: 50,
      available: 12,
      walkingDistance: "15 min",
      transitInfo: "Bus 7, 11 - 2 blocks",
      checkIns: new Map(),
    },
    {
      id: "shelter_2",
      name: "East Village Overnight Shelter",
      type: "temporary",
      address: "1400 Imperial Ave, San Diego, CA 92101",
      lat: 32.7100,
      lng: -117.1550,
      capacity: 75,
      available: 23,
      walkingDistance: "12 min",
      transitInfo: "Bus 3, 7, 11 - 1 block",
      checkIns: new Map(),
    },
    {
      id: "shelter_3",
      name: "North Park Community Shelter",
      type: "temporary",
      address: "2800 University Ave, San Diego, CA 92104",
      lat: 32.7500,
      lng: -117.1300,
      capacity: 40,
      available: 8,
      walkingDistance: "20 min",
      transitInfo: "Bus 2, 10 - 3 blocks",
      checkIns: new Map(),
    },
    {
      id: "shelter_4",
      name: "Mission Valley Emergency Shelter",
      type: "temporary",
      address: "5500 Friars Rd, San Diego, CA 92110",
      lat: 32.7700,
      lng: -117.1700,
      capacity: 60,
      available: 15,
      walkingDistance: "30 min",
      transitInfo: "Bus 6, 8, Trolley Green Line - 5 blocks",
      checkIns: new Map(),
    },
  ];

  // Permanent Shelters
  const permShelters: Shelter[] = [
    {
      id: "shelter_perm_1",
      name: "Family First Housing Complex",
      type: "permanent",
      address: "456 Oak Ave, San Diego, CA 92102",
      lat: 32.7200,
      lng: -117.1500,
      capacity: 20,
      available: 5,
      status: "ready",
      priority: "families",
      walkingDistance: "25 min",
      transitInfo: "Bus 3, 5 - 3 blocks",
      checkIns: new Map(),
    },
    {
      id: "shelter_perm_2",
      name: "Hope Village (Under Construction)",
      type: "permanent",
      address: "789 Pine St, San Diego, CA 92103",
      lat: 32.7300,
      lng: -117.1400,
      capacity: 30,
      available: 0,
      status: "building",
      priority: "all",
      checkIns: new Map(),
    },
    {
      id: "shelter_perm_3",
      name: "Sunset Heights Permanent Housing",
      type: "permanent",
      address: "3200 5th Ave, San Diego, CA 92103",
      lat: 32.7400,
      lng: -117.1600,
      capacity: 25,
      available: 3,
      status: "ready",
      priority: "families",
      walkingDistance: "18 min",
      transitInfo: "Bus 2, 7 - 2 blocks",
      checkIns: new Map(),
    },
    {
      id: "shelter_perm_4",
      name: "Ocean View Supportive Housing",
      type: "permanent",
      address: "1200 Ocean Beach Blvd, San Diego, CA 92107",
      lat: 32.7500,
      lng: -117.2500,
      capacity: 35,
      available: 7,
      status: "ready",
      priority: "all",
      walkingDistance: "22 min",
      transitInfo: "Bus 35 - 4 blocks",
      checkIns: new Map(),
    },
    {
      id: "shelter_perm_5",
      name: "Liberty Station Housing Project",
      type: "permanent",
      address: "2455 Cushing Rd, San Diego, CA 92106",
      lat: 32.7200,
      lng: -117.2200,
      capacity: 40,
      available: 0,
      status: "funding",
      priority: "families",
      checkIns: new Map(),
    },
    {
      id: "shelter_perm_6",
      name: "Chula Vista Family Housing",
      type: "permanent",
      address: "300 3rd Ave, Chula Vista, CA 91910",
      lat: 32.6400,
      lng: -117.0800,
      capacity: 28,
      available: 4,
      status: "ready",
      priority: "families",
      walkingDistance: "15 min",
      transitInfo: "Bus 701, 705 - 2 blocks",
      checkIns: new Map(),
    },
  ];

  tempShelters.forEach(s => mem.shelters.set(s.id, s));
  permShelters.forEach(s => mem.shelters.set(s.id, s));

  // Community Resources
  const resources: Resource[] = [
    {
      id: "res_1",
      name: "San Diego Food Bank",
      type: "food_bank",
      address: "9850 Distribution Ave, San Diego, CA 92121",
      lat: 32.9000,
      lng: -117.2000,
      phone: "(858) 527-1419",
      hours: "Mon-Fri 8am-4pm",
      walkingDistance: "45 min",
      description: "Main food distribution center serving all of San Diego County",
    },
    {
      id: "res_2",
      name: "211 San Diego",
      type: "social_service",
      address: "Multiple locations",
      lat: 32.7157,
      lng: -117.1611,
      phone: "211",
      hours: "24/7",
      description: "Comprehensive resource referral service - call 211 anytime",
    },
    {
      id: "res_3",
      name: "San Diego County Health & Human Services",
      type: "social_service",
      address: "1600 Pacific Hwy, San Diego, CA 92101",
      lat: 32.7200,
      lng: -117.1700,
      phone: "(858) 495-5500",
      hours: "Mon-Fri 8am-5pm",
      walkingDistance: "20 min",
      description: "County services including CalFresh, Medi-Cal, and general assistance",
    },
    {
      id: "res_4",
      name: "Regional Transportation Center",
      type: "transportation",
      address: "1250 Imperial Ave, San Diego, CA 92101",
      lat: 32.7150,
      lng: -117.1600,
      phone: "(619) 233-3004",
      hours: "Daily 5am-12am",
      walkingDistance: "10 min",
      description: "Central transit hub with bus and trolley connections",
    },
    {
      id: "res_5",
      name: "San Diego Public Library - Central",
      type: "social_service",
      address: "330 Park Blvd, San Diego, CA 92101",
      lat: 32.7200,
      lng: -117.1600,
      phone: "(619) 236-5800",
      hours: "Mon-Thu 9:30am-7pm, Fri-Sat 9:30am-6pm, Sun 1-5pm",
      walkingDistance: "15 min",
      description: "Free WiFi, computer access, job resources, and community programs",
    },
    {
      id: "res_6",
      name: "San Diego Rescue Mission",
      type: "social_service",
      address: "120 Elm St, San Diego, CA 92101",
      lat: 32.7100,
      lng: -117.1600,
      phone: "(619) 687-3720",
      hours: "24/7",
      walkingDistance: "8 min",
      description: "Emergency shelter, meals, and recovery programs",
    },
    {
      id: "res_7",
      name: "Alpha Project",
      type: "social_service",
      address: "3737 5th Ave, San Diego, CA 92103",
      lat: 32.7400,
      lng: -117.1600,
      phone: "(619) 542-1877",
      hours: "Mon-Fri 8am-5pm",
      walkingDistance: "18 min",
      description: "Housing, employment, and support services",
    },
    {
      id: "res_8",
      name: "PATH San Diego",
      type: "social_service",
      address: "1250 6th Ave, San Diego, CA 92101",
      lat: 32.7150,
      lng: -117.1550,
      phone: "(619) 374-0088",
      hours: "Mon-Fri 8am-5pm",
      walkingDistance: "12 min",
      description: "Housing navigation and case management services",
    },
  ];

  resources.forEach(r => mem.resources.set(r.id, r));

  // Food Pantries
  const pantries: FoodPantry[] = [
    {
      id: "pantry_1",
      name: "St. Vincent de Paul",
      address: "1501 Imperial Ave, San Diego, CA 92101",
      lat: 32.7100,
      lng: -117.1600,
      days: ["Monday", "Wednesday", "Friday"],
      hours: "9am-12pm",
      phone: "(619) 233-8500",
      walkingDistance: "10 min",
    },
    {
      id: "pantry_2",
      name: "Father Joe's Villages",
      address: "3350 E St, San Diego, CA 92102",
      lat: 32.7200,
      lng: -117.1500,
      days: ["Tuesday", "Thursday", "Saturday"],
      hours: "10am-2pm",
      phone: "(619) 446-2100",
      walkingDistance: "20 min",
    },
    {
      id: "pantry_3",
      name: "San Diego Food Bank - Downtown Distribution",
      address: "1764 National Ave, San Diego, CA 92113",
      lat: 32.7000,
      lng: -117.1400,
      days: ["Monday", "Wednesday", "Friday"],
      hours: "8am-11am",
      phone: "(858) 527-1419",
      walkingDistance: "25 min",
    },
    {
      id: "pantry_4",
      name: "North Park Community Food Pantry",
      address: "2727 University Ave, San Diego, CA 92104",
      lat: 32.7500,
      lng: -117.1300,
      days: ["Tuesday", "Thursday"],
      hours: "1pm-4pm",
      phone: "(619) 297-4363",
      walkingDistance: "18 min",
    },
    {
      id: "pantry_5",
      name: "Ocean Beach Food Pantry",
      address: "4901 Santa Monica Ave, San Diego, CA 92107",
      lat: 32.7500,
      lng: -117.2500,
      days: ["Monday", "Friday"],
      hours: "10am-1pm",
      phone: "(619) 224-1636",
      walkingDistance: "15 min",
    },
    {
      id: "pantry_6",
      name: "Chula Vista Food Bank",
      address: "800 3rd Ave, Chula Vista, CA 91910",
      lat: 32.6400,
      lng: -117.0800,
      days: ["Monday", "Wednesday", "Friday", "Saturday"],
      hours: "9am-12pm",
      phone: "(619) 476-9144",
      walkingDistance: "12 min",
    },
    {
      id: "pantry_7",
      name: "El Cajon Community Food Bank",
      address: "101 S Magnolia Ave, El Cajon, CA 92020",
      lat: 32.8000,
      lng: -116.9600,
      days: ["Tuesday", "Thursday", "Saturday"],
      hours: "10am-2pm",
      phone: "(619) 444-3663",
      walkingDistance: "20 min",
    },
    {
      id: "pantry_8",
      name: "National City Food Distribution",
      address: "140 E 12th St, National City, CA 91950",
      lat: 32.6800,
      lng: -117.1000,
      days: ["Wednesday", "Saturday"],
      hours: "9am-12pm",
      phone: "(619) 336-4250",
      walkingDistance: "22 min",
    },
    {
      id: "pantry_9",
      name: "La Mesa Community Food Bank",
      address: "8384 La Mesa Blvd, La Mesa, CA 91942",
      lat: 32.7700,
      lng: -117.0200,
      days: ["Monday", "Thursday"],
      hours: "11am-2pm",
      phone: "(619) 464-4357",
      walkingDistance: "25 min",
    },
    {
      id: "pantry_10",
      name: "Escondido Food Bank",
      address: "215 W 2nd Ave, Escondido, CA 92025",
      lat: 33.1200,
      lng: -117.0800,
      days: ["Tuesday", "Friday"],
      hours: "9am-12pm",
      phone: "(760) 745-4493",
      walkingDistance: "30 min",
    },
  ];

  pantries.forEach(p => mem.foodPantries.set(p.id, p));

  // Hygiene Stations
  const hygieneStations: HygieneStation[] = [
    {
      id: "hygiene_1",
      name: "Downtown Hygiene Center",
      address: "1400 Imperial Ave, San Diego, CA 92101",
      lat: 32.7100,
      lng: -117.1550,
      services: ["showers", "restrooms", "laundry", "mail"],
      hours: "Daily 6am-8pm",
      phone: "(619) 233-8500",
      walkingDistance: "12 min",
      available: true,
      lastUpdated: Date.now(),
      capacity: 20,
      currentUsers: 8,
    },
    {
      id: "hygiene_2",
      name: "Father Joe's Villages - Hygiene Services",
      address: "3350 E St, San Diego, CA 92102",
      lat: 32.7200,
      lng: -117.1500,
      services: ["showers", "restrooms", "laundry", "storage"],
      hours: "Mon-Sat 7am-6pm",
      phone: "(619) 446-2100",
      walkingDistance: "20 min",
      available: true,
      lastUpdated: Date.now(),
      capacity: 30,
      currentUsers: 15,
    },
    {
      id: "hygiene_3",
      name: "North Park Community Hygiene Station",
      address: "2800 University Ave, San Diego, CA 92104",
      lat: 32.7500,
      lng: -117.1300,
      services: ["showers", "restrooms"],
      hours: "Tue-Sat 9am-4pm",
      phone: "(619) 297-4363",
      walkingDistance: "18 min",
      available: true,
      lastUpdated: Date.now(),
      capacity: 10,
      currentUsers: 3,
    },
    {
      id: "hygiene_4",
      name: "Ocean Beach Hygiene Center",
      address: "4901 Santa Monica Ave, San Diego, CA 92107",
      lat: 32.7500,
      lng: -117.2500,
      services: ["showers", "restrooms", "laundry"],
      hours: "Mon-Fri 8am-5pm",
      phone: "(619) 224-1636",
      walkingDistance: "15 min",
      available: false,
      lastUpdated: Date.now(),
      capacity: 15,
      currentUsers: 15,
    },
    {
      id: "hygiene_5",
      name: "Chula Vista Hygiene Services",
      address: "800 3rd Ave, Chula Vista, CA 91910",
      lat: 32.6400,
      lng: -117.0800,
      services: ["showers", "restrooms", "mail"],
      hours: "Mon-Wed-Fri 10am-3pm",
      phone: "(619) 476-9144",
      walkingDistance: "12 min",
      available: true,
      lastUpdated: Date.now(),
      capacity: 12,
      currentUsers: 5,
    },
  ];

  hygieneStations.forEach(h => mem.hygieneStations.set(h.id, h));

  // Medical Clinics
  const medicalClinics: MedicalClinic[] = [
    {
      id: "medical_1",
      name: "Downtown Community Health Center",
      address: "1809 National Ave, San Diego, CA 92113",
      lat: 32.7000,
      lng: -117.1400,
      type: "primary_care",
      acceptsMediCal: true,
      acceptsUninsured: true,
      walkInAvailable: true,
      hours: "Mon-Fri 8am-5pm, Sat 9am-1pm",
      phone: "(619) 515-2300",
      walkingDistance: "25 min",
      currentWaitTime: 45,
      lastUpdated: Date.now(),
    },
    {
      id: "medical_2",
      name: "Family Health Centers - Logan Heights",
      address: "1809 National Ave, San Diego, CA 92113",
      lat: 32.7000,
      lng: -117.1400,
      type: "primary_care",
      acceptsMediCal: true,
      acceptsUninsured: true,
      walkInAvailable: true,
      hours: "Mon-Fri 8am-5pm",
      phone: "(619) 515-2300",
      walkingDistance: "25 min",
      currentWaitTime: 30,
      lastUpdated: Date.now(),
    },
    {
      id: "medical_3",
      name: "San Diego County Mental Health Crisis Line",
      address: "Multiple locations",
      lat: 32.7157,
      lng: -117.1611,
      type: "mental_health",
      acceptsMediCal: true,
      acceptsUninsured: true,
      walkInAvailable: true,
      hours: "24/7",
      phone: "(888) 724-7240",
      walkingDistance: "Varies",
      currentWaitTime: 0,
      lastUpdated: Date.now(),
    },
    {
      id: "medical_4",
      name: "North Park Urgent Care",
      address: "2727 University Ave, San Diego, CA 92104",
      lat: 32.7500,
      lng: -117.1300,
      type: "urgent_care",
      acceptsMediCal: true,
      acceptsUninsured: true,
      walkInAvailable: true,
      hours: "Daily 8am-8pm",
      phone: "(619) 297-4300",
      walkingDistance: "18 min",
      currentWaitTime: 60,
      lastUpdated: Date.now(),
    },
    {
      id: "medical_5",
      name: "San Diego Rescue Mission Medical Clinic",
      address: "120 Elm St, San Diego, CA 92101",
      lat: 32.7100,
      lng: -117.1600,
      type: "primary_care",
      acceptsMediCal: true,
      acceptsUninsured: true,
      walkInAvailable: true,
      hours: "Mon-Thu 9am-3pm",
      phone: "(619) 687-3720",
      walkingDistance: "8 min",
      currentWaitTime: 20,
      lastUpdated: Date.now(),
    },
    {
      id: "medical_6",
      name: "Family Health Centers - City Heights",
      address: "5454 El Cajon Blvd, San Diego, CA 92115",
      lat: 32.7600,
      lng: -117.0900,
      type: "primary_care",
      acceptsMediCal: true,
      acceptsUninsured: true,
      walkInAvailable: true,
      hours: "Mon-Fri 8am-5pm",
      phone: "(619) 515-2300",
      walkingDistance: "30 min",
      currentWaitTime: 40,
      lastUpdated: Date.now(),
    },
    {
      id: "medical_7",
      name: "San Diego Dental Health Clinic",
      address: "1501 Imperial Ave, San Diego, CA 92101",
      lat: 32.7100,
      lng: -117.1600,
      type: "dental",
      acceptsMediCal: true,
      acceptsUninsured: true,
      walkInAvailable: false,
      hours: "Mon-Fri 8am-4pm",
      phone: "(619) 233-8500",
      walkingDistance: "10 min",
      lastUpdated: Date.now(),
    },
  ];

  medicalClinics.forEach(m => mem.medicalClinics.set(m.id, m));

  // Affordable Grocery Stores
  const affordableGroceries: AffordableGrocery[] = [
    {
      id: "grocery_1",
      name: "Mother's Nutritional Center - San Diego",
      address: "Multiple locations in San Diego County",
      lat: 32.7157,
      lng: -117.1611,
      phone: "(562) 293-4280",
      hours: "Varies by location - Check store locator",
      walkingDistance: "Varies",
      acceptsEBT: true,
      acceptsWIC: true,
      acceptsSNAP: true,
      acceptsSunBucks: true,
      description: "Affordable grocery store designed for low-income individuals, single mothers, and families. Fresh produce, eWIC approved items, and competitive pricing. No judgment, personalized service.",
      specialPrograms: ["eWIC Program", "+ADDMILK Program", "SUN BUCKS Program", "CalFresh F&V EBT Pilot"],
    },
    {
      id: "grocery_2",
      name: "Northgate Market",
      address: "Multiple locations throughout San Diego",
      lat: 32.7500,
      lng: -117.1300,
      phone: "Varies by location",
      hours: "Daily 7am-10pm (varies)",
      walkingDistance: "Varies",
      acceptsEBT: true,
      acceptsWIC: true,
      acceptsSNAP: true,
      acceptsSunBucks: false,
      description: "Affordable Latino grocery chain with fresh produce, meat, and everyday essentials at competitive prices.",
    },
    {
      id: "grocery_3",
      name: "Food 4 Less",
      address: "Multiple locations in San Diego County",
      lat: 32.7200,
      lng: -117.1600,
      phone: "Varies by location",
      hours: "Daily 6am-12am (varies)",
      walkingDistance: "Varies",
      acceptsEBT: true,
      acceptsWIC: true,
      acceptsSNAP: true,
      acceptsSunBucks: false,
      description: "Discount grocery store with low prices on groceries, produce, and household items. Accepts EBT and WIC.",
    },
    {
      id: "grocery_4",
      name: "Smart & Final",
      address: "Multiple locations in San Diego County",
      lat: 32.7400,
      lng: -117.1500,
      phone: "Varies by location",
      hours: "Daily 6am-10pm (varies)",
      walkingDistance: "Varies",
      acceptsEBT: true,
      acceptsWIC: false,
      acceptsSNAP: true,
      acceptsSunBucks: false,
      description: "Warehouse-style grocery store with bulk items and everyday low prices. Good for families buying in larger quantities.",
    },
    {
      id: "grocery_5",
      name: "99 Cents Only Stores",
      address: "Multiple locations throughout San Diego",
      lat: 32.7100,
      lng: -117.1400,
      phone: "Varies by location",
      hours: "Daily 8am-9pm (varies)",
      walkingDistance: "Varies",
      acceptsEBT: true,
      acceptsWIC: false,
      acceptsSNAP: true,
      acceptsSunBucks: false,
      description: "Discount store with many items at $0.99. Offers groceries, produce, household items, and more at very affordable prices.",
    },
  ];

  affordableGroceries.forEach(g => mem.affordableGroceries.set(g.id, g));
}

// Initialize on first import
if (mem.shelters.size === 0) {
  initSampleData();
}

