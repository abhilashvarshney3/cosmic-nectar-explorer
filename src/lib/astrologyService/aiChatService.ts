
import { BirthDetails, BirthChart, Message } from '../types';
import { API_ENDPOINTS, API_KEYS } from '../apiConfig';
import { createVedicAstrologyPrompt, createAstrologyPrompt } from './promptService';
import { generateDeterministicResponse } from './deterministicService';

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
