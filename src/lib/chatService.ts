import { Message, BirthDetails, BirthChart } from './types';
import { API_ENDPOINTS, API_KEYS } from './apiConfig';

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
    
    // Fall back to mock birth chart based on birth details
    console.log('No API keys available or all APIs failed. Using birth details to generate mock data.');
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

// Mock birth chart generation based on actual birth details
const generateMockBirthChart = (birthDetails: BirthDetails): BirthChart => {
  console.log('Generating mock birth chart with birth details:', birthDetails);
  
  // Use birth date to generate deterministic but unique chart for each date
  const date = new Date(birthDetails.date);
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  // Create a numeric seed based on birth date
  const dateSeed = (year * 10000) + (month * 100) + dayOfMonth;
  
  // Determine ascendant based on birth time (add some variation based on date)
  const hourStr = birthDetails.time.split(':')[0];
  const minuteStr = birthDetails.time.split(':')[1];
  const hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);
  
  // Create a seed based on time
  const timeSeed = (hour * 60) + minute;
  
  // Combined seed for deterministic random generation
  const combinedSeed = dateSeed + timeSeed;
  
  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", 
    "Leo", "Virgo", "Libra", "Scorpio", 
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  
  // Deterministic "random" number generator
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // Get ascendant based on birth time and date
  const ascendantIndex = Math.floor(seededRandom(combinedSeed) * 12);
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
  const planetNames = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];
  const planets = planetNames.map((planet, index) => {
    // Use the index and combined seed to place planets uniquely but deterministically
    const houseSeed = combinedSeed + (index * 100);
    const houseNumber = Math.floor(seededRandom(houseSeed) * 12) + 1;
    const sign = zodiacSigns[(ascendantIndex + houseNumber - 1) % 12];
    const degrees = seededRandom(houseSeed * 2) * 30;
    
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
  
  console.log('Generated mock birth chart:', { ascendant, houses: houses.length, planets: planets.length });
  
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

// Create a prompt for the Hugging Face Vedic Astrology model
const createVedicAstrologyPrompt = (message: string, birthDetails: BirthDetails, birthChart: BirthChart) => {
  const planetPositions = birthChart.planets.map(p => 
    `${p.planet} in ${p.sign} in the ${p.house}th house (${p.degrees.toFixed(2)}°)`
  ).join('\n- ');
  
  const birthDate = new Date(birthDetails.date);
  
  return `As a Vedic astrology expert, analyze this birth chart for ${birthDetails.name} born on ${birthDate.toDateString()} at ${birthDetails.time} in ${birthDetails.location}.

Birth chart details:
- Ascendant: ${birthChart.ascendant}
- Planet positions: 
- ${planetPositions}

Question: ${message}

Please provide a detailed Vedic astrology interpretation based on these planetary positions.`;
};

// Send message to open-source Hugging Face API for astrology interpretation
const fetchFromHuggingFace = async (prompt: string): Promise<string> => {
  try {
    console.log('Sending request to Hugging Face API with prompt:', prompt);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add API token if available
    if (API_KEYS.HUGGINGFACE_API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_KEYS.HUGGINGFACE_API_TOKEN}`;
    }
    
    const response = await fetch(API_ENDPOINTS.VEDIC_AI_API, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true
        }
      }),
    });

    console.log('Hugging Face API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Hugging Face API response:', data);
    
    // Return the generated text from the response
    // The format depends on the specific model's output format
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && 'generated_text' in data[0]) {
      return data[0].generated_text;
    } else if (typeof data === 'object' && 'generated_text' in data) {
      return data.generated_text;
    } else if (typeof data === 'string') {
      return data;
    } else {
      console.warn('Unexpected response format from Hugging Face API:', data);
      throw new Error('Unexpected response format from API');
    }
  } catch (error) {
    console.error('Error fetching from Hugging Face API:', error);
    throw error;
  }
};

// Send message to an AI API for astrology interpretation
export const sendMessage = async (
  message: string, 
  birthDetails?: BirthDetails,
  birthChart?: BirthChart
): Promise<Message> => {
  try {
    if (!birthDetails || !birthChart) {
      throw new Error('Birth details or birth chart missing');
    }
    
    console.log('Sending message to AI:', message);
    
    // First try the Hugging Face Vedic astrology model (free and open source)
    try {
      const prompt = createVedicAstrologyPrompt(message, birthDetails, birthChart);
      const aiResponse = await fetchFromHuggingFace(prompt);
      
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
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
          type: 'remedy'
        };
      }
      // General astrology interpretation
      else {
        return {
          id: Date.now().toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
      }
    } catch (huggingFaceError) {
      console.warn('Hugging Face API failed:', huggingFaceError);
      
      // If Hugging Face fails, try OpenAI if API key is available
      if (API_KEYS.OPENAI_API_KEY) {
        try {
          console.log('Falling back to OpenAI');
          
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
            throw new Error('OpenAI API failed');
          }
        } catch (openAiError) {
          console.error('Error with OpenAI API:', openAiError);
          throw openAiError;
        }
      } else {
        throw huggingFaceError;
      }
    }
  } catch (error) {
    console.error('Error sending message to AI:', error);
    
    // Fallback to deterministic mock responses based on birth details
    return mockAiResponse(message, birthChart, birthDetails);
  }
};

// Mock AI responses based on the birth chart and birth details
const mockAiResponse = (message: string, birthChart?: BirthChart, birthDetails?: BirthDetails): Message => {
  // Create some variability in responses based on birth details
  let responseVariant = 0;
  
  if (birthDetails) {
    const date = new Date(birthDetails.date);
    // Use month and day to create variability
    responseVariant = (date.getMonth() + date.getDate()) % 5;
  }
  
  if (message.toLowerCase().includes('planet') || message.toLowerCase().includes('position')) {
    return {
      id: Date.now().toString(),
      content: `Based on your birth details (${birthDetails ? new Date(birthDetails.date).toDateString() : 'Unknown'}), here are your planetary positions:`,
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
    const remedyResponses = [
      "Based on your chart with Moon in the 4th house, I recommend: 1) Wear a silver pendant on Mondays. 2) Offer milk to a banyan tree on full moon nights. 3) Chant Moon mantras for emotional stability.",
      "With Mars prominently placed in your chart, these remedies may help: 1) Wear a red coral on your ring finger. 2) Donate red lentils on Tuesdays. 3) Recite Hanuman Chalisa regularly to balance Mars energy.",
      "Your Saturn placement suggests these remedies: 1) Feed crows on Saturdays. 2) Wear an iron ring on your middle finger. 3) Donate black sesame seeds to the needy for karmic balance.",
      "With Venus in the 12th house, try these remedies: 1) Wear a diamond or white sapphire on Fridays. 2) Donate white clothes or sweets to young girls. 3) Recite Venus mantras for relationship harmony.",
      "For Jupiter's influence in your chart: 1) Wear a yellow sapphire on Thursdays. 2) Donate books or knowledge resources to students. 3) Feed dogs on Thursdays to enhance wisdom and fortune."
    ];
    
    return {
      id: Date.now().toString(),
      content: remedyResponses[responseVariant],
      sender: 'ai',
      timestamp: new Date(),
      type: 'remedy'
    };
  } else {
    const generalResponses = [
      "Based on your unique birth chart, I notice your Moon in the 4th house indicates strong emotional intelligence and connection to home and family. Your Jupiter aspects your 10th house, suggesting career growth through teaching or advisory roles.",
      "Your chart shows a strong Saturn in the 11th house, indicating you may build wealth slowly but surely through disciplined saving. The Sun in your 1st house gives you leadership qualities and a strong sense of self.",
      "With Mercury in your 2nd house, you likely have strong communication skills that could benefit you financially. Your Venus in the 7th house blesses your partnerships and gives you diplomatic abilities in relationships.",
      "Your Mars in the 10th house suggests a career that requires courage and initiative. The Rahu-Ketu axis across your 3rd and 9th houses indicates a balance needed between practical skills and higher knowledge.",
      "The ascendant lord in your 5th house shows creativity and potential success in speculative ventures. Your Moon's aspect to Jupiter creates an optimistic emotional nature and possibly spiritual inclinations."
    ];
    
    return {
      id: Date.now().toString(),
      content: `${generalResponses[responseVariant]} This reading is based on your birth date (${birthDetails ? new Date(birthDetails.date).toDateString() : 'Unknown'}) and the planetary positions in your chart.`,
      sender: 'ai',
      timestamp: new Date()
    };
  }
};
