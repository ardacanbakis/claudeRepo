// Weather Timeline App
class WeatherTimeline {
    constructor() {
        this.apiKey = localStorage.getItem('openweather_api_key') || '';
        this.currentLocation = null;
        this.currentView = 'daily'; // daily, weekly, monthly
        this.tempUnit = 'C'; // C or F
        this.toastTimeout = null;
        this.weatherData = {
            current: [],
            previous: []
        };

        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();

        if (this.apiKey) {
            this.hideApiKeySection();
        } else {
            this.showApiKeySection();
        }
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
                if (this.currentLocation) {
                    this.loadWeatherData(this.currentLocation.lat, this.currentLocation.lon);
                }
            });
        });

        // Unit toggle
        this.unitCBtn.addEventListener('click', () => this.setTempUnit('C'));
        this.unitFBtn.addEventListener('click', () => this.setTempUnit('F'));

        // Scroll buttons
        this.scrollBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const timeline = e.currentTarget.dataset.timeline;
                const scrollElement = timeline === 'current'
                    ? document.getElementById('currentTimeline')
                    : document.getElementById('previousTimeline');

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
            const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${this.apiKey}`;
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

            // Load current year data
            const currentYearData = await this.fetchWeatherHistory(lat, lon, new Date());

            // Load previous year data
            const previousYearDate = new Date();
            previousYearDate.setFullYear(previousYearDate.getFullYear() - 1);
            const previousYearData = await this.fetchWeatherHistory(lat, lon, previousYearDate);

            this.weatherData.current = currentYearData;
            this.weatherData.previous = previousYearData;

            this.renderTimelines();
            this.hideLoading();
            this.showTimelines();

        } catch (error) {
            this.hideLoading();
            this.showToast('Failed to load weather data: ' + error.message, 'error');
        }
    }

    // Reverse Geocoding
    async reverseGeocode(lat, lon) {
        const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${this.apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to get location name');
        }

        const data = await response.json();
        return data[0];
    }

    // Fetch Weather History
    async fetchWeatherHistory(lat, lon, endDate) {
        const data = [];
        const now = new Date();
        const isCurrentYear = endDate.getFullYear() === now.getFullYear();

        // Determine how many data points to fetch based on view
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

        // For current year, don't fetch future dates
        if (isCurrentYear) {
            const today = new Date();
            const daysSinceStartOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
            numDays = Math.min(numDays, daysSinceStartOfYear);
        }

        // Fetch data points
        for (let i = 0; i < numDays; i++) {
            const date = new Date(endDate);
            date.setDate(date.getDate() - i);

            // Skip future dates
            if (date > now) continue;

            try {
                const weatherPoint = await this.fetchWeatherForDate(lat, lon, date);
                data.push(weatherPoint);
            } catch (error) {
                console.error(`Failed to fetch weather for ${date}:`, error);
            }

            // Add delay to avoid rate limiting
            await this.delay(100);
        }

        return data.reverse(); // Oldest to newest
    }

    // Fetch Weather for Specific Date
    async fetchWeatherForDate(lat, lon, date) {
        const now = new Date();
        const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) {
            throw new Error('Cannot fetch future weather');
        } else if (daysDiff === 0) {
            // Today - use current weather
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch current weather');
            }

            const data = await response.json();
            return this.formatWeatherData(data, date);
        } else {
            // Historical data - OpenWeatherMap historical API requires subscription
            // For demo purposes, simulate historical data based on current weather with variation
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }

            const currentData = await response.json();
            return this.simulateHistoricalData(currentData, date, daysDiff);
        }
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

    // Simulate Historical Data (for demo purposes)
    simulateHistoricalData(currentData, date, daysDiff) {
        const tempVariation = (Math.random() - 0.5) * 10;
        const temp = Math.round(currentData.main.temp + tempVariation);

        const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Drizzle'];
        const randomCondition = Math.random() < 0.7 ? currentData.weather[0].main : conditions[Math.floor(Math.random() * conditions.length)];

        return {
            date: date,
            temp: temp,
            condition: randomCondition,
            description: this.getConditionDescription(randomCondition),
            icon: this.getWeatherEmoji(randomCondition),
            humidity: Math.round(currentData.main.humidity + (Math.random() - 0.5) * 20),
            windSpeed: Math.round((currentData.wind.speed + (Math.random() - 0.5) * 2) * 10) / 10
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

        // Scroll to the rightmost (most recent) item
        setTimeout(() => {
            const currentTimeline = document.getElementById('currentTimeline');
            currentTimeline.scrollLeft = currentTimeline.scrollWidth;
        }, 100);
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new WeatherTimeline();
});
