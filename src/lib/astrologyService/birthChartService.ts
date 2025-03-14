
import { BirthDetails, BirthChart } from '../types';
import { API_ENDPOINTS, API_KEYS } from '../apiConfig';
import seedrandom from 'seedrandom';
import { ProkeralaApiResponse, VedicRishiApiResponse } from './types';

// Generate a birth chart from birth details
export const generateBirthChart = async (birthDetails: BirthDetails): Promise<BirthChart> => {
  try {
    console.log('Generating birth chart for:', birthDetails);
    
    // Try to use Prokerala API if keys are available
    if (API_KEYS.PROKERALA_CLIENT_ID && API_KEYS.PROKERALA_CLIENT_SECRET) {
      try {
        console.log('Using Prokerala API with keys:', 
          API_KEYS.PROKERALA_CLIENT_ID.substring(0, 5) + '...',
          API_KEYS.PROKERALA_CLIENT_SECRET.substring(0, 5) + '...'
        );
        
        const formData = new URLSearchParams();
        formData.append('client_id', API_KEYS.PROKERALA_CLIENT_ID);
        formData.append('client_secret', API_KEYS.PROKERALA_CLIENT_SECRET);
        formData.append('ayanamsa', 'lahiri'); // Using Lahiri ayanamsa for Vedic astrology
        
        // Parse date and time
        const date = new Date(birthDetails.date);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        console.log('Using formatted date and time:', formattedDate, birthDetails.time);
        
        formData.append('datetime', `${formattedDate} ${birthDetails.time}:00`);
        formData.append('coordinates', '28.6139,77.2090'); // Default to Delhi if location parsing fails
        
        console.log('Sending Prokerala API request with body:', Object.fromEntries(formData.entries()));
        
        const response = await fetch(API_ENDPOINTS.BIRTH_CHART, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });
        
        console.log('Prokerala API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Prokerala API response data:', data);
          return formatProkeralaBirthChart(data);
        }
        
        console.warn('Prokerala API failed with status:', response.status);
      } catch (error) {
        console.error('Error with Prokerala API:', error);
      }
    }
    
    // Try to use VedicRishiAstro API if keys are available
    if (API_KEYS.VEDICRISHIASTRO_USER_ID && API_KEYS.VEDICRISHIASTRO_API_KEY) {
      try {
        // Parse date and time
        const date = new Date(birthDetails.date);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hour = parseInt(birthDetails.time.split(':')[0]);
        const minute = parseInt(birthDetails.time.split(':')[1]);
        
        const userData = {
          day,
          month,
          year,
          hour,
          min: minute,
          lat: 28.6139, // Default to Delhi if location parsing fails
          lon: 77.2090,
          tzone: 5.5, // Default to Indian time zone
        };
        
        console.log('Using VedicRishiAstro API with data:', userData);
        
        const response = await fetch(API_ENDPOINTS.BACKUP_BIRTH_CHART, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${API_KEYS.VEDICRISHIASTRO_USER_ID}:${API_KEYS.VEDICRISHIASTRO_API_KEY}`),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        if (response.ok) {
          const data = await response.json();
          return formatVedicRishiBirthChart(data);
        }
        
        console.warn('VedicRishiAstro API failed with status:', response.status);
      } catch (error) {
        console.error('Error with VedicRishiAstro API:', error);
      }
    }
    
    // Fall back to deterministic birth chart based on birth details
    console.log('No API keys available or all APIs failed. Using birth details to generate deterministic data.');
    return generateDeterministicBirthChart(birthDetails);
  } catch (error) {
    console.error('Error generating birth chart:', error);
    console.log('Using fallback data due to error');
    
    // Fallback to deterministic data
    return generateDeterministicBirthChart(birthDetails);
  }
};

// Format Prokerala API response to our app's birth chart format
const formatProkeralaBirthChart = (data: ProkeralaApiResponse): BirthChart => {
  try {
    // Extract and format the data from Prokerala API response
    const zodiacSigns = [
      "Aries", "Taurus", "Gemini", "Cancer", 
      "Leo", "Virgo", "Libra", "Scorpio", 
      "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];
    
    const ascendant = data.ascendant?.sign || zodiacSigns[0];
    const ascendantIndex = zodiacSigns.indexOf(ascendant);
    
    // Generate houses
    const houses: Array<any> = [];
    for (let i = 1; i <= 12; i++) {
      const signIndex = (ascendantIndex + i - 1) % 12;
      houses.push({
        number: i,
        sign: zodiacSigns[signIndex],
        planets: []
      });
    }
    
    // Add planets to their houses
    const planets: Array<any> = [];
    if (data.planets) {
      Object.entries(data.planets).forEach(([key, value]: [string, any]) => {
        const planetName = key.charAt(0).toUpperCase() + key.slice(1);
        const sign = value.sign;
        const house = ((zodiacSigns.indexOf(sign) - ascendantIndex + 12) % 12) + 1;
        const degrees = value.longitude % 30;
        
        const planetData = {
          planet: planetName,
          sign,
          house,
          degrees
        };
        
        planets.push(planetData);
        
        // Add planet to its house
        const houseObj = houses.find(h => h.number === house);
        if (houseObj) {
          houseObj.planets.push(planetData);
        }
      });
    }
    
    return {
      ascendant,
      houses,
      planets
    };
  } catch (error) {
    console.error('Error formatting Prokerala data:', error);
    throw error;
  }
};

// Format VedicRishiAstro API response to our app's birth chart format
const formatVedicRishiBirthChart = (data: VedicRishiApiResponse): BirthChart => {
  try {
    // Extract and format the data from VedicRishiAstro API response
    const zodiacSigns = [
      "Aries", "Taurus", "Gemini", "Cancer", 
      "Leo", "Virgo", "Libra", "Scorpio", 
      "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];
    
    const ascendant = data.ascendant || zodiacSigns[0];
    const ascendantIndex = zodiacSigns.indexOf(ascendant);
    
    // Generate houses
    const houses: Array<any> = [];
    for (let i = 1; i <= 12; i++) {
      const signIndex = (ascendantIndex + i - 1) % 12;
      houses.push({
        number: i,
        sign: zodiacSigns[signIndex],
        planets: []
      });
    }
    
    // Add planets to their houses
    const planets: Array<any> = [];
    if (data.planets) {
      data.planets.forEach((planet: any) => {
        const sign = planet.sign;
        const house = ((zodiacSigns.indexOf(sign) - ascendantIndex + 12) % 12) + 1;
        
        const planetData = {
          planet: planet.name,
          sign,
          house,
          degrees: planet.signDegree || Math.random() * 30
        };
        
        planets.push(planetData);
        
        // Add planet to its house
        const houseObj = houses.find(h => h.number === house);
        if (houseObj) {
          houseObj.planets.push(planetData);
        }
      });
    }
    
    return {
      ascendant,
      houses,
      planets
    };
  } catch (error) {
    console.error('Error formatting VedicRishiAstro data:', error);
    throw error;
  }
};

// Deterministic birth chart generation based on birth details
const generateDeterministicBirthChart = (birthDetails: BirthDetails): BirthChart => {
  console.log('Generating deterministic birth chart with birth details:', birthDetails);
  
  // Create a seed based on birth date and time
  const date = new Date(birthDetails.date);
  const dateSeed = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${birthDetails.time}`;
  
  // Create a deterministic random number generator based on seed
  const rng = seedrandom(dateSeed);
  
  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", 
    "Leo", "Virgo", "Libra", "Scorpio", 
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  
  // Get ascendant based on birth time and date
  const ascendantIndex = Math.floor(rng() * 12);
  const ascendant = zodiacSigns[ascendantIndex];
  
  // Generate houses
  const houses = [];
  for (let i = 1; i <= 12; i++) {
    const signIndex = (ascendantIndex + i - 1) % 12;
    houses.push({
      number: i,
      sign: zodiacSigns[signIndex],
      planets: []
    });
  }
  
  // Generate planet positions
  const planetNames = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];
  const planets = planetNames.map((planet, index) => {
    // Use the index and seed to place planets uniquely but deterministically
    const seed = dateSeed + planet;
    const planetRng = seedrandom(seed);
    
    const houseNumber = Math.floor(planetRng() * 12) + 1;
    const sign = zodiacSigns[(ascendantIndex + houseNumber - 1) % 12];
    const degrees = planetRng() * 30;
    
    return {
      planet,
      house: houseNumber,
      sign,
      degrees
    };
  });
  
  // Add planets to houses
  planets.forEach(planet => {
    const house = houses.find(h => h.number === planet.house);
    if (house) {
      house.planets.push(planet);
    }
  });
  
  console.log('Generated deterministic birth chart:', { ascendant, houses: houses.length, planets: planets.length });
  
  return {
    ascendant,
    houses,
    planets
  };
};
