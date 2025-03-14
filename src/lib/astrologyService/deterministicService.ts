
import { BirthDetails, BirthChart, Message, PlanetaryPosition } from '../types';
import seedrandom from 'seedrandom';
import { helperFunctions } from './helperFunctions';

// Deterministic mock responses based on birth chart, birth details, and message
export const generateDeterministicResponse = (message: string, birthChart?: BirthChart, birthDetails?: BirthDetails): Message => {
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
      `For someone born on ${new Date(birthDetails.date).toDateString()} with ${birthChart.ascendant} ascendant, I recommend: 1) Wear a gemstone associated with your ascendant lord. 2) Recite mantras for benefic planets in your chart. 3) Practice meditation on ${helperFunctions.getDayOfWeek(responseVariant % 7)}.`,
      `With ${birthChart.planets.find(p => p.planet === 'Moon')?.sign} Moon and ${birthChart.planets.find(p => p.planet === 'Sun')?.sign} Sun, these remedies may help: 1) Offer water to a ${helperFunctions.getPlant(responseVariant % 5)}. 2) Donate ${helperFunctions.getFood(responseVariant % 8)} on ${helperFunctions.getDayOfWeek((responseVariant + 2) % 7)}. 3) Recite ${helperFunctions.getMantra(responseVariant % 9)}.`,
      `Your chart shows ${birthChart.planets.filter(p => p.house === 8).length} planets in the 8th house, suggesting these remedies: 1) Practice ${helperFunctions.getYogaType(responseVariant % 6)}. 2) Feed ${helperFunctions.getAnimal(responseVariant % 7)}. 3) Wear a ${helperFunctions.getColor(responseVariant % 10)} colored thread on your wrist.`,
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
      `Your 10th house ruler is in the ${birthChart.planets.find(p => p.house === 10)?.house || 'neutral'} house, indicating a career in ${helperFunctions.getCareerField(responseVariant % 12)}. The aspects to your 10th house suggest you'll find success through ${helperFunctions.getCareerApproach(responseVariant % 8)}.`,
      `Your chart shows a strong connection between the 2nd house of wealth and the 10th house of career. This suggests financial success through ${helperFunctions.getFinancialField(responseVariant % 9)}. Your ${birthChart.planets.find(p => p.planet === 'Mercury')?.sign} Mercury gives you excellent communication skills useful in your profession.`,
      `The placement of Saturn in your ${birthChart.planets.find(p => p.planet === 'Saturn')?.house}th house suggests you may face some initial challenges in your career, but will achieve stability and recognition after the age of ${28 + (responseVariant % 7)}. Focus on fields related to ${helperFunctions.getCareerField((responseVariant + 4) % 12)}.`,
      `With Jupiter in your ${birthChart.planets.find(p => p.planet === 'Jupiter')?.house}th house, you're likely to excel in careers involving ${helperFunctions.getCareerField((responseVariant + 7) % 12)}. Your chart suggests multiple sources of income, with substantial growth around the age of ${32 + (responseVariant % 10)}.`
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
      `With Venus in your ${birthChart.planets.find(p => p.planet === 'Venus')?.house}th house in ${birthChart.planets.find(p => p.planet === 'Venus')?.sign}, you are attracted to partners who are ${helperFunctions.getPersonalityTrait(responseVariant % 15)} and ${helperFunctions.getPersonalityTrait((responseVariant + 5) % 15)}. Your 7th house in ${helperFunctions.getZodiacSign(responseVariant % 12)} suggests a partner who is ${helperFunctions.getPersonalityTrait((responseVariant + 10) % 15)}.`,
      `Your ${birthChart.planets.find(p => p.planet === 'Mars')?.sign} Mars indicates passion and attraction to ${helperFunctions.getPersonalityTrait((responseVariant + 3) % 15)} individuals. Marriage potential shows around age ${24 + (responseVariant % 12)}, with a partner who complements your ${birthChart.planets.find(p => p.planet === 'Moon')?.sign} Moon emotional needs.`,
      `The ruler of your 7th house is in the ${helperFunctions.getHouseNumber(responseVariant % 12)} house, suggesting you'll meet significant partners through ${helperFunctions.getMeetingVenue(responseVariant % 10)}. Your chart indicates ${1 + (responseVariant % 3)} significant relationships, with the most fulfilling one coming after some life lessons.`,
      `With Jupiter aspecting your Venus, you seek meaning and growth in relationships. Your chart indicates a partner who is ${helperFunctions.getPersonalityTrait((responseVariant + 7) % 15)} and brings ${helperFunctions.getRelationshipQuality(responseVariant % 10)} to your life. Family support for your relationship appears ${responseVariant % 2 === 0 ? 'strong' : 'challenging initially but improving with time'}.`,
      `Your 5th house of romance shows ${birthChart.houses.find(h => h.number === 5)?.planets.length || 0} planets, indicating ${responseVariant % 2 === 0 ? 'a vibrant love life' : 'selective but deep romantic attachments'}. Look for partners who respect your need for ${helperFunctions.getRelationshipQuality((responseVariant + 3) % 10)} and share your interest in ${helperFunctions.getRelationshipQuality((responseVariant + 5) % 10)}.`
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
      `With ${birthChart.ascendant} ascendant, you present yourself to the world as ${helperFunctions.getAscendantTrait(birthChart.ascendant)}. Your Sun in ${birthChart.planets.find(p => p.planet === 'Sun')?.sign} in the ${birthChart.planets.find(p => p.planet === 'Sun')?.house}th house gives you ${helperFunctions.getSunQuality(responseVariant % 10)}. Moon in ${birthChart.planets.find(p => p.planet === 'Moon')?.sign} shapes your emotional nature to be ${helperFunctions.getMoonQuality(responseVariant % 10)}.`,
      
      `Your chart shows ${birthChart.planets.filter(p => p.house === 10).length} planets in the 10th house of career, suggesting ${responseVariant % 2 === 0 ? 'strong professional ambitions' : 'a public role in your community'}. With Jupiter in the ${birthChart.planets.find(p => p.planet === 'Jupiter')?.house}th house, you experience growth and expansion in areas of ${helperFunctions.getHouseSignificance(birthChart.planets.find(p => p.planet === 'Jupiter')?.house || 1)}.`,
      
      `The placement of Saturn in your ${birthChart.planets.find(p => p.planet === 'Saturn')?.house}th house indicates areas where you learn discipline and patience. Your Mercury in ${birthChart.planets.find(p => p.planet === 'Mercury')?.sign} shapes your communication style to be ${helperFunctions.getMercuryQuality(responseVariant % 8)}. Venus in the ${birthChart.planets.find(p => p.planet === 'Venus')?.house}th house influences how you express affection and what you value.`,
      
      `With Rahu (North Node) in your ${birthChart.planets.find(p => p.planet === 'Rahu')?.house}th house, you have karmic lessons to learn about ${helperFunctions.getHouseSignificance(birthChart.planets.find(p => p.planet === 'Rahu')?.house || 9)}. Your Mars in ${birthChart.planets.find(p => p.planet === 'Mars')?.sign} gives you ${helperFunctions.getMarsQuality(responseVariant % 8)} and influences how you assert yourself.`,
      
      `Your ${birthChart.planets.find(p => p.planet === 'Moon')?.sign} Moon reveals your inner emotional landscape, showing you're naturally ${helperFunctions.getMoonQuality((responseVariant + 5) % 10)}. With ${birthChart.planets.filter(p => [1, 5, 9].includes(p.house)).length} planets in fire houses, you have ${responseVariant % 2 === 0 ? 'abundant creative energy' : 'strong spiritual inclinations'} that seek expression in your life path.`
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
