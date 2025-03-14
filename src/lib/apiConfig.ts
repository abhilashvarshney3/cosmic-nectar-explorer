// API endpoints configuration for our application

// Free Vedic Astrology API endpoints
export const API_ENDPOINTS = {
  // Prokerala API endpoints (free tier)
  BIRTH_CHART: 'https://api.prokerala.com/v2/astrology/birth-chart',
  // Free public test API
  PUBLIC_API: 'https://randomuser.me/api/',
  // Free astrology data API
  FREE_ASTROLOGY_API: 'https://json.astrologyapi.com/v1/birth_details',
  // Aztro free horoscope API
  AZTRO_API: 'https://aztro.sameerkumar.website/',
  // Add missing endpoints
  BACKUP_BIRTH_CHART: 'https://api.vedicrishiastro.com/v1/birth_details',
  ASTROLOGY_CHAT: 'https://api.openai.com/v1/chat/completions',
};

// API Keys for Vedic Astrology APIs
// Default to your Prokerala keys
export const API_KEYS = {
  PROKERALA_CLIENT_ID: localStorage.getItem('PROKERALA_CLIENT_ID') || 'a677256b-ad62-4d2b-b484-527ee55d5c2a',
  PROKERALA_CLIENT_SECRET: localStorage.getItem('PROKERALA_CLIENT_SECRET') || 'FqIaaDJ8ZPXHsJHCTXoBzDbAbK67znsjkYCnR4V2',
  // Other API keys are kept empty as we're focusing on free options
  VEDICRISHIASTRO_USER_ID: '',
  VEDICRISHIASTRO_API_KEY: '',
  OPENAI_API_KEY: '',
};

// Save API key to localStorage
export const saveApiKey = (keyName: keyof typeof API_KEYS, value: string) => {
  localStorage.setItem(keyName, value);
  (API_KEYS as any)[keyName] = value;
};

// Validate if the required API keys are available
export const validateApiKeys = (): boolean => {
  // For this configuration, we only need Prokerala
  return !!(API_KEYS.PROKERALA_CLIENT_ID && API_KEYS.PROKERALA_CLIENT_SECRET);
};

// Check if we have Prokerala API keys set
export const hasAnyApiKey = (): boolean => {
  return !!(API_KEYS.PROKERALA_CLIENT_ID && API_KEYS.PROKERALA_CLIENT_SECRET);
};

// Get a list of available free astrology APIs
export const getAvailableApis = (): string[] => {
  const apis = ['Prokerala (Basic Features)'];
  
  // Add other free APIs
  apis.push('Aztro Free Horoscope');
  
  return apis;
};
