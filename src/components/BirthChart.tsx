
import { BirthChart as BirthChartType, PlanetaryPosition } from '@/lib/types';

interface BirthChartProps {
  birthChart: BirthChartType;
}

const BirthChart = ({ birthChart }: BirthChartProps) => {
  const { ascendant, houses, planets } = birthChart;
  const zodiacSigns = [
    "Aries", "Taurus", "Gemini", "Cancer", 
    "Leo", "Virgo", "Libra", "Scorpio", 
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];

  const getSignColor = (sign: string): string => {
    const colorMap: Record<string, string> = {
      'Aries': '#FF4136',
      'Taurus': '#2ECC40',
      'Gemini': '#FFDC00',
      'Cancer': '#AAAAAA',
      'Leo': '#FF851B',
      'Virgo': '#7FDBFF',
      'Libra': '#B10DC9',
      'Scorpio': '#85144b',
      'Sagittarius': '#F012BE',
      'Capricorn': '#111111',
      'Aquarius': '#0074D9',
      'Pisces': '#01FF70'
    };
    return colorMap[sign] || '#DDDDDD';
  };

  const getPlanetSymbol = (planet: string): string => {
    const symbolMap: Record<string, string> = {
      'Sun': '☉',
      'Moon': '☽',
      'Mercury': '☿',
      'Venus': '♀',
      'Mars': '♂',
      'Jupiter': '♃',
      'Saturn': '♄',
      'Rahu': '☊',
      'Ketu': '☋',
      'Uranus': '♅',
      'Neptune': '♆',
      'Pluto': '♇'
    };
    return symbolMap[planet] || planet.charAt(0);
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
      <h2 className="text-xl font-cinzel text-vedic-navy mb-4 text-center">Vedic Birth Chart</h2>
      <div className="text-center mb-4">
        <span className="text-sm bg-gradient-primary text-white px-3 py-1 rounded-full">
          Ascendant: {ascendant}
        </span>
      </div>

      {/* Zodiac Chart - North Indian Style */}
      <div className="aspect-square w-full max-w-md mx-auto grid grid-cols-3 grid-rows-3 gap-1 border-2 border-gray-300 rounded-lg overflow-hidden">
        {/* We'll create a 3x3 grid for the North Indian chart layout */}
        {/* Houses are arranged clockwise from top-left */}
        {[1, 12, 11, 2, 0, 10, 3, 4, 9, 8, 7, 6, 5].map((housePos, index) => {
          if (housePos === 0) {
            // Center cell - empty or can contain additional info
            return (
              <div key="center" className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <span className="text-xl font-cinzel text-vedic-navy">🕉️</span>
              </div>
            );
          }

          // Find the house data
          const house = houses.find(h => h.number === housePos);
          if (!house) return null;

          // Position in the grid
          let gridPosition = "";
          if (index === 0) gridPosition = "col-start-1 col-end-2 row-start-1 row-end-2"; // House 1
          else if (index === 1) gridPosition = "col-start-2 col-end-3 row-start-1 row-end-2"; // House 12
          else if (index === 2) gridPosition = "col-start-3 col-end-4 row-start-1 row-end-2"; // House 11
          else if (index === 3) gridPosition = "col-start-1 col-end-2 row-start-2 row-end-3"; // House 2
          else if (index === 5) gridPosition = "col-start-3 col-end-4 row-start-2 row-end-3"; // House 10
          else if (index === 6) gridPosition = "col-start-1 col-end-2 row-start-3 row-end-4"; // House 3
          else if (index === 7) gridPosition = "col-start-2 col-end-3 row-start-3 row-end-4"; // House 4
          else if (index === 8) gridPosition = "col-start-3 col-end-4 row-start-3 row-end-4"; // House 9
          
          const signColor = getSignColor(house.sign);
          
          return (
            <div 
              key={housePos} 
              className={`${gridPosition} flex flex-col p-1 border border-gray-200`}
              style={{ backgroundColor: `${signColor}20` }}
            >
              <div className="flex justify-between text-xs mb-1">
                <span>{housePos}</span>
                <span>{house.sign.substring(0, 3)}</span>
              </div>
              <div className="flex flex-wrap justify-center items-center flex-1">
                {house.planets.map((planet, i) => (
                  <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                    {getPlanetSymbol(planet.planet)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Planet Positions Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gradient-primary text-white">
            <tr>
              <th className="px-4 py-2 text-left">Planet</th>
              <th className="px-4 py-2 text-left">Sign</th>
              <th className="px-4 py-2 text-left">House</th>
              <th className="px-4 py-2 text-left">Degrees</th>
            </tr>
          </thead>
          <tbody>
            {planets.map((planet, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-2 flex items-center">
                  <span className="mr-2">{getPlanetSymbol(planet.planet)}</span>
                  {planet.planet}
                </td>
                <td className="px-4 py-2">{planet.sign}</td>
                <td className="px-4 py-2">{planet.house}</td>
                <td className="px-4 py-2">{planet.degrees}°</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BirthChart;
