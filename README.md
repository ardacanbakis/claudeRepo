# Weather Timeline - Year Over Year Comparison

A modern, interactive web application that displays weather data on a horizontal timeline, allowing you to compare current weather with the same period from one year ago.

## Features

- **Dual Timeline View**: Compare current weather with weather from exactly one year ago
- **Multiple Time Granularities**: Toggle between daily, weekly, and monthly views
- **Location Search**: Search for any city worldwide or use your current location
- **Modern Design**: Clean, responsive interface with smooth animations
- **Weather Data**: Temperature, weather conditions, and weather icons for each time period

## Setup

### Prerequisites

1. A modern web browser (Chrome, Firefox, Safari, or Edge)
2. An OpenWeatherMap API key (free tier available)

### Getting Your API Key

1. Visit [OpenWeatherMap API](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key
5. Note: It may take a few minutes for your API key to become active after creation

### Running the Application

1. Open `index.html` in your web browser
2. When prompted, enter your OpenWeatherMap API key
3. Click "Save" to store your API key locally
4. Start exploring weather timelines!

## How to Use

### Location Selection

- **Use My Location**: Click the "Use My Location" button to automatically detect your current location (requires browser permission)
- **Search for a City**: Type a city name in the search box and click "Search" or press Enter

### View Options

Toggle between different time views:

- **Daily**: View day-by-day weather data
- **Weekly**: View weekly averaged weather data
- **Monthly**: View monthly averaged weather data

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
- OpenWeatherMap API for weather data
- Geolocation API for automatic location detection
- LocalStorage for API key persistence

### API Limitations

**Important Note**: The free tier of OpenWeatherMap API has limitations for historical data. This application uses the following approach:

- **Today's Weather**: Fetches real-time current weather data
- **Historical Data**: For demo purposes, simulates historical data based on current weather with random variations

For production use with real historical data, you would need:
- OpenWeatherMap One Call API 3.0 (subscription required) for accurate historical weather data
- Or integration with alternative weather APIs that provide historical data in their free tier

### Data Accuracy

- Current day weather is accurate and real-time
- Historical weather data is simulated for demonstration purposes
- Weather conditions include: Clear, Clouds, Rain, Snow, Drizzle, Thunderstorm, Mist

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
- ✅ Geolocation support
- ✅ City search functionality
- ✅ Daily/Weekly/Monthly view toggle
- ✅ Weather icons and conditions
- ✅ Temperature display in Celsius
- ✅ Responsive design
- ✅ Smooth scrolling and animations
- ✅ API key management

### Potential Enhancements

For future improvements, consider:

- Historical data integration with a premium API
- Temperature unit toggle (Celsius/Fahrenheit)
- Extended weather details (humidity, wind speed, pressure)
- Data export functionality
- Weather trends and analytics
- Custom date range selection
- Multiple location comparison
- Dark mode support

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Privacy

- Your API key is stored locally in your browser's LocalStorage
- Location data is only used for weather queries and is not stored
- No data is sent to any server other than OpenWeatherMap

## Troubleshooting

### "City not found" error
- Check spelling of the city name
- Try including country code (e.g., "London, UK")

### "Failed to load weather data" error
- Verify your API key is correct
- Ensure your API key has been activated (can take a few minutes)
- Check your internet connection

### Geolocation not working
- Ensure you've granted location permissions to your browser
- Try using HTTPS instead of HTTP
- Check browser compatibility

### API rate limiting
- Free tier has 60 calls/minute limit
- Reduce the number of data points loaded
- Wait a minute before trying again

## License

This project is open source and available for educational and personal use.

## Credits

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Built with vanilla JavaScript, HTML, and CSS
