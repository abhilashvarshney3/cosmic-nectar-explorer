
import { BirthDetails, BirthChart, Message } from '../types';

// API response types
export interface ProkeralaApiResponse {
  ascendant?: {
    sign: string;
  };
  planets?: Record<string, {
    sign: string;
    longitude: number;
  }>;
}

export interface VedicRishiApiResponse {
  ascendant?: string;
  planets?: Array<{
    name: string;
    sign: string;
    signDegree?: number;
  }>;
}

// Create a prompt for the Hugging Face Vedic Astrology model
export type PromptCreator = (message: string, birthDetails: BirthDetails, birthChart: BirthChart) => string;

// Helper function types
export type IndexToStringFn = (index: number) => string;
export type IndexToNumberFn = (index: number) => number;
