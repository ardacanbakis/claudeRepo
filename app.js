// Weather Timeline App with Enhanced Features
class WeatherTimeline {
    constructor() {
        // Load preferences from localStorage
        this.preferences = this.loadPreferences();

        // App state
        this.currentLocation = null;
        this.currentView = this.preferences.view || 'daily';
        this.timelines = [{ yearsAgo: 0 }, { yearsAgo: 1 }]; // Start with current year and 1 year ago
        this.weatherDataCache = {}; // Cache weather data by year
        this.syncScroll = true;
        this.autocompleteResults = [];
        this.autocompleteTimeout = null;
        this.autocompleteSelectedIndex = -1;

        this.init();
    }

    // Initialize app
    init() {
        this.setupElements();
        this.applyPreferences();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.renderFavorites();
    }

    // Load preferences from localStorage
    loadPreferences() {
        const defaults = {
            theme: 'system',
            tempUnit: 'celsius',
            view: 'daily',
            favorites: []
        };

        try {
            const saved = localStorage.getItem('weather_timeline_prefs');
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch (error) {
            console.error('Failed to load preferences:', error);
            return defaults;
        }
    }

    // Save preferences to localStorage
    savePreferences() {
        try {
            localStorage.setItem('weather_timeline_prefs', JSON.stringify(this.preferences));
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }

    // Apply saved preferences
    applyPreferences() {
        // Apply theme
        document.documentElement.setAttribute('data-theme', this.preferences.theme);

        // Update theme buttons
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.preferences.theme);
        });

