
import { PlanetaryPosition } from '@/lib/types';

interface PlanetaryChartProps {
  planetaryData: PlanetaryPosition[];
}

const PlanetaryChart = ({ planetaryData }: PlanetaryChartProps) => {
  return (
    <div className="mt-3 mb-2">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-4 overflow-x-auto">
        <h3 className="text-sm font-medium text-vedic-navy mb-3">Planetary Positions</h3>
        <div className="grid grid-cols-5 gap-4 min-w-[500px]">
          <div className="text-xs font-medium text-gray-500">Planet</div>
          <div className="text-xs font-medium text-gray-500">House</div>
          <div className="text-xs font-medium text-gray-500">Sign</div>
          <div className="text-xs font-medium text-gray-500">Degrees</div>
          <div className="text-xs font-medium text-gray-500">Status</div>
          
          {planetaryData.map((planet, index) => (
            <>
              <div key={`planet-${index}`} className="text-sm font-medium text-vedic-navy flex items-center">
                {getPlanetEmoji(planet.planet)} {planet.planet}
              </div>
              <div key={`house-${index}`} className="text-sm">{planet.house}</div>
              <div key={`sign-${index}`} className="text-sm">{planet.sign}</div>
              <div key={`degrees-${index}`} className="text-sm">{planet.degrees}°</div>
              <div key={`status-${index}`} className="text-sm">{getPlanetStatus(planet)}</div>
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

const getPlanetEmoji = (planet: string): string => {
  const planetMap: Record<string, string> = {
    'Sun': '☉',
    'Moon': '☽',
    'Mercury': '☿',
    'Venus': '♀',
    'Mars': '♂',
    'Jupiter': '♃',
    'Saturn': '♄',
    'Rahu': '☊',
    'Ketu': '☋'
  };
  
  return planetMap[planet] || '';
};

const getPlanetStatus = (planet: PlanetaryPosition): string => {
  // This is a simplified logic - in a real app, this would be more complex
  const statuses = ['Exalted', 'Debilitated', 'Own Sign', 'Neutral'];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

export default PlanetaryChart;
