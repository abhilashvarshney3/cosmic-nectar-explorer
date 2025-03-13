import { Message, BirthDetails, BirthChart } from './types';
import { useToast } from '@/hooks/use-toast';
import { getApiServerUrl, API_ENDPOINTS } from './apiConfig';

// Generate a birth chart from birth details
export const generateBirthChart = async (birthDetails: BirthDetails): Promise<BirthChart> => {
  try {
    console.log('Sending birth details to AI agent:', birthDetails);
    const serverUrl = getApiServerUrl();
    
    // First try to use our Python AI agent
    const response = await fetch(`${serverUrl}${API_ENDPOINTS.GENERATE_CHART}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(birthDetails),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Birth chart generated successfully:', data);
      return data;
    }
    
    console.warn('AI agent response failed with status:', response.status);
    console.log('Using fallback data as real API failed');
    
    // Fallback mock data if the agent is not reachable
    return generateMockBirthChart(birthDetails);
  } catch (error) {
    console.error('Error generating birth chart:', error);
    console.log('Using fallback data due to error');
    
    // Fallback to mock data
    return generateMockBirthChart(birthDetails);
  }
};

// Mock birth chart generation when AI agent is not available
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

// Send message to AI agent
export const sendMessage = async (
  message: string, 
  birthDetails?: BirthDetails,
  birthChart?: BirthChart
): Promise<Message> => {
  try {
    // Try to use the AI agent
    if (birthDetails) {
      console.log('Sending message to AI agent:', message);
      const serverUrl = getApiServerUrl();
      
      const response = await fetch(`${serverUrl}${API_ENDPOINTS.CHAT_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          birthDetails,
          birthChart
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Received response from AI agent:', data);
        
        return {
          id: Date.now().toString(),
          content: data.content || data.message || "I received your message but couldn't generate a proper response.",
          sender: 'ai',
          timestamp: new Date(),
          type: data.type || 'text',
          planetaryData: data.planetaryData
        };
      } else {
        console.warn('AI agent returned non-OK response:', response.status);
        console.log('Using fallback responses as API failed');
      }
    }
    
    console.log('Falling back to mock responses as AI agent response failed');
    // Fallback to mock responses
    return mockAiResponse(message);
  } catch (error) {
    console.error('Error sending message to AI agent:', error);
    console.log('Using fallback responses due to error');
    
    // Fallback to mock responses
    return mockAiResponse(message);
  }
};

// Mock AI responses
const mockAiResponse = (message: string): Message => {
  // Simulating API response time
  if (message.toLowerCase().includes('planet') || message.toLowerCase().includes('position')) {
    return {
      id: Date.now().toString(),
      content: "Based on your birth details, here are your planetary positions:",
      sender: 'ai',
      timestamp: new Date(),
      type: 'planetary',
      planetaryData: [
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