        // Update temp unit buttons
        document.querySelectorAll('[data-unit]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === this.preferences.tempUnit);
        });

        // Update view buttons
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === this.currentView);
        });
    }

    // Setup DOM elements
    setupElements() {
        // Settings
        this.settingsBtn = document.getElementById('settingsBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.closeSettingsBtn = document.getElementById('closeSettings');
        this.favoritesList = document.getElementById('favoritesList');
        this.favoritesHeader = document.getElementById('favoritesHeader');

        // Location controls
        this.geolocationBtn = document.getElementById('geolocationBtn');
        this.citySearch = document.getElementById('citySearch');
        this.searchBtn = document.getElementById('searchBtn');
        this.searchAutocomplete = document.getElementById('searchAutocomplete');
        this.viewBtns = document.querySelectorAll('.btn-view[data-view]');

        // Display
        this.locationDisplay = document.getElementById('currentLocation');
        this.favoriteBtn = document.getElementById('favoriteBtn');
        this.timelineControls = document.getElementById('timelineControls');
        this.timelinesWrapper = document.getElementById('timelinesWrapper');

        // Timeline controls
        this.addTimelineBtn = document.getElementById('addTimelineBtn');
        this.jumpToDateBtn = document.getElementById('jumpToDateBtn');
        this.syncScrollBtn = document.getElementById('syncScrollBtn');

        // Add Timeline Modal
        this.addTimelineModal = document.getElementById('addTimelineModal');
        this.closeModal = document.getElementById('closeModal');
        this.yearsAgoInput = document.getElementById('yearsAgo');
        this.cancelAddTimeline = document.getElementById('cancelAddTimeline');
        this.confirmAddTimeline = document.getElementById('confirmAddTimeline');

        // Keyboard Help Modal
        this.keyboardHelpModal = document.getElementById('keyboardHelp');
        this.closeKeyboardHelp = document.getElementById('closeKeyboardHelp');

        // Jump to Date Modal
        this.jumpToDateModal = document.getElementById('jumpToDateModal');
        this.closeJumpToDate = document.getElementById('closeJumpToDate');
        this.jumpDateInput = document.getElementById('jumpDate');
        this.cancelJumpToDate = document.getElementById('cancelJumpToDate');
        this.confirmJumpToDate = document.getElementById('confirmJumpToDate');

        // Utility
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
    }

    // Setup event listeners
    setupEventListeners() {
        // Settings
        this.settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openSettings();
        });
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());

        // Help
        this.helpBtn.addEventListener('click', () => this.openKeyboardHelp());
        this.closeKeyboardHelp.addEventListener('click', () => this.closeKeyboardHelpModal());

        // Collapsable favorites
        this.favoritesHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavoritesList();
        });

        // Theme buttons - Fixed to use currentTarget and stopPropagation
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent settings panel from closing
                const theme = e.currentTarget.dataset.theme;
                if (theme) {
                    this.changeTheme(theme);
                }
            });
        });

        // Temperature unit buttons - Fixed
        document.querySelectorAll('[data-unit]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent settings panel from closing
                const unit = e.currentTarget.dataset.unit;
                if (unit) {
                    this.changeTempUnit(unit);
                }
            });
        });

        // Location
        this.geolocationBtn.addEventListener('click', () => this.useGeolocation());
        this.searchBtn.addEventListener('click', () => this.searchCity());
        this.citySearch.addEventListener('input', (e) => this.handleSearchInput(e.target.value));
        this.citySearch.addEventListener('keydown', (e) => this.handleSearchKeydown(e));
        this.citySearch.addEventListener('focus', () => {
            if (this.citySearch.value.length >= 2 && this.autocompleteResults.length > 0) {
                this.showAutocomplete();
            }
        });
        this.citySearch.addEventListener('blur', () => {
            // Delay hiding to allow click on autocomplete item
            setTimeout(() => this.hideAutocomplete(), 200);
        });

        // Favorite button
        this.favoriteBtn.addEventListener('click', () => this.toggleFavorite());

        // View toggle
        this.viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.viewBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentView = e.currentTarget.dataset.view;
                this.preferences.view = this.currentView;
                this.savePreferences();
                if (this.currentLocation) {
                    this.loadAllWeatherData();
                }
            });
        });

        // Timeline controls
        this.addTimelineBtn.addEventListener('click', () => this.openAddTimelineModal());
        this.jumpToDateBtn.addEventListener('click', () => this.openJumpToDateModal());
        this.syncScrollBtn.addEventListener('click', () => this.toggleSyncScroll());

        // Add Timeline Modal
        this.closeModal.addEventListener('click', () => this.closeAddTimelineModal());
        this.cancelAddTimeline.addEventListener('click', () => this.closeAddTimelineModal());
        this.confirmAddTimeline.addEventListener('click', () => this.addTimeline());
        this.yearsAgoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTimeline();
        });

        // Close add timeline modal on background click
        this.addTimelineModal.addEventListener('click', (e) => {
            if (e.target === this.addTimelineModal) {
                this.closeAddTimelineModal();
            }
        });

        // Jump to Date Modal
        this.closeJumpToDate.addEventListener('click', () => this.closeJumpToDateModal());
        this.cancelJumpToDate.addEventListener('click', () => this.closeJumpToDateModal());
        this.confirmJumpToDate.addEventListener('click', () => this.jumpToDate());
        this.jumpDateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.jumpToDate();
        });

        // Close jump to date modal on background click
        this.jumpToDateModal.addEventListener('click', (e) => {
            if (e.target === this.jumpToDateModal) {
                this.closeJumpToDateModal();
            }
        });

        // Close keyboard help modal on background click
        this.keyboardHelpModal.addEventListener('click', (e) => {
            if (e.target === this.keyboardHelpModal) {
                this.closeKeyboardHelpModal();
            }
        });

        // Close settings on background click - Fixed to not interfere with buttons inside
        document.addEventListener('click', (e) => {
            if (this.settingsPanel.style.display === 'block' &&
                !this.settingsPanel.contains(e.target) &&
                e.target !== this.settingsBtn &&
                !this.settingsBtn.contains(e.target)) {
                this.closeSettings();
            }
        });

        // Prevent settings panel clicks from closing it
        this.settingsPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC - Close modal or settings or autocomplete
            if (e.key === 'Escape') {
                if (this.addTimelineModal.style.display === 'flex') {
                    this.closeAddTimelineModal();
                } else if (this.jumpToDateModal.style.display === 'flex') {
                    this.closeJumpToDateModal();
                } else if (this.keyboardHelpModal.style.display === 'flex') {
                    this.closeKeyboardHelpModal();
                } else if (this.settingsPanel.style.display === 'block') {
                    this.closeSettings();
                } else if (this.searchAutocomplete.style.display === 'block') {
                    this.hideAutocomplete();
                }
            }

            // Don't handle other shortcuts if typing in input
            if (e.target.tagName === 'INPUT') return;

            // ? - Show keyboard help
            if (e.key === '?') {
                e.preventDefault();
                this.openKeyboardHelp();
            }

            // Arrow keys - Scroll timelines
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.scrollAllTimelines(-300);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.scrollAllTimelines(300);
            }

            // S - Toggle sync scroll
            if (e.key === 's' || e.key === 'S') {
                e.preventDefault();
                this.toggleSyncScroll();
            }

            // T - Toggle theme
            if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                this.cycleTheme();
            }

            // U - Toggle temperature unit
            if (e.key === 'u' || e.key === 'U') {
                e.preventDefault();
                this.toggleTempUnit();
            }
        });
    }

    // Helper for keyboard shortcuts
    scrollAllTimelines(amount) {
        const scrollContainers = document.querySelectorAll('.timeline-scroll');
        scrollContainers.forEach(container => {
            container.scrollLeft += amount;
        });
    }

    cycleTheme() {
        const themes = ['light', 'system', 'dark'];
        const currentIndex = themes.indexOf(this.preferences.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.changeTheme(themes[nextIndex]);
    }

    toggleTempUnit() {
        const newUnit = this.preferences.tempUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        this.changeTempUnit(newUnit);
    }

    // Theme management
    changeTheme(theme) {
        this.preferences.theme = theme;
        this.savePreferences();
        document.documentElement.setAttribute('data-theme', theme);

        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });
    }

    // Temperature unit management
    changeTempUnit(unit) {
        this.preferences.tempUnit = unit;
        this.savePreferences();

        document.querySelectorAll('[data-unit]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.unit === unit);
        });

        // Re-render timelines with new unit
        if (this.currentLocation && Object.keys(this.weatherDataCache).length > 0) {
            this.renderAllTimelines();
        }
    }

    // Convert temperature
    convertTemp(celsius) {
        if (this.preferences.tempUnit === 'fahrenheit') {
            return Math.round((celsius * 9/5) + 32);
        }
        return Math.round(celsius);
    }

    getTempUnit() {
        return this.preferences.tempUnit === 'fahrenheit' ? '°F' : '°C';
    }

    // Settings panel
    openSettings() {
        this.settingsPanel.style.display = 'block';
    }

    closeSettings() {
        this.settingsPanel.style.display = 'none';
    }

    toggleFavoritesList() {
        this.favoritesList.classList.toggle('collapsed');
        const icon = this.favoritesHeader.querySelector('.collapse-icon');
        icon.classList.toggle('rotated');
    }

    // Favorites management
    toggleFavorite() {
        if (!this.currentLocation) return;

        const favorite = {
            name: this.currentLocation.name,
            country: this.currentLocation.country,
            lat: this.currentLocation.lat,
            lon: this.currentLocation.lon
        };

        const index = this.preferences.favorites.findIndex(
            f => f.lat === favorite.lat && f.lon === favorite.lon
        );

        if (index >= 0) {
            // Remove from favorites
            this.preferences.favorites.splice(index, 1);
            this.favoriteBtn.classList.remove('active');
            this.showSuccess('Removed from favorites');
        } else {
            // Add to favorites
            this.preferences.favorites.push(favorite);
            this.favoriteBtn.classList.add('active');
            this.showSuccess('Added to favorites');
        }

        this.savePreferences();
        this.renderFavorites();
    }

    renderFavorites() {
        if (this.preferences.favorites.length === 0) {
            this.favoritesList.innerHTML = '<p class="empty-state">No favorites yet. Search for a city and click the star!</p>';
            return;
        }

        this.favoritesList.innerHTML = this.preferences.favorites.map(fav => `
            <div class="favorite-item" data-lat="${fav.lat}" data-lon="${fav.lon}" data-name="${fav.name}" data-country="${fav.country}">
                <div class="favorite-item-info">
                    <div class="favorite-item-name">${fav.name}</div>
                    <div class="favorite-item-country">${fav.country}</div>
                </div>
                <button class="btn btn-icon btn-danger remove-favorite-btn" title="Remove">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `).join('');

        // Add click handlers to favorites
        document.querySelectorAll('.favorite-item').forEach(item => {
            const lat = parseFloat(item.dataset.lat);
            const lon = parseFloat(item.dataset.lon);
            const name = item.dataset.name;
            const country = item.dataset.country;

            item.addEventListener('click', (e) => {
                if (!e.target.closest('.remove-favorite-btn')) {
                    this.loadWeatherData(lat, lon, name, country);
                    this.closeSettings();
                }
            });
        });

        // Add remove button handlers
        document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.currentTarget.closest('.favorite-item');
                const lat = parseFloat(item.dataset.lat);
                const lon = parseFloat(item.dataset.lon);
                this.removeFavorite(lat, lon);
            });
        });
    }

    removeFavorite(lat, lon) {
        const index = this.preferences.favorites.findIndex(
            f => f.lat === lat && f.lon === lon
        );

        if (index >= 0) {
            this.preferences.favorites.splice(index, 1);
            this.savePreferences();
            this.renderFavorites();

            // Update favorite button if current location was removed
            if (this.currentLocation && this.currentLocation.lat === lat && this.currentLocation.lon === lon) {
                this.favoriteBtn.classList.remove('active');
            }
        }
    }

    // Search autocomplete - Optimized
    async handleSearchInput(query) {
        clearTimeout(this.autocompleteTimeout);
        this.autocompleteSelectedIndex = -1;

        if (query.length < 2) {
            this.hideAutocomplete();
            return;
        }

        // Show loading state
        this.searchAutocomplete.innerHTML = '<div class="autocomplete-item"><div class="autocomplete-item-name">Searching...</div></div>';
        this.searchAutocomplete.style.display = 'block';

        this.autocompleteTimeout = setTimeout(async () => {
            try {
                const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    this.autocompleteResults = data.results;
                    this.showAutocomplete();
                } else {
                    this.searchAutocomplete.innerHTML = '<div class="autocomplete-item"><div class="autocomplete-item-name">No results found</div></div>';
                }
            } catch (error) {
                console.error('Autocomplete error:', error);
                this.hideAutocomplete();
            }
        }, 250); // Reduced debounce to 250ms for faster response
    }

    showAutocomplete() {
        this.searchAutocomplete.innerHTML = this.autocompleteResults.map((result, index) => `
            <div class="autocomplete-item ${index === this.autocompleteSelectedIndex ? 'active' : ''}" data-index="${index}">
                <div class="autocomplete-item-name">${result.name}</div>
                <div class="autocomplete-item-details">
                    ${result.admin1 ? result.admin1 + ', ' : ''}${result.country}
                    ${result.population ? ' • ' + this.formatPopulation(result.population) : ''}
                </div>
            </div>
        `).join('');

        this.searchAutocomplete.style.display = 'block';

        // Add click handlers
        document.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                if (!isNaN(index)) {
                    this.selectAutocompleteItem(index);
                }
            });

            // Add hover handler for keyboard navigation
            item.addEventListener('mouseenter', () => {
                const index = parseInt(item.dataset.index);
                if (!isNaN(index)) {
                    this.autocompleteSelectedIndex = index;
                    this.updateAutocompleteSelection();
                }
            });
        });
    }

    formatPopulation(pop) {
        if (pop >= 1000000) {
            return (pop / 1000000).toFixed(1) + 'M';
        } else if (pop >= 1000) {
            return (pop / 1000).toFixed(0) + 'K';
        }
        return pop.toString();
    }

    updateAutocompleteSelection() {
        document.querySelectorAll('.autocomplete-item').forEach((item, index) => {
            item.classList.toggle('active', index === this.autocompleteSelectedIndex);
        });
    }

    hideAutocomplete() {
        this.searchAutocomplete.style.display = 'none';
        this.autocompleteSelectedIndex = -1;
    }

    selectAutocompleteItem(index) {
        const result = this.autocompleteResults[index];
        this.citySearch.value = result.name;
        this.hideAutocomplete();
        this.loadWeatherData(result.latitude, result.longitude, result.name, result.country);
    }

    handleSearchKeydown(e) {
        const isAutocompleteVisible = this.searchAutocomplete.style.display === 'block' &&
                                      this.autocompleteResults.length > 0;

        if (e.key === 'Enter') {
            e.preventDefault();
            if (isAutocompleteVisible && this.autocompleteSelectedIndex >= 0) {
                this.selectAutocompleteItem(this.autocompleteSelectedIndex);
            } else {
                this.searchCity();
            }
        } else if (e.key === 'Escape') {
            this.hideAutocomplete();
        } else if (e.key === 'ArrowDown' && isAutocompleteVisible) {
            e.preventDefault();
            this.autocompleteSelectedIndex = Math.min(
                this.autocompleteSelectedIndex + 1,
                this.autocompleteResults.length - 1
            );
            this.updateAutocompleteSelection();
            // Scroll into view
            const activeItem = document.querySelector('.autocomplete-item.active');
            if (activeItem) {
                activeItem.scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp' && isAutocompleteVisible) {
            e.preventDefault();
            this.autocompleteSelectedIndex = Math.max(this.autocompleteSelectedIndex - 1, 0);
            this.updateAutocompleteSelection();
            // Scroll into view
            const activeItem = document.querySelector('.autocomplete-item.active');
            if (activeItem) {
                activeItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }

    // Geolocation
    useGeolocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by your browser');
            return;
        }

        this.showLoading();
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // Get city name from coordinates
                    const url = `https://geocoding-api.open-meteo.com/v1/search?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&count=1&language=en&format=json`;
                    const response = await fetch(url);
                    const data = await response.json();

                    let cityName = 'Current Location';
                    let country = '';

                    if (data.results && data.results.length > 0) {
                        cityName = data.results[0].name;
                        country = data.results[0].country;
                    }

                    this.loadWeatherData(position.coords.latitude, position.coords.longitude, cityName, country);
                } catch (error) {
                    console.error('Geocoding error:', error);
                    this.loadWeatherData(position.coords.latitude, position.coords.longitude);
                }
            },
            (error) => {
                this.hideLoading();
                this.showError('Unable to retrieve your location: ' + error.message);
            }
        );
    }

    // City search
    async searchCity() {
        const cityName = this.citySearch.value.trim();
        if (!cityName) {
            this.showError('Please enter a city name');
            return;
        }

        this.showLoading();
        this.hideAutocomplete();

        try {
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
            const response = await fetch(url);
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

    // Load weather data for all timelines
    async loadWeatherData(lat, lon, cityName = null, country = null) {
        this.showLoading();

        try {
            // If city name not provided, try to get it from coordinates
            if (!cityName || cityName === 'Current Location') {
                try {
                    const url = `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`;
                    const response = await fetch(url);
                    const data = await response.json();

                    if (data.results && data.results.length > 0) {
                        cityName = data.results[0].name;
                        country = data.results[0].country;
                    } else {
                        cityName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
                        country = '';
                    }
                } catch (error) {
                    console.error('Failed to get city name:', error);
                    cityName = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
                    country = '';
                }
            }

            this.currentLocation = { lat, lon, name: cityName, country };
            this.updateLocationDisplay();

            // Clear cache when location changes
            this.weatherDataCache = {};

            // Load all weather data
            await this.loadAllWeatherData();

            this.hideLoading();
            this.showTimelines();

        } catch (error) {
            this.hideLoading();
            this.showError('Failed to load weather data: ' + error.message);
        }
    }

    async loadAllWeatherData() {
        const promises = this.timelines.map(async (timeline) => {
            const date = new Date();
            date.setFullYear(date.getFullYear() - timeline.yearsAgo);

            const data = await this.fetchWeatherHistory(
                this.currentLocation.lat,
                this.currentLocation.lon,
                date
            );

            this.weatherDataCache[timeline.yearsAgo] = data;
        });

        await Promise.all(promises);
        this.renderAllTimelines();
    }

    // Fetch weather history
    async fetchWeatherHistory(lat, lon, endDate) {
        const now = new Date();
        const isCurrentYear = endDate.getFullYear() === now.getFullYear();

        let numDays;
        switch (this.currentView) {
            case 'daily':
                numDays = 30;
                break;
            case 'weekly':
                numDays = 84;
                break;
            case 'monthly':
                numDays = 365;
                break;
            default:
                numDays = 30;
        }

        let end = new Date(endDate);
        // Always use today's date for current year
        if (isCurrentYear) {
            end = new Date(now);
        }

        let start = new Date(end);
        start.setDate(start.getDate() - numDays);

        const startDate = this.formatDateForAPI(start);
        const endDateStr = this.formatDateForAPI(end);

        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDateStr}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();
        const weatherData = [];

        for (let i = 0; i < data.daily.time.length; i++) {
            const date = new Date(data.daily.time[i]);
            weatherData.push({
                date: date,
                temp: data.daily.temperature_2m_mean[i],
                tempMax: data.daily.temperature_2m_max[i],
                tempMin: data.daily.temperature_2m_min[i],
                weatherCode: data.daily.weathercode[i],
                condition: this.getConditionFromCode(data.daily.weathercode[i]),
                description: this.getDescriptionFromCode(data.daily.weathercode[i]),
                icon: this.getEmojiFromCode(data.daily.weathercode[i])
            });
        }

        return weatherData;
    }

    formatDateForAPI(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Weather code mappings
    getConditionFromCode(code) {
        if (code === 0) return 'Clear';
        if (code >= 1 && code <= 3) return 'Clouds';
        if (code >= 45 && code <= 48) return 'Fog';
        if (code >= 51 && code <= 57) return 'Drizzle';
        if (code >= 61 && code <= 67) return 'Rain';
        if (code >= 71 && code <= 77) return 'Snow';
        if (code >= 80 && code <= 86) return 'Rain';
        if (code >= 95 && code <= 99) return 'Thunderstorm';
        return 'Unknown';
    }

    getDescriptionFromCode(code) {
        const descriptions = {
            0: 'clear sky', 1: 'mainly clear', 2: 'partly cloudy', 3: 'overcast',
            45: 'foggy', 48: 'depositing rime fog',
            51: 'light drizzle', 53: 'moderate drizzle', 55: 'dense drizzle',
            56: 'light freezing drizzle', 57: 'dense freezing drizzle',
            61: 'slight rain', 63: 'moderate rain', 65: 'heavy rain',
            66: 'light freezing rain', 67: 'heavy freezing rain',
            71: 'slight snow', 73: 'moderate snow', 75: 'heavy snow', 77: 'snow grains',
            80: 'slight rain showers', 81: 'moderate rain showers', 82: 'violent rain showers',
            85: 'slight snow showers', 86: 'heavy snow showers',
            95: 'thunderstorm', 96: 'thunderstorm with slight hail', 99: 'thunderstorm with heavy hail'
        };
        return descriptions[code] || 'unknown';
    }

    getEmojiFromCode(code) {
        if (code === 0) return '☀️';
        if (code >= 1 && code <= 2) return '🌤️';
        if (code === 3) return '☁️';
        if (code >= 45 && code <= 48) return '🌫️';
        if (code >= 51 && code <= 57) return '🌦️';
        if (code >= 61 && code <= 67) return '🌧️';
        if (code >= 71 && code <= 77) return '❄️';
        if (code >= 80 && code <= 82) return '🌧️';
        if (code >= 85 && code <= 86) return '❄️';
        if (code >= 95 && code <= 99) return '⛈️';
        return '🌤️';
    }

    // Timeline management
    openAddTimelineModal() {
        // Set default to next available year
        const existingYears = this.timelines.map(t => t.yearsAgo);
        let nextYear = 1;
        while (existingYears.includes(nextYear) && nextYear <= 86) {
            nextYear++;
        }
        this.yearsAgoInput.value = nextYear;
        this.addTimelineModal.style.display = 'flex';
        setTimeout(() => this.yearsAgoInput.focus(), 100);
    }

    closeAddTimelineModal() {
        this.addTimelineModal.style.display = 'none';
    }

    // Keyboard Help Modal
    openKeyboardHelp() {
        this.keyboardHelpModal.style.display = 'flex';
    }

    closeKeyboardHelpModal() {
        this.keyboardHelpModal.style.display = 'none';
    }

    // Jump to Date Modal
    openJumpToDateModal() {
        if (!this.currentLocation) {
            this.showError('Please select a location first');
            return;
        }

        // Set default to today
        const today = new Date();
        this.jumpDateInput.value = today.toISOString().split('T')[0];
        this.jumpDateInput.max = today.toISOString().split('T')[0]; // Can't jump to future

        // Set min to 86 years ago (data availability)
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 86);
        this.jumpDateInput.min = minDate.toISOString().split('T')[0];

        this.jumpToDateModal.style.display = 'flex';
        setTimeout(() => this.jumpDateInput.focus(), 100);
    }

    closeJumpToDateModal() {
        this.jumpToDateModal.style.display = 'none';
    }

    jumpToDate() {
        const selectedDate = new Date(this.jumpDateInput.value);

        if (isNaN(selectedDate.getTime())) {
            this.showError('Please select a valid date');
            return;
        }

        const today = new Date();
        if (selectedDate > today) {
            this.showError('Cannot jump to a future date');
            return;
        }

        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 86);
        if (selectedDate < minDate) {
            this.showError('Date is beyond available historical data (86 years)');
            return;
        }

        this.closeJumpToDateModal();

        // Calculate the days from today to selected date
        const daysDiff = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24));

        // Scroll to the date
        this.scrollToDate(daysDiff);
    }

    scrollToDate(daysBack) {
        const scrollContainers = document.querySelectorAll('.timeline-scroll');

        scrollContainers.forEach(container => {
            let scrollTarget;

            if (this.currentView === 'daily') {
                // Each day is approximately 150px wide
                scrollTarget = daysBack * 150;
            } else if (this.currentView === 'weekly') {
                // Each week is approximately 150px wide
                const weeksBack = Math.floor(daysBack / 7);
                scrollTarget = weeksBack * 150;
            } else if (this.currentView === 'monthly') {
                // Each month is approximately 150px wide
                const monthsBack = Math.floor(daysBack / 30);
                scrollTarget = monthsBack * 150;
            }

            // Smooth scroll to target
            container.scrollTo({
                left: scrollTarget,
                behavior: 'smooth'
            });
        });
    }

    async addTimeline() {
        const yearsAgo = parseInt(this.yearsAgoInput.value);

        if (isNaN(yearsAgo) || yearsAgo < 1 || yearsAgo > 86) {
            this.showError('Please enter a value between 1 and 86');
            return;
        }

        // Check if timeline already exists
        if (this.timelines.some(t => t.yearsAgo === yearsAgo)) {
            this.showError(`Timeline for ${yearsAgo} year(s) ago already exists`);
            return;
        }

        this.closeAddTimelineModal();
        this.showLoading();

        try {
            // Add timeline
            this.timelines.push({ yearsAgo });
            this.timelines.sort((a, b) => a.yearsAgo - b.yearsAgo);

            // Load data for new timeline
            await this.loadAllWeatherData();

            this.hideLoading();
            this.showSuccess(`Added timeline for ${yearsAgo} year(s) ago`);

        } catch (error) {
            this.hideLoading();
            this.showError('Failed to add timeline: ' + error.message);
            // Remove the timeline if it failed to load
            this.timelines = this.timelines.filter(t => t.yearsAgo !== yearsAgo);
        }
    }

    removeTimeline(yearsAgo) {
        if (this.timelines.length <= 1) {
            this.showError('You must have at least one timeline');
            return;
        }

        this.timelines = this.timelines.filter(t => t.yearsAgo !== yearsAgo);
        delete this.weatherDataCache[yearsAgo];
        this.renderAllTimelines();
        this.showSuccess('Removed timeline');
    }

    toggleSyncScroll() {
        this.syncScroll = !this.syncScroll;
        this.syncScrollBtn.classList.toggle('active', this.syncScroll);

        if (this.syncScroll) {
            this.showSuccess('Scroll synchronization enabled');
        } else {
            this.showSuccess('Scroll synchronization disabled');
        }
    }

    // Render all timelines
    renderAllTimelines() {
        this.timelinesWrapper.innerHTML = '';

        this.timelines.forEach((timeline) => {
            const data = this.weatherDataCache[timeline.yearsAgo];
            if (!data) return;

            const aggregated = this.aggregateData(data);
            const timelineElement = this.createTimelineSection(timeline, aggregated);
            this.timelinesWrapper.appendChild(timelineElement);
        });

        // Setup scroll synchronization
        if (this.syncScroll) {
            this.setupScrollSync();
        }
    }

    createTimelineSection(timeline, data) {
        const section = document.createElement('div');
        section.className = 'timeline-section';
        section.dataset.yearsAgo = timeline.yearsAgo;

        const year = new Date().getFullYear() - timeline.yearsAgo;
        const title = timeline.yearsAgo === 0 ? 'Current Weather' :
                      timeline.yearsAgo === 1 ? 'One Year Ago' :
                      `${timeline.yearsAgo} Years Ago`;

        // Fixed: Moved year label to center of header
        section.innerHTML = `
            <div class="timeline-header">
                <h2>
                    ${title}
                    <span class="year-label-inline">${year}</span>
                </h2>
                ${timeline.yearsAgo > 0 ? `
                    <button class="btn btn-icon btn-danger remove-timeline-btn" title="Remove this timeline">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"></path>
                        </svg>
                    </button>
                ` : ''}
            </div>
            <div class="timeline-wrapper">
                <button class="scroll-btn scroll-left">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M15 18l-6-6 6-6"></path>
                    </svg>
                </button>
                <div class="timeline-scroll">
                    <div class="timeline-track"></div>
                </div>
                <button class="scroll-btn scroll-right">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"></path>
                    </svg>
                </button>
            </div>
        `;

        // Add timeline items
        const track = section.querySelector('.timeline-track');
        data.forEach((item, index) => {
            const isToday = timeline.yearsAgo === 0 && this.isToday(item.date);

            // Add comparison data if not current year
            let comparisonTemp = null;
            if (timeline.yearsAgo > 0 && this.weatherDataCache[0]) {
                const currentData = this.aggregateData(this.weatherDataCache[0]);
                if (currentData[index]) {
                    comparisonTemp = currentData[index].temp;
                }
            }

            const element = this.createTimelineItem(item, isToday, comparisonTemp);
            track.appendChild(element);
        });

        // Setup remove button
        const removeBtn = section.querySelector('.remove-timeline-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.removeTimeline(timeline.yearsAgo));
        }

        // Setup scroll buttons
        const scrollContainer = section.querySelector('.timeline-scroll');
        section.querySelector('.scroll-left').addEventListener('click', () => {
            scrollContainer.scrollLeft -= 300;
        });
        section.querySelector('.scroll-right').addEventListener('click', () => {
            scrollContainer.scrollLeft += 300;
        });

        // Scroll to end (today's date) - use longer delay and requestAnimationFrame
        setTimeout(() => {
            requestAnimationFrame(() => {
                scrollContainer.scrollLeft = scrollContainer.scrollWidth;
            });
        }, 300);

        return section;
    }

    setupScrollSync() {
        const scrollContainers = document.querySelectorAll('.timeline-scroll');
        let isScrolling = false;
        let scrollTimeout = null;

        scrollContainers.forEach(container => {
            container.addEventListener('scroll', (e) => {
                if (!this.syncScroll || isScrolling) return;

                isScrolling = true;
                const scrollPercent = e.target.scrollLeft / (e.target.scrollWidth - e.target.clientWidth);

                // Clear any existing timeout
                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }

                // Wait for scroll to finish before updating other containers
                scrollTimeout = setTimeout(() => {
                    scrollContainers.forEach(other => {
                        if (other !== e.target) {
                            const targetScroll = scrollPercent * (other.scrollWidth - other.clientWidth);
                            other.scrollLeft = targetScroll;
                        }
                    });

                    // Reset after all scrolls complete
                    setTimeout(() => {
                        isScrolling = false;
                    }, 100);
                }, 500); // 0.5s delay as requested
            });
        });
    }

    aggregateData(data) {
        if (this.currentView === 'daily') {
            return data;
        }

        const aggregated = [];

        if (this.currentView === 'weekly') {
            for (let i = 0; i < data.length; i += 7) {
                const weekData = data.slice(i, i + 7);
                if (weekData.length > 0) {
                    aggregated.push(this.aggregateWeekData(weekData));
                }
            }
        } else if (this.currentView === 'monthly') {
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
        const avgTemp = weekData.reduce((sum, item) => sum + item.temp, 0) / weekData.length;
        const mostCommonCode = this.getMostCommon(weekData.map(item => item.weatherCode));

        return {
            date: weekData[0].date,
            endDate: weekData[weekData.length - 1].date,
            temp: avgTemp,
            weatherCode: mostCommonCode,
            condition: this.getConditionFromCode(mostCommonCode),
            description: this.getDescriptionFromCode(mostCommonCode),
            icon: this.getEmojiFromCode(mostCommonCode),
            isWeek: true
        };
    }

    aggregateMonthData(monthData) {
        const avgTemp = monthData.reduce((sum, item) => sum + item.temp, 0) / monthData.length;
        const mostCommonCode = this.getMostCommon(monthData.map(item => item.weatherCode));

        return {
            date: monthData[0].date,
            temp: avgTemp,
            weatherCode: mostCommonCode,
            condition: this.getConditionFromCode(mostCommonCode),
            description: this.getDescriptionFromCode(mostCommonCode),
            icon: this.getEmojiFromCode(mostCommonCode),
            isMonth: true
        };
    }

    getMostCommon(array) {
        const counts = {};
        array.forEach(item => {
            counts[item] = (counts[item] || 0) + 1;
        });
        return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    createTimelineItem(data, isToday = false, comparisonTemp = null) {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        if (isToday) {
            item.classList.add('current-day');
        }

        const dateStr = this.formatDate(data.date, data.endDate, data.isWeek, data.isMonth);
        const dayStr = this.formatDay(data.date, data.isWeek, data.isMonth);
        const temp = this.convertTemp(data.temp);
        const unit = this.getTempUnit();

        // Add mini temperature chart (sparkline)
        let chartHTML = '';
        if (data.tempMax !== undefined && data.tempMin !== undefined) {
            const tempMax = this.convertTemp(data.tempMax);
            const tempMin = this.convertTemp(data.tempMin);
            chartHTML = `
                <div class="temp-range">
                    <span class="temp-max" title="High">↑${tempMax}${unit}</span>
                    <span class="temp-min" title="Low">↓${tempMin}${unit}</span>
                </div>
            `;
        }

        let comparisonHTML = '';
        if (comparisonTemp !== null) {
            const currentTemp = this.convertTemp(comparisonTemp);
            const diff = temp - currentTemp;
            const diffClass = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';
            const diffSign = diff > 0 ? '+' : '';
            comparisonHTML = `
                <div class="temp-difference ${diffClass}">
                    ${diffSign}${diff}${unit} vs current
                </div>
            `;
        }

        item.innerHTML = `
            <div class="timeline-date">${dateStr}</div>
            <div class="timeline-day">${dayStr}</div>
            <div class="weather-icon">${data.icon}</div>
            <div class="weather-temp">${temp}${unit}</div>
            ${chartHTML}
            <div class="weather-condition">${data.description}</div>
            ${comparisonHTML}
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
        if (isMonth) return 'Monthly Average';
        if (isWeek) return 'Weekly Average';
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    // UI helpers
    updateLocationDisplay() {
        const countryText = this.currentLocation.country ? `, ${this.currentLocation.country}` : '';
        this.locationDisplay.textContent = `${this.currentLocation.name}${countryText}`;

        // Show favorite button
        this.favoriteBtn.style.display = 'inline-flex';

        // Update favorite button state
        const isFavorite = this.preferences.favorites.some(
            f => f.lat === this.currentLocation.lat && f.lon === this.currentLocation.lon
        );
        this.favoriteBtn.classList.toggle('active', isFavorite);
    }

    showTimelines() {
        this.timelineControls.style.display = 'block';
        this.timelinesWrapper.style.display = 'flex';
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
        this.successMessage.textContent = message;
        this.successMessage.style.display = 'block';
        setTimeout(() => {
            this.successMessage.style.display = 'none';
        }, 3000);
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new WeatherTimeline();
});
