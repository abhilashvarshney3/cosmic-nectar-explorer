
import { Message, BirthDetails } from './types';

// Mock API call - this would be replaced by actual API call
export const sendMessage = async (
  message: string, 
  birthDetails?: BirthDetails
): Promise<Message> => {
  // Simulating API response time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock response based on user input
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
