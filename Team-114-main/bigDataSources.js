

// Weather severity scoring
function getWeatherSeverity(temp, conditions) {
  let severity = 0;
  let warnings = [];
  
  if (temp < 32) {
    severity = 10;
    warnings.push("DANGER: Freezing temperatures - Risk of hypothermia");
  } else if (temp < 40) {
    severity = 8;
    warnings.push("COLD: Warm clothing and shelter critical");
  } else if (temp > 95) {
    severity = 9;
    warnings.push("EXTREME HEAT: Risk of heatstroke - Stay hydrated");
  } else if (temp > 85) {
    severity = 6;
    warnings.push("HOT: Drink plenty of water, find shade");
  }
  
  if (conditions.includes('rain') || conditions.includes('storm')) {
    severity += 3;
    warnings.push("Rain expected - Waterproof shelter needed");
  }
  
  return { severity, warnings };
}

/**
 * Local resource availability and free services
 * @type {Object}
 */
const localResources = {
  shelters: {
    capacity: 1200,
    currentOccupancy: 0.85,
    hasWaitingList: true,
    acceptsPets: false
  },
  foodBanks: [
    { name: 'Central Food Bank', hours: 'Mon-Fri 9-5', requirements: 'ID required' },
    { name: 'Community Kitchen', hours: 'Daily 6-8pm', requirements: 'None' }
  ],
  healthServices: {
    freeClinic: 'Tuesdays 10-2pm',
    mentalHealth: 'Walk-ins weekdays',
    substance: '24/7 hotline available'
  }
};

/**
 * Seasonal resource priorities based on weather and availability
 * @type {Object}
 */
const seasonalPriorities = {
  winter: {
    critical: ['Warm jacket', 'Blankets', 'Warm socks', 'Gloves', 'Hat', 'Hot food'],
    important: ['Waterproof jacket', 'Boots', 'Layers', 'Hand warmers'],
    helpful: ['Scarf', 'Thermal underwear'],
    freeResources: [
      'Winter coat drives (Oct-Dec)',
      'Warming centers open when temp < 32°F',
      'Holiday meals at shelters'
    ]
  },
  summer: {
    critical: ['Water bottles', 'Sunscreen', 'Hat', 'Light clothing'],
    important: ['Electrolytes', 'Cooling towel', 'Sunglasses'],
    helpful: ['Portable fan', 'Light-colored clothes'],
    freeResources: [
      'Cooling centers (libraries, malls)',
      'Free water refill stations',
      'Beach showers for cooling off'
    ]
  },
  spring: {
    critical: ['Rain jacket', 'Water bottle', 'Umbrella'],
    important: ['Layers', 'Backpack cover'],
    helpful: ['Extra socks', 'Plastic bags for electronics'],
    freeResources: [
      'Spring clothing drives',
      'Tax prep help for refunds',
      'Job fairs increase'
    ]
  },
  fall: {
    critical: ['Light jacket', 'Layers', 'Waterproof items'],
    important: ['Preparing for winter', 'Extra blankets'],
    helpful: ['Backpack', 'Storage bags'],
    freeResources: [
      'Back-to-school supply drives',
      'Prepare for holiday resources',
      'Fall clothing giveaways'
    ]
  }
};

/**
 * Sample data sources for resource analysis and recommendations
 * @module bigDataSources
 */

/**
 * Homeless population data for priority calculations
 * @type {Object}
 */
const hudHomelessData2024 = {
  nationalStats: {
    totalHomeless: 653104,
    unsheltered: 256610,
    sheltered: 396494
  },
  regionalPriorities: {
    california: { population: 181399, priority: 10 },
    newyork: { population: 74178, priority: 9 },
    florida: { population: 30756, priority: 8 },
    texas: { population: 27377, priority: 7 }
  }
};

module.exports = {
  hudHomelessData2024,
  localResources,
  getWeatherSeverity,
  seasonalPriorities
};
