// San Diego County City to Zipcode Mapping
// Based on official city boundaries and USPS zipcode assignments

export const cityToZipcodes: Record<string, string[]> = {
  // Central Region
  'San Diego City': [
    '92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109',
    '92110', '92111', '92112', '92113', '92114', '92115', '92116', '92117', '92119',
    '92120', '92121', '92122', '92123', '92124', '92126', '92127', '92128', '92129',
    '92130', '92131', '92132', '92134', '92135', '92136', '92139', '92140', '92145',
    '92147', '92154', '92155', '92158', '92159', '92161', '92162', '92163', '92165',
    '92166', '92167', '92168', '92169', '92170', '92171', '92172', '92173', '92174',
    '92175', '92176', '92177', '92179', '92182', '92186', '92191', '92192', '92193',
    '92194', '92195', '92196', '92197', '92198', '92199'
  ],

  // North Coastal Region
  'Carlsbad': ['92008', '92009', '92010', '92011', '92018'],
  'Oceanside': ['92049', '92054', '92056', '92057', '92058'],
  'Encinitas': ['92024'],
  'Solana Beach': ['92075'],
  'Del Mar': ['92014'],

  // South Region
  'Coronado': ['92118'],
  'National City': ['91950'],
  'Chula Vista': ['91909', '91910', '91911', '91913', '91914', '91915'],
  'Sweetwater': ['91911', '91913'], // Part of Chula Vista
  'Imperial Beach': ['91932'],

  // East Region
  'El Cajon': ['92019', '92020', '92021'],
  'La Mesa': ['91941', '91942', '91943', '91944'],
  'Lemon Grove': ['91945', '91946'],
  'Santee': ['92071', '92072'],
  'Alpine': ['91901', '91903'],
  'Crest-Dehesa': ['91916', '91978'], // Unincorporated area
  'Lakeside': ['92040'],
  'Spring Valley': ['91977', '91978'],
  'Casa de Oro': ['91977'], // Part of Spring Valley

  // North Inland Region
  'Escondido': ['92025', '92026', '92027', '92029', '92030', '92033'],
  'Hidden Meadows': ['92026'], // Part of Escondido area
  'Vista': ['92081', '92083', '92084', '92085'],
  'Bonsall': ['92003'],
  'Poway': ['92064', '92074'],
  'Fallbrook': ['92028'],
  'San Marcos': ['92069', '92078', '92079'],
  'Ramona': ['92065']
};

// Function to get zipcodes for a given city
export function getZipcodesForCity(cityName: string): string[] {
  // Handle variations in city names
  const normalizedCity = cityName
    .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical content
    .replace(/\s*\*$/g, '') // Remove asterisk
    .trim();

  // Direct match
  if (cityToZipcodes[normalizedCity]) {
    return cityToZipcodes[normalizedCity];
  }

  // Handle special cases
  if (normalizedCity.includes('San Diego')) {
    return cityToZipcodes['San Diego City'];
  }
  if (normalizedCity.includes('Chula Vista')) {
    return cityToZipcodes['Chula Vista'];
  }
  if (normalizedCity.includes('Encinitas')) {
    return [...cityToZipcodes['Encinitas'], ...cityToZipcodes['Solana Beach'], ...cityToZipcodes['Del Mar']];
  }
  if (normalizedCity.includes('Escondido')) {
    return [...cityToZipcodes['Escondido'], ...cityToZipcodes['Hidden Meadows']];
  }
  if (normalizedCity.includes('Vista')) {
    return [...cityToZipcodes['Vista'], ...cityToZipcodes['Bonsall']];
  }

  // Return empty array if no match found
  console.warn(`No zipcode mapping found for city: "${cityName}" (normalized: "${normalizedCity}")`);
  return [];
}

// Function to get all unique zipcodes in the dataset
export function getAllZipcodes(): string[] {
  const allZipcodes = new Set<string>();
  Object.values(cityToZipcodes).forEach(zips => {
    zips.forEach(zip => allZipcodes.add(zip));
  });
  return Array.from(allZipcodes).sort();
}