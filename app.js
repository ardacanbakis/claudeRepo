// Weather Timeline App with Open-Meteo API
class WeatherTimeline {
    constructor() {
        this.currentLocation = null;
        this.currentView = 'daily'; // daily, weekly, monthly
        this.weatherData = {
            current: [],
            previous: []
        };

        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
    }

    setupElements() {
        // Control elements
        this.geolocationBtn = document.getElementById('geolocationBtn');
        this.citySearch = document.getElementById('citySearch');
        this.searchBtn = document.getElementById('searchBtn');
        this.viewBtns = document.querySelectorAll('.btn-view');

        // Display elements
        this.locationDisplay = document.getElementById('currentLocation');
        this.timelineContainer = document.getElementById('timelineContainer');
        this.currentTrack = document.getElementById('currentTrack');
        this.previousTrack = document.getElementById('previousTrack');
        this.currentYearLabel = document.getElementById('currentYearLabel');
        this.previousYearLabel = document.getElementById('previousYearLabel');

        // Utility elements
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');

        // Scroll buttons
        this.scrollBtns = document.querySelectorAll('.scroll-btn');
    }

    setupEventListeners() {
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

    // Geolocation
    useGeolocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
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
                this.showError('Unable to retrieve your location: ' + error.message);
            }
        );
    }

    // City Search using Open-Meteo Geocoding API
    async searchCity() {
        const cityName = this.citySearch.value.trim();
        if (!cityName) {
            this.showError('Please enter a city name');
            return;
        }

        this.showLoading();

        try {
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to search for city');
            }

            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                throw new Error('City not found. Try including the country (e.g., "London, UK")');
            }

            const location = data.results[0];
            this.loadWeatherData(location.latitude, location.longitude, location.name, location.country);

        } catch (error) {
            this.hideLoading();
            this.showError(error.message);
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
            this.showError('Failed to load weather data: ' + error.message);
        }
    }

    // Reverse Geocoding using Open-Meteo
    async reverseGeocode(lat, lon) {
        // Open-Meteo doesn't have reverse geocoding, so we'll use a simple approach
        // We'll search for nearby locations and pick the closest one
        const url = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                // If reverse geocoding fails, just use coordinates
                return {
                    name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
                    country: ''
                };
            }

            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return {
                    name: data.results[0].name,
                    country: data.results[0].country || ''
                };
            }
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
        }

        // Fallback to coordinates
        return {
            name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
            country: ''
        };
    }

    // Fetch Weather History using Open-Meteo Archive API
    async fetchWeatherHistory(lat, lon, endDate) {
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

        // Calculate start and end dates
        let end = new Date(endDate);
        if (isCurrentYear && end > now) {
            end = new Date(now);
        }

        let start = new Date(end);
        start.setDate(start.getDate() - numDays);

        // Format dates for API (YYYY-MM-DD)
        const startDate = this.formatDateForAPI(start);
        const endDateStr = this.formatDateForAPI(end);

        // Fetch weather data from Open-Meteo
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDateStr}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=auto`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }

            const data = await response.json();

            // Transform the data into our format
            const weatherData = [];
            for (let i = 0; i < data.daily.time.length; i++) {
                const date = new Date(data.daily.time[i]);
                weatherData.push({
                    date: date,
                    temp: Math.round(data.daily.temperature_2m_mean[i]),
                    tempMax: Math.round(data.daily.temperature_2m_max[i]),
                    tempMin: Math.round(data.daily.temperature_2m_min[i]),
                    weatherCode: data.daily.weathercode[i],
                    precipitation: data.daily.precipitation_sum[i],
                    condition: this.getConditionFromCode(data.daily.weathercode[i]),
                    description: this.getDescriptionFromCode(data.daily.weathercode[i]),
                    icon: this.getEmojiFromCode(data.daily.weathercode[i])
                });
            }

            return weatherData;

        } catch (error) {
            console.error('Failed to fetch historical weather:', error);
            throw error;
        }
    }

    // Format date for API (YYYY-MM-DD)
    formatDateForAPI(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Map WMO Weather codes to conditions
    // https://open-meteo.com/en/docs
    getConditionFromCode(code) {
        if (code === 0) return 'Clear';
        if (code >= 1 && code <= 3) return 'Clouds';
        if (code >= 45 && code <= 48) return 'Fog';
        if (code >= 51 && code <= 55) return 'Drizzle';
        if (code >= 56 && code <= 57) return 'Drizzle';
        if (code >= 61 && code <= 65) return 'Rain';
        if (code >= 66 && code <= 67) return 'Rain';
        if (code >= 71 && code <= 75) return 'Snow';
        if (code >= 77 && code <= 77) return 'Snow';
        if (code >= 80 && code <= 82) return 'Rain';
        if (code >= 85 && code <= 86) return 'Snow';
        if (code >= 95 && code <= 99) return 'Thunderstorm';
        return 'Unknown';
    }

    getDescriptionFromCode(code) {
        const descriptions = {
            0: 'clear sky',
            1: 'mainly clear',
            2: 'partly cloudy',
            3: 'overcast',
            45: 'foggy',
            48: 'depositing rime fog',
            51: 'light drizzle',
            53: 'moderate drizzle',
            55: 'dense drizzle',
            56: 'light freezing drizzle',
            57: 'dense freezing drizzle',
            61: 'slight rain',
            63: 'moderate rain',
            65: 'heavy rain',
            66: 'light freezing rain',
            67: 'heavy freezing rain',
            71: 'slight snow',
            73: 'moderate snow',
            75: 'heavy snow',
            77: 'snow grains',
            80: 'slight rain showers',
            81: 'moderate rain showers',
            82: 'violent rain showers',
            85: 'slight snow showers',
            86: 'heavy snow showers',
            95: 'thunderstorm',
            96: 'thunderstorm with slight hail',
            99: 'thunderstorm with heavy hail'
        };
        return descriptions[code] || 'unknown';
    }

    getEmojiFromCode(code) {
        if (code === 0) return '☀️';
        if (code >= 1 && code <= 2) return '🌤️';
        if (code === 3) return '☁️';
        if (code >= 45 && code <= 48) return '🌫️';
        if (code >= 51 && code <= 57) return '🌦️';
        if (code >= 61 && code <= 65) return '🌧️';
        if (code >= 66 && code <= 67) return '🌧️';
        if (code >= 71 && code <= 77) return '❄️';
        if (code >= 80 && code <= 82) return '🌧️';
        if (code >= 85 && code <= 86) return '❄️';
        if (code >= 95 && code <= 99) return '⛈️';
        return '🌤️';
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
        let currentData = this.aggregateData(this.weatherData.current);
        let previousData = this.aggregateData(this.weatherData.previous);

        // Render current year timeline
        currentData.forEach((item, index) => {
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

        // Find the most common weather code for the icon
        const weatherCodes = weekData.map(item => item.weatherCode);
        const mostCommonCode = this.getMostCommon(weatherCodes);

        return {
            date: firstDate,
            endDate: lastDate,
            temp: avgTemp,
            condition: mostCommonCondition,
            description: this.getDescriptionFromCode(mostCommonCode),
            icon: this.getEmojiFromCode(mostCommonCode),
            isWeek: true
        };
    }

    aggregateMonthData(monthData) {
        const avgTemp = Math.round(monthData.reduce((sum, item) => sum + item.temp, 0) / monthData.length);
        const mostCommonCondition = this.getMostCommonCondition(monthData);
        const date = monthData[0].date;

        // Find the most common weather code for the icon
        const weatherCodes = monthData.map(item => item.weatherCode);
        const mostCommonCode = this.getMostCommon(weatherCodes);

        return {
            date: date,
            temp: avgTemp,
            condition: mostCommonCondition,
            description: this.getDescriptionFromCode(mostCommonCode),
            icon: this.getEmojiFromCode(mostCommonCode),
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

    getMostCommon(array) {
        const counts = {};
        array.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });

        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    // Create Timeline Item
    createTimelineItem(data, isToday = false) {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        if (isToday) {
            item.classList.add('current-day');
        }

        const dateStr = this.formatDate(data.date, data.endDate, data.isWeek, data.isMonth);
        const dayStr = this.formatDay(data.date, data.isWeek, data.isMonth);

        item.innerHTML = `
            <div class="timeline-date">${dateStr}</div>
            <div class="timeline-day">${dayStr}</div>
            <div class="weather-icon">${data.icon}</div>
            <div class="weather-temp">${data.temp}°C</div>
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
            return `${start} - ${end}`;
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
        const countryText = this.currentLocation.country ? `, ${this.currentLocation.country}` : '';
        this.locationDisplay.textContent = `${this.currentLocation.name}${countryText}`;
    }

    showTimelines() {
        this.timelineContainer.style.display = 'flex';
    }

    showLoading() {
        this.loadingIndicator.style.display = 'flex';
        this.errorMessage.style.display = 'none';
    }

    hideLoading() {
        this.loadingIndicator.style.display = 'none';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        setTimeout(() => {
            this.errorMessage.style.display = 'none';
        }, 5000);
    }

    showSuccess(message) {
        // Reuse error message styling for success
        this.errorMessage.style.background = '#d1fae5';
        this.errorMessage.style.color = '#065f46';
        this.errorMessage.style.borderLeftColor = '#10b981';
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        setTimeout(() => {
            this.errorMessage.style.display = 'none';
            // Reset to error styling
            this.errorMessage.style.background = '#fee2e2';
            this.errorMessage.style.color = '#991b1b';
            this.errorMessage.style.borderLeftColor = '#ef4444';
        }, 3000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new WeatherTimeline();
});
