-- Sample Data Migration
-- Inserts sample resources for testing and demonstration
-- Requirements: 2.3

-- ============================================================================
-- SAMPLE SHELTERS
-- ============================================================================

-- San Diego Downtown Shelter
INSERT INTO resources (
  name,
  type,
  latitude,
  longitude,
  is_open,
  phone,
  hours,
  pet_friendly,
  address
) VALUES (
  'San Diego Rescue Mission',
  'shelter',
  32.7157,
  -117.1611,
  true,
  '(619) 819-1200',
  '24/7 - Open daily',
  false,
  '120 Elm Street, San Diego, CA 92101'
);

-- North County Shelter
INSERT INTO resources (
  name,
  type,
  latitude,
  longitude,
  is_open,
  phone,
  hours,
  pet_friendly,
  address
) VALUES (
  'North County Solutions for Change',
  'shelter',
  33.1581,
  -117.3506,
  true,
  '(760) 489-6380',
  'Mon-Sun 8:00 AM - 8:00 PM',
  true,
  '2650 Melbourne Drive, Vista, CA 92081'
);

-- East County Shelter
INSERT INTO resources (
  name,
  type,
  latitude,
  longitude,
  is_open,
  phone,
  hours,
  pet_friendly,
  address
) VALUES (
  'East County Transitional Living Center',
  'shelter',
  32.7943,
  -116.9625,
  true,
  '(619) 442-1397',
  '24/7 - Open daily',
  false,
  '655 Broadway, El Cajon, CA 92021'
);

-- ============================================================================
-- SAMPLE FOOD SITES
-- ============================================================================

-- Downtown Food Bank
INSERT INTO resources (
  name,
  type,
  latitude,
  longitude,
  is_open,
  phone,
  hours,
  pet_friendly,
  address
) VALUES (
  'San Diego Food Bank - Downtown Distribution',
  'food',
  32.7081,
  -117.1569,
  true,
  '(866) 350-3663',
  'Mon-Fri 9:00 AM - 4:00 PM, Sat 9:00 AM - 1:00 PM',
  false,
  '9850 Distribution Avenue, San Diego, CA 92121'
);

-- Community Kitchen
INSERT INTO resources (
  name,
  type,
  latitude,
  longitude,
  is_open,
  phone,
  hours,
  pet_friendly,
  address
) VALUES (
  'Father Joe''s Villages - Dining Hall',
  'food',
  32.7065,
  -117.1514,
  true,
  '(619) 233-8500',
  'Breakfast 6:30-8:00 AM, Lunch 11:30 AM-1:00 PM, Dinner 5:00-6:30 PM',
  false,
  '3350 E Street, San Diego, CA 92102'
);

-- ============================================================================
-- SAMPLE PROGRAMS
-- ============================================================================

-- English Programs
INSERT INTO programs (
  title,
  description,
  language,
  voice_enabled,
  contact_link,
  category
) VALUES 
(
  'Job Training & Placement',
  'Free job training programs and employment assistance for individuals experiencing homelessness. Includes resume building, interview prep, and job placement services.',
  'en',
  true,
  'https://www.sdhomelessness.org/jobs',
  'employment'
),
(
  'Healthcare Access',
  'Connect with free and low-cost healthcare services including medical, dental, and mental health support. Walk-in clinics available.',
  'en',
  true,
  'https://www.sdhomelessness.org/health',
  'health'
),
(
  'Housing Assistance',
  'Learn about emergency housing, transitional housing, and permanent supportive housing options. Get help with housing applications.',
  'en',
  true,
  'https://www.sdhomelessness.org/housing',
  'housing'
);

-- Spanish Programs
INSERT INTO programs (
  title,
  description,
  language,
  voice_enabled,
  contact_link,
  category
) VALUES 
(
  'Capacitación Laboral',
  'Programas gratuitos de capacitación laboral y asistencia de empleo para personas sin hogar. Incluye preparación de currículum y entrevistas.',
  'es',
  true,
  'https://www.sdhomelessness.org/jobs',
  'employment'
),
(
  'Acceso a Atención Médica',
  'Conéctese con servicios de salud gratuitos y de bajo costo, incluyendo atención médica, dental y de salud mental.',
  'es',
  true,
  'https://www.sdhomelessness.org/health',
  'health'
);

-- ============================================================================
-- SAMPLE OUTREACH CONTACTS
-- ============================================================================

INSERT INTO outreach_contacts (
  organization_name,
  contact_phone,
  contact_email,
  service_area,
  available_hours,
  specialties
) VALUES 
(
  'San Diego Homeless Outreach Team',
  '(619) 446-4663',
  'outreach@sdhot.org',
  'Downtown San Diego',
  'Mon-Fri 8:00 AM - 5:00 PM',
  ARRAY['crisis intervention', 'housing navigation', 'benefits assistance']
),
(
  'North County Outreach Services',
  '(760) 631-2050',
  'help@ncoutreach.org',
  'North County',
  '24/7 Emergency Line',
  ARRAY['mental health support', 'substance abuse counseling', 'family services']
);

-- Add comment about sample data
COMMENT ON TABLE resources IS 'Contains resource locations including sample data for demonstration purposes';
