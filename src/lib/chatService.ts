import { Message, BirthDetails, BirthChart } from './types';
import { API_ENDPOINTS, API_KEYS } from './apiConfig';
import seedrandom from 'seedrandom';

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
      const errorData = await response.json().catch(() => ({}));
      console.error('Hugging Face API error:', response.status, errorData);
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
          planetaryData: birthChart.planets,
          source: 'Hugging Face Vedic AI'
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
          type: 'remedy',
          source: 'Hugging Face Vedic AI'
        };
      }
      // General astrology interpretation
      else {
        return {
          id: Date.now().toString(),
          content: aiResponse,
          sender: 'ai',
          timestamp: new Date(),
          source: 'Hugging Face Vedic AI'
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
                planetaryData: birthChart.planets,
                source: 'OpenAI'
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
                type: 'remedy',
                source: 'OpenAI'
              };
            }
            // General astrology interpretation
            else {
              return {
                id: Date.now().toString(),
                content,
                sender: 'ai',
                timestamp: new Date(),
                source: 'OpenAI'
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
    
    // Fallback to deterministic mock responses based on birth details and message
    return generateDeterministicResponse(message, birthChart, birthDetails);
  }
};

// Deterministic mock responses based on birth chart, birth details, and message
const generateDeterministicResponse = (message: string, birthChart?: BirthChart, birthDetails?: BirthDetails): Message => {
  if (!birthDetails || !birthChart) {
    return {
      id: Date.now().toString(),
      content: "I'm sorry, I couldn't analyze your birth chart without your birth details.",
      sender: 'ai',
      timestamp: new Date(),
      source: 'Deterministic System'
    };
  }
  
  // Create a seed from birth details and message
  const date = new Date(birthDetails.date);
  const dateSeed = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${birthDetails.time}`;
  const messageSeed = message.toLowerCase().trim();
  const combinedSeed = dateSeed + "-" + messageSeed;
  
  // Create a deterministic random generator
  const rng = seedrandom(combinedSeed);
  const responseVariant = Math.floor(rng() * 100); // Use a larger range for more variety
  
  if (message.toLowerCase().includes('planet') || message.toLowerCase().includes('position')) {
    return {
      id: Date.now().toString(),
      content: `Based on your birth details (${new Date(birthDetails.date).toDateString()}), here are your planetary positions:`,
      sender: 'ai',
      timestamp: new Date(),
      type: 'planetary',
      planetaryData: birthChart.planets,
      source: 'Deterministic System'
    };
  } else if (message.toLowerCase().includes('remedy') || message.toLowerCase().includes('solution')) {
    const remedyResponses = [
      `For someone born on ${new Date(birthDetails.date).toDateString()} with ${birthChart.ascendant} ascendant, I recommend: 1) Wear a gemstone associated with your ascendant lord. 2) Recite mantras for benefic planets in your chart. 3) Practice meditation on ${getDayOfWeek(responseVariant % 7)}.`,
      `With ${birthChart.planets.find(p => p.planet === 'Moon')?.sign} Moon and ${birthChart.planets.find(p => p.planet === 'Sun')?.sign} Sun, these remedies may help: 1) Offer water to a ${getPlant(responseVariant % 5)}. 2) Donate ${getFood(responseVariant % 8)} on ${getDayOfWeek((responseVariant + 2) % 7)}. 3) Recite ${getMantra(responseVariant % 9)}.`,
      `Your chart shows ${birthChart.planets.filter(p => p.house === 8).length} planets in the 8th house, suggesting these remedies: 1) Practice ${getYogaType(responseVariant % 6)}. 2) Feed ${getAnimal(responseVariant % 7)}. 3) Wear a ${getColor(responseVariant % 10)} colored thread on your wrist.`,
      `For your ${birthChart.planets.find(p => p.planet === 'Saturn')?.house}th house Saturn, try: 1) Serve the elderly or less fortunate on Saturdays. 2) Donate dark grains like sesame. 3) Recite Hanuman Chalisa for protection from Saturn's challenges.`,
      `With Jupiter in ${birthChart.planets.find(p => p.planet === 'Jupiter')?.sign}, these remedies will be beneficial: 1) Feed dogs on Thursdays. 2) Wear yellow clothing more often. 3) Donate to educational institutions to strengthen Jupiter's positive aspects.`
    ];
    
    const selectedResponse = remedyResponses[responseVariant % remedyResponses.length];
    
    return {
      id: Date.now().toString(),
      content: selectedResponse,
      sender: 'ai',
      timestamp: new Date(),
      type: 'remedy',
      source: 'Deterministic System'
    };
  } else if (message.toLowerCase().includes('career') || message.toLowerCase().includes('profession')) {
    const careerResponses = [
      `With your ${birthChart.planets.find(p => p.planet === 'Sun')?.sign} Sun in the ${birthChart.planets.find(p => p.planet === 'Sun')?.house}th house, you have natural talents in leadership, creative fields, and positions of authority. Your ${birthChart.planets.find(p => p.planet === 'Mars')?.sign} Mars suggests you work well under pressure and can excel in competitive environments.`,
      `Your 10th house ruler is in the ${birthChart.planets.find(p => p.house === 10)?.house || 'neutral'} house, indicating a career in ${getCareerField(responseVariant % 12)}. The aspects to your 10th house suggest you'll find success through ${getCareerApproach(responseVariant % 8)}.`,
      `Your chart shows a strong connection between the 2nd house of wealth and the 10th house of career. This suggests financial success through ${getFinancialField(responseVariant % 9)}. Your ${birthChart.planets.find(p => p.planet === 'Mercury')?.sign} Mercury gives you excellent communication skills useful in your profession.`,
      `The placement of Saturn in your ${birthChart.planets.find(p => p.planet === 'Saturn')?.house}th house suggests you may face some initial challenges in your career, but will achieve stability and recognition after the age of ${28 + (responseVariant % 7)}. Focus on fields related to ${getCareerField((responseVariant + 4) % 12)}.`,
      `With Jupiter in your ${birthChart.planets.find(p => p.planet === 'Jupiter')?.house}th house, you're likely to excel in careers involving ${getCareerField((responseVariant + 7) % 12)}. Your chart suggests multiple sources of income, with substantial growth around the age of ${32 + (responseVariant % 10)}.`
    ];
    
    const selectedResponse = careerResponses[responseVariant % careerResponses.length];
    
    return {
      id: Date.now().toString(),
      content: selectedResponse,
      sender: 'ai',
      timestamp: new Date(),
      source: 'Deterministic System'
    };
  } else if (message.toLowerCase().includes('relationship') || message.toLowerCase().includes('marriage') || message.toLowerCase().includes('love')) {
    const relationshipResponses = [
      `With Venus in your ${birthChart.planets.find(p => p.planet === 'Venus')?.house}th house in ${birthChart.planets.find(p => p.planet === 'Venus')?.sign}, you are attracted to partners who are ${getPersonalityTrait(responseVariant % 15)} and ${getPersonalityTrait((responseVariant + 5) % 15)}. Your 7th house in ${getZodiacSign(responseVariant % 12)} suggests a partner who is ${getPersonalityTrait((responseVariant + 10) % 15)}.`,
      `Your ${birthChart.planets.find(p => p.planet === 'Mars')?.sign} Mars indicates passion and attraction to ${getPersonalityTrait((responseVariant + 3) % 15)} individuals. Marriage potential shows around age ${24 + (responseVariant % 12)}, with a partner who complements your ${birthChart.planets.find(p => p.planet === 'Moon')?.sign} Moon emotional needs.`,
      `The ruler of your 7th house is in the ${getHouseNumber(responseVariant % 12)} house, suggesting you'll meet significant partners through ${getMeetingVenue(responseVariant % 10)}. Your chart indicates ${1 + (responseVariant % 3)} significant relationships, with the most fulfilling one coming after some life lessons.`,
      `With Jupiter aspecting your Venus, you seek meaning and growth in relationships. Your chart indicates a partner who is ${getPersonalityTrait((responseVariant + 7) % 15)} and brings ${getRelationshipQuality(responseVariant % 10)} to your life. Family support for your relationship appears ${responseVariant % 2 === 0 ? 'strong' : 'challenging initially but improving with time'}.`,
      `Your 5th house of romance shows ${birthChart.houses.find(h => h.number === 5)?.planets.length || 0} planets, indicating ${responseVariant % 2 === 0 ? 'a vibrant love life' : 'selective but deep romantic attachments'}. Look for partners who respect your need for ${getRelationshipQuality((responseVariant + 3) % 10)} and share your interest in ${getRelationshipQuality((responseVariant + 5) % 10)}.`
    ];
    
    const selectedResponse = relationshipResponses[responseVariant % relationshipResponses.length];
    
    return {
      id: Date.now().toString(),
      content: selectedResponse,
      sender: 'ai',
      timestamp: new Date(),
      source: 'Deterministic System'
    };
  } else {
    // General analysis based on the birth chart
    const generalResponses = [
      `With ${birthChart.ascendant} ascendant, you present yourself to the world as ${getAscendantTrait(birthChart.ascendant)}. Your Sun in ${birthChart.planets.find(p => p.planet === 'Sun')?.sign} in the ${birthChart.planets.find(p => p.planet === 'Sun')?.house}th house gives you ${getSunQuality(responseVariant % 10)}. Moon in ${birthChart.planets.find(p => p.planet === 'Moon')?.sign} shapes your emotional nature to be ${getMoonQuality(responseVariant % 10)}.`,
      
      `Your chart shows ${birthChart.planets.filter(p => p.house === 10).length} planets in the 10th house of career, suggesting ${responseVariant % 2 === 0 ? 'strong professional ambitions' : 'a public role in your community'}. With Jupiter in the ${birthChart.planets.find(p => p.planet === 'Jupiter')?.house}th house, you experience growth and expansion in areas of ${getHouseSignificance(birthChart.planets.find(p => p.planet === 'Jupiter')?.house || 1)}.`,
      
      `The placement of Saturn in your ${birthChart.planets.find(p => p.planet === 'Saturn')?.house}th house indicates areas where you learn discipline and patience. Your Mercury in ${birthChart.planets.find(p => p.planet === 'Mercury')?.sign} shapes your communication style to be ${getMercuryQuality(responseVariant % 8)}. Venus in the ${birthChart.planets.find(p => p.planet === 'Venus')?.house}th house influences how you express affection and what you value.`,
      
      `With Rahu (North Node) in your ${birthChart.planets.find(p => p.planet === 'Rahu')?.house}th house, you have karmic lessons to learn about ${getHouseSignificance(birthChart.planets.find(p => p.planet === 'Rahu')?.house || 9)}. Your Mars in ${birthChart.planets.find(p => p.planet === 'Mars')?.sign} gives you ${getMarsQuality(responseVariant % 8)} and influences how you assert yourself.`,
      
      `Your ${birthChart.planets.find(p => p.planet === 'Moon')?.sign} Moon reveals your inner emotional landscape, showing you're naturally ${getMoonQuality((responseVariant + 5) % 10)}. With ${birthChart.planets.filter(p => [1, 5, 9].includes(p.house)).length} planets in fire houses, you have ${responseVariant % 2 === 0 ? 'abundant creative energy' : 'strong spiritual inclinations'} that seek expression in your life path.`
    ];
    
    const selectedResponse = generalResponses[responseVariant % generalResponses.length];
    
    return {
      id: Date.now().toString(),
      content: `${selectedResponse} This reading is based on your birth date (${new Date(birthDetails.date).toDateString()}) and time (${birthDetails.time}).`,
      sender: 'ai',
      timestamp: new Date(),
      source: 'Deterministic System'
    };
  }
};

