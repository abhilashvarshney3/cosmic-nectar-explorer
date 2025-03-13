
# Vedic Astrology Python Backend

This is a Python backend server that provides Vedic astrology calculations and AI-powered insights for the Vedic Astrology Guide application.

## Setup Instructions

1. Install Python 3.8+ if not already installed

2. Install the required dependencies:
```
pip install -r requirements.txt
```

3. Download Swiss Ephemeris files:
   - Create a folder named `ephemeris` in the same directory as `app.py`
   - Download ephemeris files from https://www.astro.com/ftp/swisseph/ephe/
   - Place the downloaded files in the `ephemeris` folder

4. Run the server:
```
python app.py
```

The server will start at http://localhost:5000

## API Endpoints

### Generate Birth Chart
`POST /vedic_astrology_project/script/generate-birth-chart`

Generates a Vedic astrology birth chart based on birth details.

Request body:
```json
{
  "name": "John Doe",
  "date": "2000-03-15T12:30:00.000Z",
  "time": "12:30",
  "location": "New York, USA"
}
```

### Chat
`POST /vedic_astrology_project/script/chat`

Process user messages and generate astrology insights based on birth chart.

Request body:
```json
{
  "message": "What does my Sun in the 1st house mean?",
  "birthDetails": {...},
  "birthChart": {...}
}
```

## Features

- Birth chart calculation using Swiss Ephemeris
- Ascendant and house calculation
- Planetary positions in signs and houses
- Interpretation of planets in houses and signs
- Remedies based on chart analysis
- Career, relationship, health, and financial insights
- General chart analysis

## Astrology Data Sources

The interpretations are based on traditional Vedic astrology principles. For production use, consider expanding the knowledge base with more detailed interpretations from authoritative Vedic astrology texts.
