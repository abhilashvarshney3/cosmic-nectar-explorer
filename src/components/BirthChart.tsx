
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
    <div className="w-full max-w-3xl mx-auto p-4 bg-white/90 rounded-xl shadow-lg">
      <h2 className="text-xl font-cinzel text-vedic-navy mb-4 text-center">Vedic Birth Chart</h2>
      <div className="text-center mb-4">
        <span className="text-sm bg-gradient-primary text-white px-3 py-1 rounded-full">
          Ascendant: {ascendant}
        </span>
      </div>

      {/* North Indian Style Chart - Fixed Orientation */}
      <div className="w-full max-w-md mx-auto grid grid-cols-4 grid-rows-4 gap-1 border-2 border-gray-300 rounded-lg overflow-hidden">
        {/* Top row */}
        <div className="col-span-1 row-span-1 flex flex-col p-1 border border-gray-200" style={{ backgroundColor: `${getSignColor(houses[11].sign)}20` }}>
          <div className="flex justify-between text-xs">
            <span>12</span>
            <span>{houses[11].sign.substring(0, 3)}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center flex-1">
            {houses[11].planets.map((planet, i) => (
              <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                {getPlanetSymbol(planet.planet)}
              </div>
            ))}
          </div>
        </div>
        
        <div className="col-span-1 row-span-1 flex flex-col p-1 border border-gray-200" style={{ backgroundColor: `${getSignColor(houses[0].sign)}20` }}>
          <div className="flex justify-between text-xs">
            <span>1</span>
            <span>{houses[0].sign.substring(0, 3)}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center flex-1">
            {houses[0].planets.map((planet, i) => (
              <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                {getPlanetSymbol(planet.planet)}
              </div>
            ))}
          </div>
        </div>
        
        <div className="col-span-1 row-span-1 flex flex-col p-1 border border-gray-200" style={{ backgroundColor: `${getSignColor(houses[1].sign)}20` }}>
          <div className="flex justify-between text-xs">
            <span>2</span>
            <span>{houses[1].sign.substring(0, 3)}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center flex-1">
            {houses[1].planets.map((planet, i) => (
              <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                {getPlanetSymbol(planet.planet)}
              </div>
            ))}
          </div>
        </div>
        
        <div className="col-span-1 row-span-1 flex flex-col p-1 border border-gray-200" style={{ backgroundColor: `${getSignColor(houses[2].sign)}20` }}>
          <div className="flex justify-between text-xs">
            <span>3</span>
            <span>{houses[2].sign.substring(0, 3)}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center flex-1">
            {houses[2].planets.map((planet, i) => (
              <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                {getPlanetSymbol(planet.planet)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Second row */}
        <div className="col-span-1 row-span-1 flex flex-col p-1 border border-gray-200" style={{ backgroundColor: `${getSignColor(houses[10].sign)}20` }}>
          <div className="flex justify-between text-xs">
            <span>11</span>
            <span>{houses[10].sign.substring(0, 3)}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center flex-1">
            {houses[10].planets.map((planet, i) => (
              <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                {getPlanetSymbol(planet.planet)}
              </div>
            ))}
          </div>
        </div>
        
        <div className="col-span-2 row-span-2 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <span className="text-xl font-cinzel text-vedic-navy">🕉️</span>
        </div>
        
        <div className="col-span-1 row-span-1 flex flex-col p-1 border border-gray-200" style={{ backgroundColor: `${getSignColor(houses[3].sign)}20` }}>
          <div className="flex justify-between text-xs">
            <span>4</span>
            <span>{houses[3].sign.substring(0, 3)}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center flex-1">
            {houses[3].planets.map((planet, i) => (
              <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                {getPlanetSymbol(planet.planet)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Third row */}
        <div className="col-span-1 row-span-1 flex flex-col p-1 border border-gray-200" style={{ backgroundColor: `${getSignColor(houses[9].sign)}20` }}>
          <div className="flex justify-between text-xs">
            <span>10</span>
            <span>{houses[9].sign.substring(0, 3)}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center flex-1">
            {houses[9].planets.map((planet, i) => (
              <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                {getPlanetSymbol(planet.planet)}
              </div>
            ))}
          </div>
        </div>
        
        <div className="col-span-1 row-span-1 flex flex-col p-1 border border-gray-200" style={{ backgroundColor: `${getSignColor(houses[4].sign)}20` }}>
          <div className="flex justify-between text-xs">
            <span>5</span>
            <span>{houses[4].sign.substring(0, 3)}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center flex-1">
            {houses[4].planets.map((planet, i) => (
              <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                {getPlanetSymbol(planet.planet)}
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom row */}
        <div className="col-span-1 row-span-1 flex flex-col p-1 border border-gray-200" style={{ backgroundColor: `${getSignColor(houses[8].sign)}20` }}>
          <div className="flex justify-between text-xs">
            <span>9</span>
            <span>{houses[8].sign.substring(0, 3)}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center flex-1">
            {houses[8].planets.map((planet, i) => (
              <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                {getPlanetSymbol(planet.planet)}
              </div>
            ))}
          </div>
        </div>
        
        <div className="col-span-1 row-span-1 flex flex-col p-1 border border-gray-200" style={{ backgroundColor: `${getSignColor(houses[7].sign)}20` }}>
          <div className="flex justify-between text-xs">
            <span>8</span>
            <span>{houses[7].sign.substring(0, 3)}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center flex-1">
            {houses[7].planets.map((planet, i) => (
              <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                {getPlanetSymbol(planet.planet)}
              </div>
            ))}
          </div>
        </div>
        
        <div className="col-span-1 row-span-1 flex flex-col p-1 border border-gray-200" style={{ backgroundColor: `${getSignColor(houses[6].sign)}20` }}>
          <div className="flex justify-between text-xs">
            <span>7</span>
            <span>{houses[6].sign.substring(0, 3)}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center flex-1">
            {houses[6].planets.map((planet, i) => (
              <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                {getPlanetSymbol(planet.planet)}
              </div>
            ))}
          </div>
        </div>
        
        <div className="col-span-1 row-span-1 flex flex-col p-1 border border-gray-200" style={{ backgroundColor: `${getSignColor(houses[5].sign)}20` }}>
          <div className="flex justify-between text-xs">
            <span>6</span>
            <span>{houses[5].sign.substring(0, 3)}</span>
          </div>
          <div className="flex flex-wrap justify-center items-center flex-1">
            {houses[5].planets.map((planet, i) => (
              <div key={i} className="m-1 text-sm" title={`${planet.planet} at ${planet.degrees}° ${planet.sign}`}>
                {getPlanetSymbol(planet.planet)}
              </div>
            ))}
          </div>
        </div>
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
