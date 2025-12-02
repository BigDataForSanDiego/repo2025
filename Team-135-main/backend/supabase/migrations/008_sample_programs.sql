-- Sample Programs Data Migration
-- Adds sample information and learning programs in multiple languages
-- Requirements: 3.2

-- Insert sample programs in English
INSERT INTO programs (title, description, language, voice_enabled, contact_link, category) VALUES
  (
    'Job Training Resources',
    'Connect with local job training programs, resume workshops, and employment services. Get help with job applications, interview preparation, and skill development.',
    'en',
    true,
    'https://workforce.org/programs',
    'employment'
  ),
  (
    'Healthcare Access Guide',
    'Learn about free and low-cost healthcare options including clinics, mental health services, dental care, and prescription assistance programs.',
    'en',
    true,
    'https://health.sandiego.gov/access',
    'health'
  ),
  (
    'Housing Assistance Programs',
    'Information about emergency housing, transitional housing, rental assistance, and permanent supportive housing programs in San Diego County.',
    'en',
    false,
    'https://housing.sandiego.gov/assistance',
    'housing'
  ),
  (
    'Legal Aid Services',
    'Free legal assistance for housing issues, benefits applications, family law, and other civil legal matters. Know your rights and get help.',
    'en',
    true,
    'https://legalaid.org/services',
    'legal'
  ),
  (
    'Education & GED Programs',
    'Adult education classes, GED preparation, English language learning (ESL), computer literacy, and vocational training programs.',
    'en',
    true,
    'https://education.sandiego.gov/adult',
    'education'
  ),
  (
    'Benefits Enrollment Help',
    'Get assistance applying for CalFresh (food stamps), Medi-Cal, General Relief, SSI/SSDI, and other public benefits programs.',
    'en',
    false,
    'https://benefits.ca.gov/enrollment',
    'benefits'
  );

-- Insert sample programs in Spanish
INSERT INTO programs (title, description, language, voice_enabled, contact_link, category) VALUES
  (
    'Recursos de Capacitación Laboral',
    'Conéctese con programas locales de capacitación laboral, talleres de currículum y servicios de empleo. Obtenga ayuda con solicitudes de empleo, preparación para entrevistas y desarrollo de habilidades.',
    'es',
    true,
    'https://workforce.org/programs',
    'employment'
  ),
  (
    'Guía de Acceso a la Salud',
    'Aprenda sobre opciones de atención médica gratuitas y de bajo costo, incluyendo clínicas, servicios de salud mental, atención dental y programas de asistencia con recetas.',
    'es',
    true,
    'https://health.sandiego.gov/access',
    'health'
  ),
  (
    'Programas de Asistencia de Vivienda',
    'Información sobre vivienda de emergencia, vivienda de transición, asistencia de alquiler y programas de vivienda de apoyo permanente en el condado de San Diego.',
    'es',
    false,
    'https://housing.sandiego.gov/assistance',
    'housing'
  ),
  (
    'Servicios de Ayuda Legal',
    'Asistencia legal gratuita para problemas de vivienda, solicitudes de beneficios, derecho familiar y otros asuntos legales civiles. Conozca sus derechos y obtenga ayuda.',
    'es',
    true,
    'https://legalaid.org/services',
    'legal'
  );

-- Add comment for documentation
COMMENT ON TABLE programs IS 
  'Stores information and learning content in multiple languages for the kiosk. 
   Programs can be filtered by language, category, and voice_enabled status.';