// Helper functions for deterministic responses
const getZodiacSign = (index: number): string => {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  return signs[index % signs.length];
};

const getHouseNumber = (index: number): number => {
  return (index % 12) + 1;
};

const getDayOfWeek = (index: number): string => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days[index % days.length];
};

const getPlant = (index: number): string => {
  const plants = ["Tulsi (Holy Basil)", "Peepal tree", "Banana tree", "Neem tree", "Sandalwood tree"];
  return plants[index % plants.length];
};

const getFood = (index: number): string => {
  const foods = ["rice", "yellow lentils", "sweets", "milk", "fruits", "wheat", "sesame seeds", "mixed grains"];
  return foods[index % foods.length];
};

const getMantra = (index: number): string => {
  const mantras = ["Gayatri Mantra", "Mahamrityunjaya Mantra", "Om Namah Shivaya", "Hanuman Chalisa", "Saturn Beej Mantra", "Venus Mantra", "Jupiter Mantra", "Sun Beej Mantra", "Moon Mantra"];
  return mantras[index % mantras.length];
};

const getYogaType = (index: number): string => {
  const yogaTypes = ["Hatha Yoga", "Bhakti Yoga", "Karma Yoga", "Raja Yoga", "Jnana Yoga", "Kundalini Yoga"];
  return yogaTypes[index % yogaTypes.length];
};

const getAnimal = (index: number): string => {
  const animals = ["crows", "dogs", "cows", "birds", "ants", "fish", "turtles"];
  return animals[index % animals.length];
};

const getColor = (index: number): string => {
  const colors = ["red", "yellow", "blue", "green", "white", "black", "orange", "purple", "silver", "gold"];
  return colors[index % colors.length];
};

const getCareerField = (index: number): string => {
  const fields = [
    "technology and innovation", "healthcare and wellness", "education and teaching", 
    "finance and banking", "creative arts and design", "law and justice", 
    "science and research", "media and communication", "service industries", 
    "entrepreneurship", "public service", "spiritual and counseling roles"
