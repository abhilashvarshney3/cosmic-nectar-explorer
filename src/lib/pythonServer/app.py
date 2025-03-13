
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import swisseph as swe
import datetime
import pytz
from jyotishyam import Chart
import random

app = Flask(__name__)
CORS(app)

# Initialize swisseph with ephemeris path
# You need to download ephemeris files from https://www.astro.com/ftp/swisseph/ephe/
# and place them in the ephemeris directory
swe.set_ephe_path(os.path.join(os.path.dirname(__file__), 'ephemeris'))

# Planet and signs mappings
PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']
SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
         'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']

PLANET_DICT = {
    'Sun': swe.SUN,
    'Moon': swe.MOON,
    'Mercury': swe.MERCURY,
    'Venus': swe.VENUS,
    'Mars': swe.MARS,
    'Jupiter': swe.JUPITER,
    'Saturn': swe.SATURN,
    'Rahu': swe.MEAN_NODE,  # North Node
    'Ketu': -1  # South Node, calculated from Rahu
}

@app.route('/vedic_astrology_project/script/generate-birth-chart', methods=['POST'])
def generate_birth_chart():
    """
    Generate Vedic astrology birth chart based on birth details.
    
    Expected JSON input:
    {
        "name": "John Doe",
        "date": "2000-03-15T12:30:00.000Z",
        "time": "12:30",
        "location": "New York, USA"
    }
    """
    try:
        data = request.json
        print(f"Received data: {data}")
        
        # Extract birth details
        name = data.get('name')
        birth_date_str = data.get('date')
        birth_time = data.get('time')
        location = data.get('location')
        
        # Parse birth date and time
        birth_datetime = datetime.datetime.fromisoformat(birth_date_str.replace('Z', '+00:00'))
        
        # TODO: Use a geocoding API to get latitude and longitude from location
        # For now, using simple mock coordinates
        lat, lon = get_mock_coordinates(location)
        
        # Calculate birth chart
        birth_chart = calculate_vedic_birth_chart(birth_datetime, lat, lon)
        
        return jsonify(birth_chart)
    
    except Exception as e:
        print(f"Error generating birth chart: {str(e)}")
        return jsonify({
            "error": str(e),
            "message": "Failed to generate birth chart"
        }), 500

@app.route('/vedic_astrology_project/script/chat', methods=['POST'])
def chat():
    """
    Process user messages and generate astrology insights.
    
    Expected JSON input:
    {
        "message": "What does my Sun in the 1st house mean?",
        "birthDetails": {...},
        "birthChart": {...}
    }
    """
    try:
        data = request.json
        message = data.get('message')
        birth_details = data.get('birthDetails')
        birth_chart = data.get('birthChart')
        
        # Generate response based on message and birth chart
        response = generate_astrology_insight(message, birth_details, birth_chart)
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Error processing chat: {str(e)}")
        return jsonify({
            "error": str(e),
            "message": "Failed to process your message"
        }), 500

def get_mock_coordinates(location):
    """
    Mock function to return latitude and longitude for a location.
    In a production app, this would use a geocoding API.
    """
    # Dictionary of some common locations
    locations = {
        "new york": (40.7128, -74.0060),
        "london": (51.5074, -0.1278),
        "tokyo": (35.6762, 139.6503),
        "delhi": (28.6139, 77.2090),
        "mumbai": (19.0760, 72.8777),
        "bangalore": (12.9716, 77.5946),
        "chennai": (13.0827, 80.2707),
        "hyderabad": (17.3850, 78.4867),
        "kolkata": (22.5726, 88.3639),
        "pune": (18.5204, 73.8567),
    }
    
    # Check if location is in our dictionary
    location_lower = location.lower()
    for key, coords in locations.items():
        if key in location_lower:
            return coords
    
    # Default to Delhi coordinates if location not found
    return (28.6139, 77.2090)

