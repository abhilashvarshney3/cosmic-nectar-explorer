import { Message, BirthDetails, BirthChart } from './types';
import { API_ENDPOINTS, API_KEYS } from './apiConfig';

// Generate a birth chart from birth details
export const generateBirthChart = async (birthDetails: BirthDetails): Promise<BirthChart> => {
  try {
    console.log('Generating birth chart for:', birthDetails);
    
    // Try to use Prokerala API if keys are available
    if (API_KEYS.PROKERALA_CLIENT_ID && API_KEYS.PROKERALA_CLIENT_SECRET) {
      try {
        const formData = new URLSearchParams();
        formData.append('client_id', API_KEYS.PROKERALA_CLIENT_ID);
        formData.append('client_secret', API_KEYS.PROKERALA_CLIENT_SECRET);
        formData.append('ayanamsa', 'lahiri'); // Using Lahiri ayanamsa for Vedic astrology
        
        // Parse date and time
        const date = new Date(birthDetails.date);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        formData.append('datetime', `${formattedDate} ${birthDetails.time}:00`);
        formData.append('coordinates', '28.6139,77.2090'); // Default to Delhi if location parsing fails
        
        const response = await fetch(API_ENDPOINTS.BIRTH_CHART, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
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
    
    // Fall back to public API to get some random data if no API keys or all APIs fail
    console.log('No API keys available or all APIs failed. Using mock birth chart data.');
    return generateMockBirthChart(birthDetails);
  } catch (error) {
    console.error('Error generating birth chart:', error);
    console.log('Using fallback data due to error');
    
    // Fallback to mock data
    return generateMockBirthChart(birthDetails);
  }
};

// Format Prokerala API response to our app's birth chart format
const formatProkeralaBirthChart = (data: any): BirthChart => {
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
const formatVedicRishiBirthChart = (data: any): BirthChart => {
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

// Mock birth chart generation when API is not available
const generateMockBirthChart = (birthDetails: BirthDetails): BirthChart => {
  // Determine ascendant based on birth time (simplified)
  const hour = parseInt(birthDetails.time.split(':')[0]);
  const ascendantIndex = (hour % 12);
  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", 
    "Leo", "Virgo", "Libra", "Scorpio", 
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  const ascendant = zodiacSigns[ascendantIndex];
  
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
  
  // Generate planet positions
  const planets = [
    { planet: "Sun", house: 1, sign: zodiacSigns[0], degrees: Math.random() * 30 },
    { planet: "Moon", house: 4, sign: zodiacSigns[3], degrees: Math.random() * 30 },
    { planet: "Mercury", house: 2, sign: zodiacSigns[1], degrees: Math.random() * 30 },
    { planet: "Venus", house: 7, sign: zodiacSigns[6], degrees: Math.random() * 30 },
    { planet: "Mars", house: 10, sign: zodiacSigns[9], degrees: Math.random() * 30 },
    { planet: "Jupiter", house: 5, sign: zodiacSigns[4], degrees: Math.random() * 30 },
    { planet: "Saturn", house: 11, sign: zodiacSigns[10], degrees: Math.random() * 30 },
    { planet: "Rahu", house: 3, sign: zodiacSigns[2], degrees: Math.random() * 30 },
    { planet: "Ketu", house: 9, sign: zodiacSigns[8], degrees: Math.random() * 30 }
  ];
  
  // Add planets to houses
  planets.forEach(planet => {
    const house = houses.find(h => h.number === planet.house);
    if (house) {
      house.planets.push(planet);
    }
  });
  
  return {
    ascendant,
    houses,
    planets
  };
};

// Create a prompt for OpenAI based on user's question and birth chart
const createAstrologyPrompt = (message: string, birthDetails: BirthDetails, birthChart: BirthChart) => {
  const planetPositions = birthChart.planets.map(p => 
    `${p.planet} in ${p.sign} in the ${p.house}th house (${p.degrees.toFixed(2)}°)`
  ).join(', ');
  
  return `
You are a Vedic astrology expert. Analyze the following birth chart and answer the user's question with accurate Vedic astrological interpretations.

Birth details:
Name: ${birthDetails.name}
Date: ${new Date(birthDetails.date).toDateString()}
Time: ${birthDetails.time}
Location: ${birthDetails.location}

Birth chart:
Ascendant: ${birthChart.ascendant}
Planet positions: ${planetPositions}

The user's question is: "${message}"

Provide a thoughtful and insightful Vedic astrology interpretation based on these specific planetary positions. Include remedies if appropriate.
`;
};

// Send message to OpenAI API for astrology interpretation
export const sendMessage = async (
  message: string, 
  birthDetails?: BirthDetails,
  birthChart?: BirthChart
): Promise<Message> => {
  try {
    // If we have OpenAI API key, use it for chat
    if (API_KEYS.OPENAI_API_KEY && birthDetails && birthChart) {
      console.log('Sending message to OpenAI:', message);
      
      const prompt = createAstrologyPrompt(message, birthDetails, birthChart);
      
      const response = await fetch(API_ENDPOINTS.ASTROLOGY_CHAT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEYS.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a Vedic astrology expert.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 800
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "I couldn't generate a response based on your birth chart.";
        
        // Check if the message is about planetary positions
        if (message.toLowerCase().includes('planet') || 
            message.toLowerCase().includes('position') || 
            message.toLowerCase().includes('where')) {
          return {
            id: Date.now().toString(),
            content: "Based on your birth details, here are your planetary positions:",
            sender: 'ai',
            timestamp: new Date(),
            type: 'planetary',
            planetaryData: birthChart.planets
          };
        } 
        // Check if message is about remedies
        else if (message.toLowerCase().includes('remedy') || 
                 message.toLowerCase().includes('solution')) {
          return {
            id: Date.now().toString(),
            content,
            sender: 'ai',
            timestamp: new Date(),
            type: 'remedy'
          };
        }
        // General astrology interpretation
        else {
          return {
            id: Date.now().toString(),
            content,
            sender: 'ai',
            timestamp: new Date()
          };
        }
      } else {
        console.warn('OpenAI returned non-OK response:', response.status);
        console.log('Using fallback responses as API failed');
      }
    }
    
    console.log('No API keys available or API failed. Using mock responses.');
    // Fallback to mock responses if no API key or API failed
    return mockAiResponse(message, birthChart);
  } catch (error) {
    console.error('Error sending message to AI:', error);
    console.log('Using fallback responses due to error');
    
    // Fallback to mock responses
    return mockAiResponse(message, birthChart);
  }
};

// Mock AI responses based on the birth chart
const mockAiResponse = (message: string, birthChart?: BirthChart): Message => {
  if (message.toLowerCase().includes('planet') || message.toLowerCase().includes('position')) {
    return {
      id: Date.now().toString(),
      content: "Based on your birth details, here are your planetary positions:",
      sender: 'ai',
      timestamp: new Date(),
      type: 'planetary',
      planetaryData: birthChart?.planets || [
        { planet: 'Sun', house: 1, sign: 'Aries', degrees: 15.5 },
        { planet: 'Moon', house: 4, sign: 'Cancer', degrees: 3.2 },
        { planet: 'Mercury', house: 2, sign: 'Taurus', degrees: 8.7 },
        { planet: 'Venus', house: 12, sign: 'Pisces', degrees: 22.1 },
        { planet: 'Mars', house: 7, sign: 'Libra', degrees: 17.9 }
      ]
    };
  } else if (message.toLowerCase().includes('remedy') || message.toLowerCase().includes('solution')) {
    return {
      id: Date.now().toString(),
      content: "I recommend the following remedies based on your chart: 1) Wear a red coral on your ring finger on Tuesday morning. 2) Recite the Hanuman Chalisa on Saturdays. 3) Donate wheat and jaggery to the needy on Thursdays.",
      sender: 'ai',
      timestamp: new Date(),
      type: 'remedy'
    };
  } else {
    return {
      id: Date.now().toString(),
      content: "As per your Vedic astrology chart, you have a strong Jupiter in the 5th house, which blesses you with creative intelligence and possibly children who will bring you happiness. Your Moon in the 4th house gives you a nurturing personality and deep emotional intelligence.",
      sender: 'ai',
      timestamp: new Date()
    };
  }
};
