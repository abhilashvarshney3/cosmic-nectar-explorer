
import { IndexToStringFn, IndexToNumberFn } from './types';

export const helperFunctions = {
  // Helper function for getting relationship qualities
  getRelationshipQuality: ((index: number): string => {
    const qualities = [
      "intellectual stimulation", "emotional security", "spiritual connection",
      "financial stability", "passion and romance", "friendship and companionship",
      "mutual growth and support", "shared values and life goals", "honesty and transparency",
      "respect for independence"
    ];
    return qualities[index % qualities.length];
  }) as IndexToStringFn,

  // Helper functions for deterministic responses
  getCareerField: ((index: number): string => {
    const fields = [
      "technology and innovation", "healthcare and wellness", "education and teaching", 
      "finance and banking", "creative arts and design", "law and justice", 
      "science and research", "media and communication", "service industries", 
      "entrepreneurship", "public service", "spiritual and counseling roles"
    ];
    return fields[index % fields.length];
  }) as IndexToStringFn,

  // Helper function to get career approach
  getCareerApproach: ((index: number): string => {
    const approaches = [
      "networking and building relationships", "continuous learning and education",
      "focused specialization", "adaptability and versatility",
      "leadership and team management", "innovation and creative thinking",
      "technical expertise", "service-oriented approach"
    ];
    return approaches[index % approaches.length];
  }) as IndexToStringFn,

  // Helper function to get financial field
  getFinancialField: ((index: number): string => {
    const fields = [
      "investments and trading", "business ownership", "professional career",
      "real estate", "creative ventures", "technology and innovation",
      "service-based businesses", "teaching and knowledge sharing", "partnership ventures"
    ];
    return fields[index % fields.length];
  }) as IndexToStringFn,

  // Helper function to get personality trait
  getPersonalityTrait: ((index: number): string => {
    const traits = [
      "intelligent and analytical", "compassionate and nurturing", "creative and expressive",
      "determined and persistent", "adaptable and versatile", "practical and detail-oriented",
      "optimistic and enthusiastic", "loyal and dependable", "charismatic and inspiring",
      "disciplined and structured", "intuitive and perceptive", "honest and sincere",
      "adventurous and bold", "peaceful and harmonious", "passionate and intense"
    ];
    return traits[index % traits.length];
  }) as IndexToStringFn,

  // Helper function to get meeting venue
  getMeetingVenue: ((index: number): string => {
    const venues = [
      "educational settings or classes", "through mutual friends", "work or professional environments",
      "spiritual or religious gatherings", "travel or foreign locations", "family connections",
      "online or social media", "community events or volunteer work", "hobbies or recreational activities",
      "unexpected chance encounters"
    ];
    return venues[index % venues.length];
  }) as IndexToStringFn,

  // Helper function to get zodiac sign
  getZodiacSign: ((index: number): string => {
    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    return signs[index % signs.length];
  }) as IndexToStringFn,

  // Helper function to get house number
  getHouseNumber: ((index: number): number => {
    return (index % 12) + 1;
  }) as IndexToNumberFn,

  // Helper function to get day of week
  getDayOfWeek: ((index: number): string => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[index % days.length];
  }) as IndexToStringFn,

  // Helper function to get plant
  getPlant: ((index: number): string => {
    const plants = ["Tulsi (Holy Basil)", "Peepal tree", "Banana tree", "Neem tree", "Sandalwood tree"];
    return plants[index % plants.length];
  }) as IndexToStringFn,

  // Helper function to get food
  getFood: ((index: number): string => {
    const foods = ["rice", "yellow lentils", "sweets", "milk", "fruits", "wheat", "sesame seeds", "mixed grains"];
    return foods[index % foods.length];
  }) as IndexToStringFn,

  // Helper function to get mantra
  getMantra: ((index: number): string => {
    const mantras = ["Gayatri Mantra", "Mahamrityunjaya Mantra", "Om Namah Shivaya", "Hanuman Chalisa", "Saturn Beej Mantra", "Venus Mantra", "Jupiter Mantra", "Sun Beej Mantra", "Moon Mantra"];
    return mantras[index % mantras.length];
  }) as IndexToStringFn,

  // Helper function to get yoga type
  getYogaType: ((index: number): string => {
    const yogaTypes = ["Hatha Yoga", "Bhakti Yoga", "Karma Yoga", "Raja Yoga", "Jnana Yoga", "Kundalini Yoga"];
    return yogaTypes[index % yogaTypes.length];
  }) as IndexToStringFn,

  // Helper function to get animal
  getAnimal: ((index: number): string => {
    const animals = ["crows", "dogs", "cows", "birds", "ants", "fish", "turtles"];
    return animals[index % animals.length];
  }) as IndexToStringFn,

  // Helper function to get color
  getColor: ((index: number): string => {
    const colors = ["red", "yellow", "blue", "green", "white", "black", "orange", "purple", "silver", "gold"];
    return colors[index % colors.length];
  }) as IndexToStringFn,

  // Helper function to get ascendant trait
  getAscendantTrait: ((ascendant: string): string => {
    const traits: Record<string, string> = {
      "Aries": "bold and pioneering",
      "Taurus": "steady and reliable",
      "Gemini": "communicative and versatile",
      "Cancer": "nurturing and protective",
      "Leo": "charismatic and dignified",
      "Virgo": "analytical and precise",
      "Libra": "diplomatic and balanced",
      "Scorpio": "intense and transformative",
      "Sagittarius": "optimistic and philosophical",
      "Capricorn": "disciplined and ambitious",
      "Aquarius": "innovative and independent",
      "Pisces": "compassionate and intuitive"
    };
    return traits[ascendant] || "unique and individual";
  }) as ((ascendant: string) => string),

  // Helper function to get Sun quality
  getSunQuality: ((index: number): string => {
    const qualities = [
      "a strong sense of purpose and identity", "natural leadership abilities", 
      "creative self-expression", "confidence and vitality", 
      "determination and willpower", "generous and warm-hearted nature", 
      "dignity and self-respect", "clarity of vision", 
      "magnetic charisma", "honorable character"
    ];
    return qualities[index % qualities.length];
  }) as IndexToStringFn,

  // Helper function to get Moon quality
  getMoonQuality: ((index: number): string => {
    const qualities = [
      "deeply intuitive and receptive", "emotionally nurturing and caring", 
      "adaptable and responsive to others", "sensitive to surrounding energies", 
      "strongly connected to home and family", "cyclical in emotional patterns", 
      "reflective and contemplative", "protective of loved ones", 
      "attuned to unconscious patterns", "emotionally expressive"
    ];
    return qualities[index % qualities.length];
  }) as IndexToStringFn,

  // Helper function to get Mercury quality
  getMercuryQuality: ((index: number): string => {
    const qualities = [
      "analytical and precise", "quick-thinking and adaptable", 
      "articulate and expressive", "logical and rational", 
      "curious and inquisitive", "detail-oriented and organized", 
      "witty and humorous", "skillful with words and communication"
    ];
    return qualities[index % qualities.length];
  }) as IndexToStringFn,

  // Helper function to get Mars quality
  getMarsQuality: ((index: number): string => {
    const qualities = [
      "courage and assertiveness", "energy and drive", 
      "initiative and leadership", "competitive spirit", 
      "direct and straightforward approach", "physical vitality", 
      "decisiveness and action-orientation", "independence and self-sufficiency"
    ];
    return qualities[index % qualities.length];
  }) as IndexToStringFn,

  // Helper function to get house significance
  getHouseSignificance: ((houseNumber: number): string => {
    const significances: Record<number, string> = {
      1: "self-identity and physical appearance",
      2: "personal resources and values",
      3: "communication and short journeys",
      4: "home, family, and emotional foundations",
      5: "creativity, romance, and self-expression",
      6: "daily work, health, and service",
      7: "partnerships and relationships",
      8: "shared resources, transformation, and mysteries",
      9: "higher education, philosophy, and long journeys",
      10: "career, public reputation, and authority",
      11: "friendships, groups, and aspirations",
      12: "spirituality, subconscious, and hidden matters"
    };
    return significances[houseNumber] || "personal growth and development";
  }) as ((houseNumber: number) => string)
};
