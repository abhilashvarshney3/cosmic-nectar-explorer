
export interface BirthDetails {
  name: string;
  date: Date;
  time: string;
  location: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'planetary' | 'remedy';
  planetaryData?: PlanetaryPosition[];
}

export interface PlanetaryPosition {
  planet: string;
  house: number;
  sign: string;
  degrees: number;
}

export interface BirthChart {
  ascendant: string;
  houses: HouseData[];
  planets: PlanetaryPosition[];
}

export interface HouseData {
  number: number;
  sign: string;
  planets: PlanetaryPosition[];
}
