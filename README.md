# Weather Timeline - Year Over Year Comparison

A modern, interactive web application that displays weather data on a horizontal timeline, allowing you to compare current weather with the same period from one year ago.

## Features

- **Dual Timeline View**: Compare current weather with weather from exactly one year ago, with both tracks aligned to the same calendar dates
- **Multiple Time Granularities**: Toggle between daily, weekly, and monthly views
- **Temperature Units**: Switch between °C and °F
- **Location Search**: Search for any city worldwide or use your current location
- **Modern Design**: Clean, responsive interface with smooth animations
- **Weather Data**: Temperature, weather conditions, and weather icons for each time period, colour-coded by temperature range

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
3. Click "Save Key" to store your API key locally
4. Start exploring weather timelines!

The key lives in your browser's `localStorage` and is never committed to this
repository. Use the "Change API Key" link in the controls bar to replace it.

## Deployment

### GitHub Pages

`.github/workflows/deploy-pages.yml` deploys the site on every push to `main`.
It needs a one-time setup step: **Settings → Pages → Source → GitHub Actions**.

### Publishing without asking visitors for a key

A static site cannot keep a secret — anything the browser needs to call
OpenWeatherMap is readable by anyone who opens DevTools. That includes a key
injected at build time from a GitHub Actions secret: Actions masks secrets in
logs, but the value still ships in the deployed JavaScript. OpenWeatherMap has
no HTTP-referrer restriction either, so a scraped key works from anywhere.

To publish a working demo without publishing the key, deploy the Cloudflare
Worker in `worker/`. It holds the key server-side and proxies the API calls.
See [`worker/README.md`](worker/README.md) for the deploy steps, then set
`API_PROXY_URL` at the top of `app.js` to the Worker's URL. The app hides the
API key prompt entirely when that is set.

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
- **Historical Data**: For demo purposes, derives past days from the current conditions with per-day variation

For production use with real historical data, you would need:
- OpenWeatherMap One Call API 3.0 (subscription required) for accurate historical weather data
- Or integration with alternative weather APIs that provide historical data in their free tier

### Request Volume

Loading a location costs **two API calls total** — one to resolve the place
name, one for current conditions. That single weather response seeds both
timelines, and changing the view or the temperature unit re-derives from it
without touching the network.

The simulated values are derived from each day's date rather than
`Math.random()`, so a given day shows the same weather every time instead of
reshuffling whenever you switch views.

### Data Accuracy

- Current day weather is accurate and real-time
- Historical weather data is simulated for demonstration purposes
- Weather conditions include: Clear, Clouds, Rain, Snow, Drizzle, Thunderstorm, Mist

## Project Structure

```
weather-timeline/
├── index.html                      # Main HTML structure
├── styles.css                      # Styling and layout
├── app.js                          # Application logic and API integration
├── worker/                         # Optional Cloudflare Worker API proxy
│   ├── index.js                    # Proxy that keeps the API key server-side
│   ├── wrangler.toml               # Worker config (no secrets)
│   └── README.md                   # Deploy instructions
├── .github/workflows/
│   └── deploy-pages.yml            # GitHub Pages deployment
└── README.md                       # This file
```

## Features Breakdown

### Current Features

- ✅ Horizontal timeline layout
- ✅ Dual timeline comparison (current vs. one year ago)
- ✅ Geolocation support
- ✅ City search functionality
- ✅ Daily/Weekly/Monthly view toggle
- ✅ Weather icons and conditions
- ✅ Temperature unit toggle (Celsius/Fahrenheit)
- ✅ Temperature colour-coding by range
- ✅ Responsive design
- ✅ Smooth scrolling and animations
- ✅ API key management
- ✅ Optional server-side API key via Cloudflare Worker

### Potential Enhancements

For future improvements, consider:

- Historical data integration with a premium API
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
- Free tier has a 60 calls/minute limit
- Loading a location costs two calls, so this is unlikely to be hit by normal
  use; if you do hit it, wait a minute before trying again

## License

This project is open source and available for educational and personal use.

## Credits

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Built with vanilla JavaScript, HTML, and CSS
