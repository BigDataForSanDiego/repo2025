#!/usr/bin/env npx tsx

import { processAllPITCData } from './transformPITCData';
import { generateAllGetItDoneData } from './generateGetItDoneData';

console.log('🚀 Starting mock data generation...');

try {
  console.log('\n📊 Processing PITC data...');
  processAllPITCData();
  
  console.log('\n📋 Generating Get-It-Done reports...');
  generateAllGetItDoneData();
  
  console.log('\n✅ Mock data generation completed successfully!');
  console.log('\nFiles generated:');
  console.log('- public/mock-csv/pit_counts.csv (Point-in-Time counts)');
  console.log('- public/mock-csv/get_it_done/*.csv (Monthly Get-It-Done reports)');
  
} catch (error) {
  console.error('❌ Error generating mock data:', error);
  process.exit(1);
}