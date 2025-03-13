
// API endpoints configuration for our application

// Free Vedic Astrology API endpoints
export const API_ENDPOINTS = {
  // Prokerala API is a reliable free API for Vedic astrology
  BIRTH_CHART: 'https://api.prokerala.com/v2/astrology/birth-chart',
  // Backup API in case the primary one fails
  BACKUP_BIRTH_CHART: 'https://api.vedicrishiastro.com/v1/horoscope',
  // Python backend server endpoints
  PYTHON_SERVER: 'http://localhost:5000',
  GENERATE_CHART: '/vedic_astrology_project/script/generate-birth-chart',
  CHAT_ENDPOINT: '/vedic_astrology_project/script/chat',
};

// API Keys for Vedic Astrology APIs
// Note: For a production app, these should be stored securely on the server
export const API_KEYS = {
  // Replace these with your actual API keys when you get them
  PROKERALA_CLIENT_ID: '',
  PROKERALA_CLIENT_SECRET: '',
  VEDICRISHIASTRO_USER_ID: '',
  VEDICRISHIASTRO_API_KEY: '',
};

export const getApiServerUrl = (): string => {
  return API_ENDPOINTS.PYTHON_SERVER;
};

// Validate if the required API keys are available
export const validateApiKeys = (): boolean => {
  return !!(
    API_KEYS.PROKERALA_CLIENT_ID &&
    API_KEYS.PROKERALA_CLIENT_SECRET || 
    API_KEYS.VEDICRISHIASTRO_USER_ID &&
    API_KEYS.VEDICRISHIASTRO_API_KEY
  );
};