def calculate_vedic_birth_chart(birth_datetime, lat, lon):
    """
    Calculate Vedic birth chart using swisseph and jyotishyam.
    """
    try:
        # Initialize jyotishyam chart
        chart = Chart(birth_datetime, lat, lon, 'Lahiri')
        
        # Set Julian day
        year, month, day = birth_datetime.year, birth_datetime.month, birth_datetime.day
        hour, minute, second = birth_datetime.hour, birth_datetime.minute, birth_datetime.second
        julian_day = swe.julday(year, month, day, hour + minute/60.0 + second/3600.0)
        
        # Calculate ayanamsa (precession)
        ayanamsa = swe.get_ayanamsa(julian_day)
        
        # Get ascendant (lagna)
        ascendant_lon = swe.houses(julian_day, lat, lon)[0]  # First house cusp
        ascendant_sign = int((ascendant_lon - ayanamsa) / 30) % 12
        
        # Calculate houses and planets
        houses = []
        planet_positions = []
        
        # Create houses
        for i in range(1, 13):
            house_sign_index = (ascendant_sign + i - 1) % 12
            houses.append({
                "number": i,
                "sign": SIGNS[house_sign_index],
                "planets": []
            })
        
        # Calculate planet positions
        for planet_name, planet_id in PLANET_DICT.items():
            if planet_id == -1:  # Ketu (South Node)
                # Ketu is always 180 degrees from Rahu
                rahu_lon = None
                for p in planet_positions:
                    if p['planet'] == 'Rahu':
                        rahu_lon = p['degrees']
                        break
                
                if rahu_lon is not None:
                    ketu_lon = (rahu_lon + 180) % 360
                    ketu_sign = int((ketu_lon - ayanamsa) / 30) % 12
                    ketu_house = ((ketu_sign - ascendant_sign) % 12) + 1
                    
                    planet_pos = {
                        "planet": "Ketu",
                        "house": ketu_house,
                        "sign": SIGNS[ketu_sign],
                        "degrees": ketu_lon % 30
                    }
                    
                    planet_positions.append(planet_pos)
                    
                    # Add planet to its house
                    for house in houses:
                        if house["number"] == ketu_house:
                            house["planets"].append(planet_pos)
            else:
                # Calculate position for other planets
                lon, lat, dist = swe.calc_ut(julian_day, planet_id)[0:3]
                
                # Adjust longitude to sidereal (Vedic)
                lon_sidereal = (lon - ayanamsa) % 360
                sign = int(lon_sidereal / 30)
                house = ((sign - ascendant_sign) % 12) + 1
                
                planet_pos = {
                    "planet": planet_name,
                    "house": house,
                    "sign": SIGNS[sign],
                    "degrees": lon_sidereal % 30
                }
                
                planet_positions.append(planet_pos)
                
                # Add planet to its house
                for h in houses:
                    if h["number"] == house:
                        h["planets"].append(planet_pos)
        
        return {
            "ascendant": SIGNS[ascendant_sign],
            "houses": houses,
            "planets": planet_positions
        }
    
    except Exception as e:
        print(f"Error in calculate_vedic_birth_chart: {str(e)}")
        # If calculation fails, fall back to mock data
        return generate_mock_birth_chart()

def generate_mock_birth_chart(birth_details=None):
    """
    Generate mock birth chart data when real calculation fails or for testing.
    """
    # Determine a random ascendant
    ascendant_index = random.randint(0, 11)
    ascendant = SIGNS[ascendant_index]
    
    # Generate houses
    houses = []
    for i in range(1, 13):
        sign_index = (ascendant_index + i - 1) % 12
        houses.append({
            "number": i,
            "sign": SIGNS[sign_index],
            "planets": []
        })
    
    # Generate planet positions
    planets = []
    for planet in PLANETS:
        # Random house and sign
        house_num = random.randint(1, 12)
        sign_index = (ascendant_index + house_num - 1) % 12
        sign = SIGNS[sign_index]
        degrees = random.uniform(0, 30)
        
        planet_data = {
            "planet": planet,
            "house": house_num,
            "sign": sign,
            "degrees": degrees
        }
        
        planets.append(planet_data)
        
        # Add planet to its house
        for house in houses:
            if house["number"] == house_num:
                house["planets"].append(planet_data)
    
    return {
        "ascendant": ascendant,
        "houses": houses,
        "planets": planets
    }

