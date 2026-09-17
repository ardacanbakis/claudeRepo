// URL of the Cloudflare Worker that proxies OpenWeatherMap with the API key
// held server-side (see worker/README.md). When set, visitors never need a key
// of their own. Leave empty to call OpenWeatherMap directly with a key the
// visitor enters, stored in their browser's localStorage.
const API_PROXY_URL = '';

const OWM_BASE = 'https://api.openweathermap.org';

// Worker route vs. direct OpenWeatherMap path for each endpoint we use.
const ENDPOINTS = {
    weather: { proxy: '/api/weather', direct: '/data/2.5/weather' },
    geoDirect: { proxy: '/api/geo/direct', direct: '/geo/1.0/direct' },
    geoReverse: { proxy: '/api/geo/reverse', direct: '/geo/1.0/reverse' }
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Weather Timeline App
class WeatherTimeline {
    constructor() {
        this.usingProxy = Boolean(API_PROXY_URL);
        this.apiKey = localStorage.getItem('openweather_api_key') || '';
        this.currentLocation = null;
        this.currentView = 'daily'; // daily, weekly, monthly
        this.tempUnit = 'C'; // C or F
        this.toastTimeout = null;
        this.weatherSeed = null;
        this.weatherData = {
            current: [],
            previous: []
        };

        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();

        // The proxy holds the key, so there is nothing for the visitor to enter.
        if (this.usingProxy) {
            this.apiKeySection.style.display = 'none';
            this.apiKeyInfo.style.display = 'none';
        } else if (this.apiKey) {
            this.hideApiKeySection();
        } else {
            this.showApiKeySection();
        }
    }

    // Build a request URL for either the proxy or OpenWeatherMap directly.
    apiUrl(endpoint, params) {
        const route = ENDPOINTS[endpoint];
        const url = this.usingProxy
            ? new URL(API_PROXY_URL.replace(/\/$/, '') + route.proxy)
            : new URL(OWM_BASE + route.direct);

        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });

        if (!this.usingProxy) {
            url.searchParams.set('appid', this.apiKey);
        }

        return url.toString();
    }

    setupElements() {
        // API Key elements
        this.apiKeySection = document.getElementById('apiKeySection');
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
        this.apiKeyInfo = document.getElementById('apiKeyInfo');
        this.changeApiKeyBtn = document.getElementById('changeApiKeyBtn');

        // Control elements
        this.geolocationBtn = document.getElementById('geolocationBtn');
        this.citySearch = document.getElementById('citySearch');
        this.searchBtn = document.getElementById('searchBtn');
        this.viewBtns = document.querySelectorAll('.btn-view');
        this.unitCBtn = document.getElementById('unitC');
        this.unitFBtn = document.getElementById('unitF');

        // Display elements
        this.locationDisplay = document.getElementById('currentLocation');
        this.timelineContainer = document.getElementById('timelineContainer');
        this.currentTrack = document.getElementById('currentTrack');
        this.previousTrack = document.getElementById('previousTrack');
        this.currentYearLabel = document.getElementById('currentYearLabel');
        this.previousYearLabel = document.getElementById('previousYearLabel');

        // Scroll containers
        this.currentTimeline = document.getElementById('currentTimeline');
        this.previousTimeline = document.getElementById('previousTimeline');

        // Utility elements
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.toast = document.getElementById('toast');

        // Scroll buttons
        this.scrollBtns = document.querySelectorAll('.scroll-btn');
    }

    setupEventListeners() {
        // API Key
        this.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        this.apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveApiKey();
        });
        this.changeApiKeyBtn.addEventListener('click', () => this.showApiKeySection());

        // Location
        this.geolocationBtn.addEventListener('click', () => this.useGeolocation());
        this.searchBtn.addEventListener('click', () => this.searchCity());
        this.citySearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCity();
        });

        // View toggle
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.viewBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentView = e.target.dataset.view;
                // Both timelines derive from the cached seed, so no refetch.
                if (this.weatherSeed) {
                    this.buildTimelines();
                }
            });
        });

        // Unit toggle
        this.unitCBtn.addEventListener('click', () => this.setTempUnit('C'));
        this.unitFBtn.addEventListener('click', () => this.setTempUnit('F'));

        // Scroll buttons
        this.scrollBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scrollElement = e.currentTarget.dataset.timeline === 'current'
                    ? this.currentTimeline
                    : this.previousTimeline;

                const scrollAmount = 300;
                if (e.currentTarget.classList.contains('scroll-left')) {
                    scrollElement.scrollLeft -= scrollAmount;
                } else {
                    scrollElement.scrollLeft += scrollAmount;
                }
            });
        });
    }

    // Temperature unit management
    setTempUnit(unit) {
        this.tempUnit = unit;
        this.unitCBtn.classList.toggle('active', unit === 'C');
        this.unitFBtn.classList.toggle('active', unit === 'F');
        this.unitCBtn.setAttribute('aria-pressed', unit === 'C');
        this.unitFBtn.setAttribute('aria-pressed', unit === 'F');

        // Re-render if data is loaded
        if (this.weatherData.current.length > 0) {
            this.renderTimelines();
        }
    }

    displayTemp(celsius) {
        if (this.tempUnit === 'F') {
            return `${Math.round(celsius * 9 / 5 + 32)}°F`;
        }
        return `${celsius}°C`;
    }

    getTemperatureClass(celsius) {
        if (celsius >= 30) return 'temp-hot';
        if (celsius >= 20) return 'temp-warm';
        if (celsius >= 10) return 'temp-mild';
        if (celsius >= 0) return 'temp-cool';
        return 'temp-cold';
    }

    // API Key Management
    saveApiKey() {
        const apiKey = this.apiKeyInput.value.trim();
        if (!apiKey) {
            this.showToast('Please enter a valid API key', 'error');
            return;
        }

        this.apiKey = apiKey;
        localStorage.setItem('openweather_api_key', apiKey);
        this.hideApiKeySection();
        this.showToast('API key saved successfully!', 'success');
    }

    showApiKeySection() {
        this.apiKeySection.style.display = 'block';
        this.apiKeyInfo.style.display = 'none';
        this.timelineContainer.style.display = 'none';
        this.apiKeyInput.focus();
    }

    hideApiKeySection() {
        this.apiKeySection.style.display = 'none';
        this.apiKeyInfo.style.display = 'flex';
    }

    // Geolocation
    useGeolocation() {
        if (!navigator.geolocation) {
            this.showToast('Geolocation is not supported by your browser', 'error');
            return;
        }

        this.showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                this.loadWeatherData(lat, lon);
            },
            (error) => {
                this.hideLoading();
                this.showToast('Unable to retrieve your location: ' + error.message, 'error');
            }
        );
    }

    // City Search
    async searchCity() {
        const cityName = this.citySearch.value.trim();
        if (!cityName) {
            this.showToast('Please enter a city name', 'error');
            return;
        }

        this.showLoading();

        try {
            const url = this.apiUrl('geoDirect', { q: cityName, limit: 1 });
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to search for city');
            }

            const data = await response.json();

            if (data.length === 0) {
                throw new Error('City not found');
            }

            const location = data[0];
            this.loadWeatherData(location.lat, location.lon, location.name, location.country);

        } catch (error) {
            this.hideLoading();
            this.showToast(error.message, 'error');
        }
    }

    // Load Weather Data
    async loadWeatherData(lat, lon, cityName = null, country = null) {
        this.showLoading();

        try {
            // Get location name if not provided
            if (!cityName) {
                const locationData = await this.reverseGeocode(lat, lon);
                cityName = locationData.name;
                country = locationData.country;
            }

            this.currentLocation = { lat, lon, name: cityName, country };
            this.updateLocationDisplay();

            // One upstream call seeds both timelines. OpenWeatherMap's historical
            // endpoint needs a paid plan, so past days are derived from current
            // conditions rather than fetched one at a time.
            this.weatherSeed = await this.fetchCurrentWeather(lat, lon);
            this.buildTimelines();

            this.hideLoading();
            this.showTimelines();

        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to load weather data: ' + error.message, 'error');
        }
    }

    // Reverse Geocoding
    async reverseGeocode(lat, lon) {
        const url = this.apiUrl('geoReverse', { lat, lon, limit: 1 });
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to get location name');
        }

        const data = await response.json();
        return data[0];
    }

    // Fetch Current Weather (the seed for both timelines)
    async fetchCurrentWeather(lat, lon) {
        const url = this.apiUrl('weather', { lat, lon, units: 'metric' });
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch current weather');
        }

        return response.json();
    }

    // Build both timelines from the seed. No network access, so changing the
    // view or the unit re-renders instantly.
    buildTimelines() {
        const previousYearDate = new Date();
        previousYearDate.setFullYear(previousYearDate.getFullYear() - 1);

        this.weatherData.current = this.buildSeries(this.weatherSeed, new Date());
        this.weatherData.previous = this.buildSeries(this.weatherSeed, previousYearDate);

        this.renderTimelines();
    }

    // Derive a day-by-day series ending at endDate
    buildSeries(seed, endDate) {
        const now = new Date();
        const series = [];

        // How far back to go, based on the selected view
        let numDays;
        switch (this.currentView) {
            case 'daily':
                numDays = 30; // 30 days
                break;
            case 'weekly':
                numDays = 84; // 12 weeks
                break;
            case 'monthly':
                numDays = 365; // 12 months
                break;
            default:
                numDays = 30;
        }

        // For the current year, don't run past the start of the year
        if (endDate.getFullYear() === now.getFullYear()) {
            const daysSinceStartOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / MS_PER_DAY);
            numDays = Math.min(numDays, daysSinceStartOfYear);
        }

        for (let i = 0; i < numDays; i++) {
            const date = new Date(endDate);
            date.setDate(date.getDate() - i);

            // Skip future dates
            if (date > now) continue;

            const isToday = Math.floor((now - date) / MS_PER_DAY) === 0;
            series.push(isToday
                ? this.formatWeatherData(seed, date)
                : this.simulateHistoricalData(seed, date));
        }

        return series.reverse(); // Oldest to newest
    }

    // Format Weather Data
    formatWeatherData(data, date) {
        return {
            date: date,
            temp: Math.round(data.main.temp),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            icon: this.getWeatherEmoji(data.weather[0].main),
            humidity: data.main.humidity,
            windSpeed: data.wind.speed
        };
    }

    // Pseudo-random value in [0, 1) derived from a date, so simulated history
    // stays stable when the view or unit changes instead of reshuffling.
    seededRandom(date, salt) {
        let hash = Math.floor(date.getTime() / MS_PER_DAY) + salt * 2654435761;
        hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
        hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
        return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
    }

    // Simulate Historical Data (for demo purposes)
    simulateHistoricalData(seed, date) {
        const tempVariation = (this.seededRandom(date, 1) - 0.5) * 10;
        const temp = Math.round(seed.main.temp + tempVariation);

        const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Drizzle'];
        const condition = this.seededRandom(date, 2) < 0.7
            ? seed.weather[0].main
            : conditions[Math.floor(this.seededRandom(date, 3) * conditions.length)];

        return {
            date: date,
            temp: temp,
            condition: condition,
            description: this.getConditionDescription(condition),
            icon: this.getWeatherEmoji(condition),
            humidity: Math.round(seed.main.humidity + (this.seededRandom(date, 4) - 0.5) * 20),
            windSpeed: Math.round((seed.wind.speed + (this.seededRandom(date, 5) - 0.5) * 2) * 10) / 10
        };
    }

    getConditionDescription(condition) {
        const descriptions = {
            'Clear': 'clear sky',
            'Clouds': 'scattered clouds',
            'Rain': 'moderate rain',
            'Snow': 'light snow',
            'Drizzle': 'light drizzle',
            'Thunderstorm': 'thunderstorm',
            'Mist': 'mist'
        };
        return descriptions[condition] || 'unknown';
    }

    // Get Weather Emoji
    getWeatherEmoji(condition) {
        const emojiMap = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️'
        };
        return emojiMap[condition] || '🌤️';
    }

    // Render Timelines
    renderTimelines() {
        this.currentTrack.innerHTML = '';
        this.previousTrack.innerHTML = '';

        const today = new Date();
        const currentYear = today.getFullYear();
        const previousYear = currentYear - 1;

        this.currentYearLabel.textContent = currentYear;
        this.previousYearLabel.textContent = previousYear;

        // Aggregate data based on view
        const currentData = this.aggregateData(this.weatherData.current);
        const previousData = this.aggregateData(this.weatherData.previous);

        // Render current year timeline
        currentData.forEach((item) => {
            const isToday = this.isToday(item.date);
            const element = this.createTimelineItem(item, isToday);
            this.currentTrack.appendChild(element);
        });

        // Render previous year timeline
        previousData.forEach(item => {
            const element = this.createTimelineItem(item, false);
            this.previousTrack.appendChild(element);
        });

        // Both tracks jump to their most recent entry, so the same calendar
        // dates line up across the two years — otherwise one track sits on the
        // newest dates while the other shows the oldest, and the year-over-year
        // comparison the app exists for is impossible to read.
        this.scrollToLatest();
    }

    scrollToLatest() {
        // Wait for layout so scrollWidth reflects the cards just inserted.
        requestAnimationFrame(() => {
            [this.currentTimeline, this.previousTimeline].forEach(el => {
                // Jump without animating; smooth scrolling from 0 to the end
                // would visibly race across every card on each render.
                const behavior = el.style.scrollBehavior;
                el.style.scrollBehavior = 'auto';
                el.scrollLeft = el.scrollWidth - el.clientWidth;
                el.style.scrollBehavior = behavior;
            });
        });
    }

    // Aggregate Data based on view
    aggregateData(data) {
        if (this.currentView === 'daily') {
            return data;
        }

        const aggregated = [];

        if (this.currentView === 'weekly') {
            // Group by week
            for (let i = 0; i < data.length; i += 7) {
                const weekData = data.slice(i, i + 7);
                if (weekData.length > 0) {
                    aggregated.push(this.aggregateWeekData(weekData));
                }
            }
        } else if (this.currentView === 'monthly') {
            // Group by month
            const months = {};
            data.forEach(item => {
                const monthKey = `${item.date.getFullYear()}-${item.date.getMonth()}`;
                if (!months[monthKey]) {
                    months[monthKey] = [];
                }
                months[monthKey].push(item);
            });

            Object.values(months).forEach(monthData => {
                aggregated.push(this.aggregateMonthData(monthData));
            });
        }

        return aggregated;
    }

    aggregateWeekData(weekData) {
        const avgTemp = Math.round(weekData.reduce((sum, item) => sum + item.temp, 0) / weekData.length);
        const mostCommonCondition = this.getMostCommonCondition(weekData);
        const firstDate = weekData[0].date;
        const lastDate = weekData[weekData.length - 1].date;

        return {
            date: firstDate,
            endDate: lastDate,
            temp: avgTemp,
            condition: mostCommonCondition,
            description: this.getConditionDescription(mostCommonCondition),
            icon: this.getWeatherEmoji(mostCommonCondition),
            isWeek: true
        };
    }

    aggregateMonthData(monthData) {
        const avgTemp = Math.round(monthData.reduce((sum, item) => sum + item.temp, 0) / monthData.length);
        const mostCommonCondition = this.getMostCommonCondition(monthData);
        const date = monthData[0].date;

        return {
            date: date,
            temp: avgTemp,
            condition: mostCommonCondition,
            description: this.getConditionDescription(mostCommonCondition),
            icon: this.getWeatherEmoji(mostCommonCondition),
            isMonth: true
        };
    }

    getMostCommonCondition(data) {
        const counts = {};
        data.forEach(item => {
            counts[item.condition] = (counts[item.condition] || 0) + 1;
        });

        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    // Create Timeline Item
    createTimelineItem(data, isToday = false) {
        const item = document.createElement('div');
        item.className = `timeline-item ${this.getTemperatureClass(data.temp)}`;
        if (isToday) {
            item.classList.add('current-day');
        }

        item.tabIndex = 0;
        item.setAttribute('role', 'article');

        const dateStr = this.formatDate(data.date, data.endDate, data.isWeek, data.isMonth);
        const dayStr = this.formatDay(data.date, data.isWeek, data.isMonth);

        item.innerHTML = `
            <div class="timeline-date">${dateStr}</div>
            <div class="timeline-day">${dayStr}</div>
            <div class="weather-icon" aria-hidden="true">${data.icon}</div>
            <div class="weather-temp">${this.displayTemp(data.temp)}</div>
            <div class="weather-condition">${data.description}</div>
        `;

        return item;
    }

    formatDate(date, endDate, isWeek, isMonth) {
        if (isMonth) {
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else if (isWeek && endDate) {
            const start = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `${start} – ${end}`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    formatDay(date, isWeek, isMonth) {
        if (isMonth) {
            return 'Monthly Average';
        } else if (isWeek) {
            return 'Weekly Average';
        } else {
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        }
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    // UI Helper Methods
    updateLocationDisplay() {
        this.locationDisplay.textContent = `${this.currentLocation.name}, ${this.currentLocation.country}`;
    }

    showTimelines() {
        this.timelineContainer.style.display = 'flex';
    }

    showLoading() {
        this.loadingIndicator.style.display = 'flex';
    }

    hideLoading() {
        this.loadingIndicator.style.display = 'none';
    }

    showToast(message, type = 'error') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type}`;

        // Force reflow to restart transition
        void this.toast.offsetWidth;
        this.toast.classList.add('show');

        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            this.toast.classList.remove('show');
        }, type === 'error' ? 5000 : 3000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new WeatherTimeline();
});
