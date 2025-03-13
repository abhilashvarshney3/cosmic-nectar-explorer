
// API endpoints configuration for our application

// Free Vedic Astrology API endpoints
export const API_ENDPOINTS = {
  // External Vedic Astrology API endpoints
  BIRTH_CHART: 'https://api.prokerala.com/v2/astrology/birth-chart',
  BACKUP_BIRTH_CHART: 'https://api.vedicrishiastro.com/v1/horoscope',
  // Default public API for testing without API keys
  PUBLIC_API: 'https://randomuser.me/api/',
  // Chat API endpoint for GPT-based astrology answers
  ASTROLOGY_CHAT: 'https://api.openai.com/v1/chat/completions',
};

// API Keys for Vedic Astrology APIs
// These will be populated by user input and stored in localStorage
export const API_KEYS = {
  PROKERALA_CLIENT_ID: localStorage.getItem('PROKERALA_CLIENT_ID') || '',
  PROKERALA_CLIENT_SECRET: localStorage.getItem('PROKERALA_CLIENT_SECRET') || '',
  VEDICRISHIASTRO_USER_ID: localStorage.getItem('VEDICRISHIASTRO_USER_ID') || '',
  VEDICRISHIASTRO_API_KEY: localStorage.getItem('VEDICRISHIASTRO_API_KEY') || '',
  OPENAI_API_KEY: localStorage.getItem('OPENAI_API_KEY') || '',
};

// Save API key to localStorage
export const saveApiKey = (keyName: keyof typeof API_KEYS, value: string) => {
  localStorage.setItem(keyName, value);
  (API_KEYS as any)[keyName] = value;
};

// Get server URL based on available API keys
export const getApiServerUrl = (): string => {
  // No server needed as we're using external APIs directly
  return '';
};

// Validate if the required API keys are available
export const validateApiKeys = (): boolean => {
  return !!(
    API_KEYS.PROKERALA_CLIENT_ID && API_KEYS.PROKERALA_CLIENT_SECRET || 
    API_KEYS.VEDICRISHIASTRO_USER_ID && API_KEYS.VEDICRISHIASTRO_API_KEY ||
    API_KEYS.OPENAI_API_KEY
  );
};

// Check if we have at least one API key set
export const hasAnyApiKey = (): boolean => {
  return Object.values(API_KEYS).some(key => !!key);
};