def generate_astrology_insight(message, birth_details, birth_chart):
    """
    Generate astrology insights based on the message and birth chart.
    This is a simple rule-based system. In production, you would use a 
    more sophisticated AI model trained on Vedic astrology.
    """
    message_lower = message.lower()
    
    # Check if planetary data is requested
    if any(word in message_lower for word in ['planet', 'position', 'where']):
        return {
            "id": datetime.datetime.now().timestamp(),
            "content": f"Here are your planetary positions based on Vedic astrology:",
            "sender": "ai",
            "timestamp": datetime.datetime.now().isoformat(),
            "type": "planetary",
            "planetaryData": birth_chart.get('planets', [])
        }
    
    # Check if this is about specific planets
    for planet in PLANETS:
        if planet.lower() in message_lower:
            # Find the planet in the birth chart
            planet_info = None
            for p in birth_chart.get('planets', []):
                if p['planet'].lower() == planet.lower():
                    planet_info = p
                    break
            
            if planet_info:
                return generate_planet_insight(planet_info)
    
    # Check if this is about houses
    for i in range(1, 13):
        house_patterns = [f"{i}th house", f"{i} house", f"house {i}"]
        if any(pattern in message_lower for pattern in house_patterns):
            # Find the house in the birth chart
            house_info = None
            for h in birth_chart.get('houses', []):
                if h['number'] == i:
                    house_info = h
                    break
            
            if house_info:
                return generate_house_insight(house_info)
    
    # Check for remedies
    if any(word in message_lower for word in ['remedy', 'solution', 'fix', 'improve']):
        return generate_remedies(birth_chart)
    
    # Check for general chart analysis or career
    if any(word in message_lower for word in ['career', 'profession', 'job', 'work']):
        return generate_career_insight(birth_chart)
    
    if any(word in message_lower for word in ['relationship', 'marriage', 'love', 'partner']):
        return generate_relationship_insight(birth_chart)
    
    if any(word in message_lower for word in ['health', 'medical', 'wellbeing']):
        return generate_health_insight(birth_chart)
    
    if any(word in message_lower for word in ['finance', 'money', 'wealth', 'financial']):
        return generate_finance_insight(birth_chart)
    
    # Default general analysis
    return generate_general_chart_analysis(birth_chart)

def generate_planet_insight(planet_info):
    """Generate insight for a specific planet."""
    planet = planet_info['planet']
    house = planet_info['house']
    sign = planet_info['sign']
    
    insights = {
        "Sun": f"Your Sun in {sign} in the {house}th house indicates {get_sun_insight(sign, house)}",
        "Moon": f"Your Moon in {sign} in the {house}th house suggests {get_moon_insight(sign, house)}",
        "Mercury": f"Mercury in {sign} in the {house}th house shows {get_mercury_insight(sign, house)}",
        "Venus": f"Venus in {sign} in the {house}th house indicates {get_venus_insight(sign, house)}",
        "Mars": f"Mars in {sign} in the {house}th house suggests {get_mars_insight(sign, house)}",
        "Jupiter": f"Jupiter in {sign} in the {house}th house shows {get_jupiter_insight(sign, house)}",
        "Saturn": f"Saturn in {sign} in the {house}th house indicates {get_saturn_insight(sign, house)}",
        "Rahu": f"Rahu (North Node) in {sign} in the {house}th house suggests {get_rahu_insight(sign, house)}",
        "Ketu": f"Ketu (South Node) in {sign} in the {house}th house shows {get_ketu_insight(sign, house)}"
    }
    
    content = insights.get(planet, f"{planet} in {sign} in the {house}th house influences your life in various ways.")
    
    return {
        "id": datetime.datetime.now().timestamp(),
        "content": content,
        "sender": "ai",
        "timestamp": datetime.datetime.now().isoformat()
    }

# Helper functions to generate insights
def get_sun_insight(sign, house):
    insights = {
        1: "strong leadership qualities and self-confidence.",
        2: "material security is important to your identity.",
        3: "strong communication skills and intellectual curiosity.",
        4: "a strong connection to home and family matters.",
        5: "creative self-expression and possibly children are central to your identity.",
        6: "service to others and health matters are important to you.",
        7: "relationships and partnerships are central to your sense of self.",
        8: "transformation and deep psychological understanding.",
        9: "a philosophical nature and interest in higher learning or spirituality.",
        10: "career ambitions and public recognition are important to you.",
        11: "social connections and humanitarian ideals shape your identity.",
        12: "spiritual growth and working behind the scenes."
    }
    return insights.get(house, "various influences on your personality and life path.")

