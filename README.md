# Weather Timeline - Year Over Year Comparison

A modern, interactive web application that displays **real historical weather data** on a horizontal timeline, allowing you to compare current weather with the same period from one year ago.

## Features

- **Dual Timeline View**: Compare current weather with weather from exactly one year ago
- **Real Historical Data**: Uses Open-Meteo API with 80+ years of actual historical weather data
- **Multiple Time Granularities**: Toggle between daily, weekly, and monthly views
- **Location Search**: Search for any city worldwide or use your current location
- **No API Key Required**: Completely free to use, no signup needed
- **Modern Design**: Clean, responsive interface with smooth animations
- **Comprehensive Weather Data**: Temperature, weather conditions, and detailed weather codes

## Quick Start

Simply open `index.html` in your web browser and start exploring weather timelines!

**No setup required** - the app uses the free Open-Meteo API which doesn't require any API key or authentication.

## How to Use

### Location Selection

- **Use My Location**: Click the "Use My Location" button to automatically detect your current location (requires browser permission)
- **Search for a City**: Type a city name in the search box and click "Search" or press Enter
  - Examples: "London", "New York", "Tokyo", "Paris, France"
  - Tip: Include country for better accuracy (e.g., "Paris, France")

### View Options

Toggle between different time views:

- **Daily**: View day-by-day weather data for the past 30 days
- **Weekly**: View weekly averaged weather data for the past 12 weeks
- **Monthly**: View monthly averaged weather data for the past 12 months

### Timeline Navigation

- **Scroll**: Use your mouse wheel or touchpad to scroll through the timeline
- **Arrow Buttons**: Click the left/right arrow buttons to navigate
- **Current Day**: The current day is highlighted with a blue border

### Timeline Layout

- **Top Timeline**: Shows current year weather data
- **Bottom Timeline**: Shows weather from exactly one year ago at the same dates
- Timeline scrolls from right (present) to left (past)

## Technical Details

### Technologies Used

- Pure HTML, CSS, and JavaScript (no frameworks required)
- **Open-Meteo API** for weather data
  - Free and open-source
  - 80+ years of historical weather data
  - 10km resolution
  - No API key required
- Geolocation API for automatic location detection

### API Features

**Open-Meteo Advantages:**
- ✅ **Real Historical Data**: Unlike many free weather APIs, Open-Meteo provides actual historical weather data going back 80+ years
- ✅ **No API Key**: No signup or authentication required
- ✅ **Completely Free**: No usage limits for reasonable use
- ✅ **High Quality**: WMO weather codes and comprehensive data
- ✅ **Fast & Reliable**: Optimized for performance

### Weather Data Accuracy

- **All weather data is real and historical** - not simulated
- Weather conditions are based on WMO (World Meteorological Organization) weather codes
- Temperature data includes daily mean, max, and min values
- Weather codes include detailed conditions:
  - Clear skies (0)
  - Partly cloudy (1-3)
  - Fog (45-48)
  - Drizzle (51-57)
  - Rain (61-67, 80-82)
  - Snow (71-77, 85-86)
  - Thunderstorms (95-99)

## Project Structure

```
weather-timeline/
├── index.html          # Main HTML structure
├── styles.css          # Styling and layout
├── app.js             # Application logic and API integration
└── README.md          # This file
```

## Features Breakdown

### Current Features

- ✅ Horizontal timeline layout
- ✅ Dual timeline comparison (current vs. one year ago)
- ✅ Real historical weather data (80+ years)
- ✅ Geolocation support
- ✅ City search functionality with geocoding
- ✅ Daily/Weekly/Monthly view toggle
- ✅ Weather icons and detailed conditions
- ✅ Temperature display in Celsius
- ✅ Responsive design
- ✅ Smooth scrolling and animations
- ✅ No API key required

### Potential Enhancements

For future improvements, consider:

- Temperature unit toggle (Celsius/Fahrenheit)
- Extended weather details (humidity, wind speed, pressure) - data is available via API
- Additional precipitation data visualization
- Data export functionality
- Weather trends and analytics
- Custom date range selection
- Multiple location comparison
- Dark mode support
- Historical weather charts and graphs

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Privacy

- Location data is only used for weather queries and is not stored
- No data is sent to any server other than Open-Meteo
- No tracking, cookies, or data collection
- Completely client-side application

## Troubleshooting

### "City not found" error
- Check spelling of the city name
- Try including country code (e.g., "London, UK")
- Try alternative spellings or the capital city of the region

### Geolocation not working
- Ensure you've granted location permissions to your browser
- Try using HTTPS instead of HTTP (geolocation requires secure context)
- Check browser compatibility
- Try searching for your city manually instead

### Slow loading
- The app fetches historical data for multiple days, which may take a few seconds
- Monthly view requires more data than daily view
- Check your internet connection
- Wait for loading indicator to complete

### Weather data seems incorrect
- Open-Meteo provides real historical data from meteorological stations
- Some remote areas may have interpolated data
- Try selecting a nearby major city for more accurate data

## API Information

### Open-Meteo API Endpoints Used

1. **Geocoding API**: `https://geocoding-api.open-meteo.com/v1/search`
   - Used for city search and reverse geocoding

2. **Historical Weather API**: `https://archive-api.open-meteo.com/v1/archive`
   - Provides 80+ years of historical weather data
   - Parameters used:
     - `temperature_2m_mean` - Daily mean temperature
     - `temperature_2m_max` - Daily maximum temperature
     - `temperature_2m_min` - Daily minimum temperature
     - `weathercode` - WMO weather code
     - `precipitation_sum` - Daily precipitation

### Why Open-Meteo?

We chose Open-Meteo over other weather APIs because:

1. **Free Historical Data**: Most free weather APIs don't provide real historical data
2. **No API Key**: No signup or authentication barriers
3. **High Quality**: Based on reputable meteorological data sources
4. **Good Coverage**: Global coverage with good resolution
5. **Well Documented**: Clear API documentation and weather code standards

## Attribution

- Weather data provided by **[Open-Meteo.com](https://open-meteo.com/)** - Free open-source weather API
- Based on data from national weather services and the ERA5 reanalysis

## License

This project is open source and available for educational and personal use.

---

**Enjoy exploring weather patterns across time!** 🌤️📊
