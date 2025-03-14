
import { BirthDetails, BirthChart } from '../types';
import { PromptCreator } from './types';

// Create a prompt for the Hugging Face Vedic Astrology model
export const createVedicAstrologyPrompt: PromptCreator = (message, birthDetails, birthChart) => {
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

// Create a prompt for general astrology interpretation
export const createAstrologyPrompt: PromptCreator = (message, birthDetails, birthChart) => {
  const planetPositions = birthChart.planets.map(p => 
    `${p.planet} in ${p.sign} (${p.house}th house)`
  ).join(', ');
  
  const birthDate = new Date(birthDetails.date);
  
  return `I'm analyzing a birth chart for ${birthDetails.name} born on ${birthDate.toDateString()} at ${birthDetails.time} in ${birthDetails.location}.

The ascendant is ${birthChart.ascendant}, and the planets are positioned as follows:
${planetPositions}

The question is: ${message}

Please provide a detailed astrological interpretation based on Vedic astrology principles.`;
};