# Add similar functions for other planets
def get_moon_insight(sign, house):
    insights = {
        1: "emotional sensitivity and your feelings are openly expressed.",
        2: "emotional security is tied to material possessions.",
        3: "your emotions are intellectualized and you communicate your feelings well.",
        4: "deep emotional connection to home and family.",
        5: "emotional fulfillment through creativity and children.",
        6: "emotional satisfaction through service and helping others.",
        7: "emotional fulfillment through relationships and partnerships.",
        8: "deep emotional transformations and psychological insights.",
        9: "emotional connection to philosophy, higher learning or spirituality.",
        10: "emotional fulfillment through career achievements.",
        11: "emotional connection to friends and social groups.",
        12: "rich inner emotional life and spiritual sensitivity."
    }
    return insights.get(house, "various emotional patterns in your life.")

# Add similar functions for other planets and for houses

def get_mercury_insight(sign, house):
    # Simple placeholder
    return "particular communication and thinking patterns."

def get_venus_insight(sign, house):
    # Simple placeholder
    return "specific patterns in relationships and what you value."

def get_mars_insight(sign, house):
    # Simple placeholder
    return "how you assert yourself and your energy patterns."

def get_jupiter_insight(sign, house):
    # Simple placeholder
    return "areas of growth, expansion and wisdom in your life."

def get_saturn_insight(sign, house):
    # Simple placeholder
    return "areas of limitation, responsibility and life lessons."

def get_rahu_insight(sign, house):
    # Simple placeholder
    return "desires and obsessions that drive your soul's growth."

def get_ketu_insight(sign, house):
    # Simple placeholder
    return "areas of detachment and spiritual evolution."

def generate_house_insight(house_info):
    # Simple placeholder
    house_num = house_info['number']
    sign = house_info['sign']
    planets = house_info['planets']
    
    planet_names = [p['planet'] for p in planets]
    planets_text = ", ".join(planet_names) if planet_names else "no planets"
    
    house_meanings = {
        1: "physical appearance, personality, and how others see you",
        2: "possessions, values, and financial matters",
        3: "communication, siblings, and short journeys",
        4: "home, family, and emotional foundation",
        5: "creativity, children, romance, and pleasure",
        6: "health, daily routine, and service to others",
        7: "partnerships, marriage, and open enemies",
        8: "transformation, joint resources, and the occult",
        9: "higher education, long journeys, and philosophy",
        10: "career, public standing, and authority",
        11: "friends, groups, and hopes and wishes",
        12: "spiritual growth, hidden matters, and self-undoing"
    }
    
    house_meaning = house_meanings.get(house_num, "various aspects of your life")
    
    content = f"Your {house_num}th house is in {sign} with {planets_text}. This house represents {house_meaning}."
    
    if planets:
        content += f" The presence of {', '.join(planet_names)} here emphasizes and influences these areas of your life."
    
    return {
        "id": datetime.datetime.now().timestamp(),
        "content": content,
        "sender": "ai",
        "timestamp": datetime.datetime.now().isoformat()
    }

def generate_remedies(birth_chart):
    # Simple placeholder for remedies
    planets = birth_chart.get('planets', [])
    
    # Check for challenging placements (very simplified)
    challenging_planets = []
    for planet in planets:
        # In real astrology, this would be much more sophisticated
        if planet['planet'] in ['Saturn', 'Mars', 'Rahu', 'Ketu']:
            challenging_planets.append(planet['planet'])
    
    remedies = []
    if 'Saturn' in challenging_planets:
        remedies.append("For Saturn: Wear a blue sapphire (neelam) on your middle finger on Saturday during Shani hora. Recite Shani mantras and donate black items on Saturdays.")
    
    if 'Mars' in challenging_planets:
        remedies.append("For Mars: Wear a red coral (moonga) on your ring finger on Tuesday morning. Recite Hanuman Chalisa and Mars mantras. Donate red lentils on Tuesdays.")
    
    if 'Rahu' in challenging_planets:
        remedies.append("For Rahu: Wear a hessonite (gomed) on your middle finger. Feed crows and donate dark blue or black items. Recite Durga mantras for protection.")
    
    if 'Ketu' in challenging_planets:
        remedies.append("For Ketu: Wear a cat's eye (lehsunia) gemstone. Donate mixed grains to birds. Practice meditation and spiritual disciplines.")
    
    # General remedies
    general_remedies = [
        "Regular meditation and yoga practice helps balance planetary energies.",
        "Recite the Gayatri mantra daily for overall spiritual protection.",
        "Perform charity or seva (selfless service) to mitigate challenging planetary influences."
    ]
    
    if not remedies:
        remedies = general_remedies
    else:
        remedies.extend(general_remedies)
    
    return {
        "id": datetime.datetime.now().timestamp(),
        "content": "Based on your Vedic birth chart, I recommend the following remedies:\n\n• " + "\n\n• ".join(remedies),
        "sender": "ai",
        "timestamp": datetime.datetime.now().isoformat(),
        "type": "remedy"
    }

def generate_general_chart_analysis(birth_chart):
    # Placeholder for general analysis
    ascendant = birth_chart.get('ascendant', 'unknown sign')
    
    response = f"Your Vedic astrology chart has {ascendant} rising, which indicates "
    
    ascendant_traits = {
        "Aries": "a dynamic and assertive personality with leadership qualities.",
        "Taurus": "a grounded, practical and patient approach to life with an appreciation for beauty and comfort.",
        "Gemini": "an intellectually curious and communicative nature with versatile interests.",
        "Cancer": "an emotionally sensitive nature with strong nurturing instincts and attachment to home and family.",
        "Leo": "a confident, creative and dignified personality with a need for recognition.",
        "Virgo": "an analytical, detail-oriented and service-minded approach to life.",
        "Libra": "a diplomatic and partnership-oriented nature with an appreciation for harmony and beauty.",
        "Scorpio": "an intense, passionate and transformative personality with deep psychological insight.",
        "Sagittarius": "an optimistic, philosophical and freedom-loving nature with interest in expanding horizons.",
        "Capricorn": "an ambitious, disciplined and responsible personality focused on achievement.",
        "Aquarius": "an innovative, independent and humanitarian nature with unique thinking patterns.",
        "Pisces": "a compassionate, imaginative and spiritually sensitive personality with intuitive gifts."
    }
    
    response += ascendant_traits.get(ascendant, "unique personality traits and life patterns.")
    
    # Add a few more insights
    planets = birth_chart.get('planets', [])
    for planet in planets:
        if planet['planet'] == 'Moon':
            response += f"\n\nYour Moon is in {planet['sign']} in the {planet['house']}th house, indicating your emotional nature and mind."
        elif planet['planet'] == 'Sun':
            response += f"\n\nYour Sun is in {planet['sign']} in the {planet['house']}th house, showing your core identity and vitality."
    
    return {
        "id": datetime.datetime.now().timestamp(),
        "content": response,
        "sender": "ai",
        "timestamp": datetime.datetime.now().isoformat()
    }

def generate_career_insight(birth_chart):
    # Simple placeholder for career insights
    return {
        "id": datetime.datetime.now().timestamp(),
        "content": "Your career path is influenced by multiple factors in your Vedic chart, particularly the 10th house, its ruler, and planets like Sun, Saturn and Jupiter. Based on your chart pattern, you may excel in fields that require analytical thinking, problem-solving abilities, and helping others.",
        "sender": "ai",
        "timestamp": datetime.datetime.now().isoformat()
    }

def generate_relationship_insight(birth_chart):
    # Simple placeholder for relationship insights
    return {
        "id": datetime.datetime.now().timestamp(),
        "content": "Your relationship patterns are primarily shown by Venus, the 7th house, and the Moon in your Vedic chart. Your chart indicates you value intellectual connection and communication in relationships, and you seek a partner who can engage with you on multiple levels.",
        "sender": "ai",
        "timestamp": datetime.datetime.now().isoformat()
    }

def generate_health_insight(birth_chart):
    # Simple placeholder for health insights
    return {
        "id": datetime.datetime.now().timestamp(),
        "content": "Health in Vedic astrology is seen through the 1st, 6th, and 8th houses, along with planets like Sun and Saturn. Your chart suggests paying attention to digestive health and stress management. Regular physical activity and mindfulness practices would be beneficial for your constitution.",
        "sender": "ai",
        "timestamp": datetime.datetime.now().isoformat()
    }

def generate_finance_insight(birth_chart):
    # Simple placeholder for financial insights
    return {
        "id": datetime.datetime.now().timestamp(),
        "content": "Financial matters in your chart are governed by the 2nd, 11th houses and planets like Venus and Jupiter. Your chart indicates potential for steady income through multiple sources, with periods of financial growth especially during Jupiter's favorable transits.",
        "sender": "ai",
        "timestamp": datetime.datetime.now().isoformat()
    }

if __name__ == "__main__":
    app.run(debug=True, port=5000)
