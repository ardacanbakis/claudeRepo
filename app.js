// Weather Timeline App with Enhanced Features

// Translations
const translations = {
    en: {
        searchPlaceholder: 'Search for a city...',
        currentWeather: 'Current Weather',
        oneYearAgo: 'One Year Ago',
        yearsAgo: 'Years Ago',
        addComparisonYear: 'Add Comparison Year',
        jumpToDate: 'Jump to Date',
        syncScroll: 'Sync Scroll',
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        weatherConditions: {
            'clear sky': 'clear sky',
            'mainly clear': 'mainly clear',
            'partly cloudy': 'partly cloudy',
            'overcast': 'overcast',
            'foggy': 'foggy',
            'depositing rime fog': 'depositing rime fog',
            'light drizzle': 'light drizzle',
            'moderate drizzle': 'moderate drizzle',
            'dense drizzle': 'dense drizzle',
            'light freezing drizzle': 'light freezing drizzle',
            'dense freezing drizzle': 'dense freezing drizzle',
            'slight rain': 'slight rain',
            'moderate rain': 'moderate rain',
            'heavy rain': 'heavy rain',
            'light freezing rain': 'light freezing rain',
            'heavy freezing rain': 'heavy freezing rain',
            'slight snow': 'slight snow',
            'moderate snow': 'moderate snow',
            'heavy snow': 'heavy snow',
            'snow grains': 'snow grains',
            'slight rain showers': 'slight rain showers',
            'moderate rain showers': 'moderate rain showers',
            'violent rain showers': 'violent rain showers',
            'slight snow showers': 'slight snow showers',
            'heavy snow showers': 'heavy snow showers',
            'thunderstorm': 'thunderstorm',
            'thunderstorm with slight hail': 'thunderstorm with slight hail',
            'thunderstorm with heavy hail': 'thunderstorm with heavy hail',
            'unknown': 'unknown'
        },
        weeklyAverage: 'Weekly Average',
        monthlyAverage: 'Monthly Average',
        vsCurrent: 'vs current',
        // View buttons
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        // Welcome message
        welcomeTitle: 'Welcome to Weather Timeline!',
        welcomeSubtitle: 'Compare weather patterns across multiple years',
        welcomeInstruction: 'Start by searching for a city above',
        // Settings
        settings: 'Settings',
        theme: 'Theme',
        language: 'Language',
        temperatureUnit: 'Temperature Unit',
        favoriteLocations: 'Favorite Locations',
        keyboardShortcuts: 'Keyboard Shortcuts',
        light: 'Light',
        dark: 'Dark',
        // Keyboard shortcuts
        shortcutEsc: 'Close modals, settings, or autocomplete',
        shortcutArrows: 'Scroll timelines left/right',
        shortcutT: 'Toggle theme (Light ↔ Dark)',
        shortcutU: 'Toggle temperature unit (°C ↔ °F)'
    },
    tr: {
        searchPlaceholder: 'Şehir ara...',
        currentWeather: 'Güncel Hava Durumu',
        oneYearAgo: 'Bir Yıl Önce',
        yearsAgo: 'Yıl Önce',
        addComparisonYear: 'Karşılaştırma Yılı Ekle',
        jumpToDate: 'Tarihe Git',
        syncScroll: 'Senkronize Kaydırma',
        months: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
        monthsShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
        days: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
        daysShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
        weatherConditions: {
            'clear sky': 'açık hava',
            'mainly clear': 'ağırlıklı açık',
            'partly cloudy': 'parçalı bulutlu',
            'overcast': 'kapalı',
            'foggy': 'sisli',
            'depositing rime fog': 'kırağılı sis',
            'light drizzle': 'hafif çisenti',
            'moderate drizzle': 'orta çisenti',
            'dense drizzle': 'yoğun çisenti',
            'light freezing drizzle': 'hafif dondurucu çisenti',
            'dense freezing drizzle': 'yoğun dondurucu çisenti',
            'slight rain': 'hafif yağmur',
            'moderate rain': 'orta yağmur',
            'heavy rain': 'şiddetli yağmur',
            'light freezing rain': 'hafif dondurucu yağmur',
            'heavy freezing rain': 'şiddetli dondurucu yağmur',
            'slight snow': 'hafif kar',
            'moderate snow': 'orta kar',
            'heavy snow': 'yoğun kar',
            'snow grains': 'kar taneleri',
            'slight rain showers': 'hafif sağanak yağış',
            'moderate rain showers': 'orta sağanak yağış',
            'violent rain showers': 'şiddetli sağanak yağış',
            'slight snow showers': 'hafif kar yağışı',
            'heavy snow showers': 'yoğun kar yağışı',
            'thunderstorm': 'fırtına',
            'thunderstorm with slight hail': 'hafif dolu ile fırtına',
            'thunderstorm with heavy hail': 'yoğun dolu ile fırtına',
            'unknown': 'bilinmiyor'
        },
        weeklyAverage: 'Haftalık Ortalama',
        monthlyAverage: 'Aylık Ortalama',
        vsCurrent: 'şu ankine göre',
        // View buttons
        daily: 'Günlük',
        weekly: 'Haftalık',
        monthly: 'Aylık',
        // Welcome message
        welcomeTitle: 'Hava Durumu Zaman Çizelgesine Hoş Geldiniz!',
        welcomeSubtitle: 'Birden fazla yıl boyunca hava durumu modellerini karşılaştırın',
        welcomeInstruction: 'Yukarıdan bir şehir arayarak başlayın',
        // Settings
        settings: 'Ayarlar',
        theme: 'Tema',
        language: 'Dil',
        temperatureUnit: 'Sıcaklık Birimi',
        favoriteLocations: 'Favori Konumlar',
        keyboardShortcuts: 'Klavye Kısayolları',
        light: 'Açık',
        dark: 'Koyu',
        // Keyboard shortcuts
        shortcutEsc: 'Modları, ayarları veya otomatik tamamlamayı kapat',
        shortcutArrows: 'Zaman çizelgelerini sola/sağa kaydır',
        shortcutT: 'Temayı değiştir (Açık ↔ Koyu)',
        shortcutU: 'Sıcaklık birimini değiştir (°C ↔ °F)'
    },
    es: {
        searchPlaceholder: 'Buscar ciudad...',
        currentWeather: 'Clima Actual',
        oneYearAgo: 'Hace un Año',
        yearsAgo: 'Años Atrás',
        addComparisonYear: 'Agregar Año de Comparación',
        jumpToDate: 'Ir a Fecha',
        syncScroll: 'Desplazamiento Sincronizado',
        months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        daysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        weatherConditions: {
            'clear sky': 'cielo despejado',
            'mainly clear': 'principalmente despejado',
            'partly cloudy': 'parcialmente nublado',
            'overcast': 'nublado',
            'foggy': 'niebla',
            'depositing rime fog': 'niebla con escarcha',
            'light drizzle': 'llovizna ligera',
            'moderate drizzle': 'llovizna moderada',
            'dense drizzle': 'llovizna densa',
            'light freezing drizzle': 'llovizna helada ligera',
            'dense freezing drizzle': 'llovizna helada densa',
            'slight rain': 'lluvia ligera',
            'moderate rain': 'lluvia moderada',
            'heavy rain': 'lluvia intensa',
            'light freezing rain': 'lluvia helada ligera',
            'heavy freezing rain': 'lluvia helada intensa',
            'slight snow': 'nevada ligera',
            'moderate snow': 'nevada moderada',
            'heavy snow': 'nevada intensa',
            'snow grains': 'granos de nieve',
            'slight rain showers': 'chubascos ligeros',
            'moderate rain showers': 'chubascos moderados',
            'violent rain showers': 'chubascos violentos',
            'slight snow showers': 'nevada ligera',
            'heavy snow showers': 'nevada intensa',
            'thunderstorm': 'tormenta',
            'thunderstorm with slight hail': 'tormenta con granizo ligero',
            'thunderstorm with heavy hail': 'tormenta con granizo intenso',
            'unknown': 'desconocido'
        },
        weeklyAverage: 'Promedio Semanal',
        monthlyAverage: 'Promedio Mensual',
        vsCurrent: 'vs actual',
        // View buttons
        daily: 'Diario',
        weekly: 'Semanal',
        monthly: 'Mensual',
        // Welcome message
        welcomeTitle: '¡Bienvenido a Weather Timeline!',
        welcomeSubtitle: 'Compara patrones climáticos a través de múltiples años',
        welcomeInstruction: 'Comienza buscando una ciudad arriba',
        // Settings
        settings: 'Configuración',
        theme: 'Tema',
        language: 'Idioma',
        temperatureUnit: 'Unidad de Temperatura',
        favoriteLocations: 'Ubicaciones Favoritas',
        keyboardShortcuts: 'Atajos de Teclado',
        light: 'Claro',
        dark: 'Oscuro',
        // Keyboard shortcuts
        shortcutEsc: 'Cerrar modales, configuración o autocompletar',
        shortcutArrows: 'Desplazar líneas de tiempo izquierda/derecha',
        shortcutT: 'Alternar tema (Claro ↔ Oscuro)',
        shortcutU: 'Alternar unidad de temperatura (°C ↔ °F)'
    }
};

class WeatherTimeline {
    constructor() {
        // Load preferences from localStorage
        this.preferences = this.loadPreferences();

        // App state
        this.currentLocation = null;
        this.currentView = this.preferences.view || 'daily';
        this.currentLang = this.preferences.lang || 'en';
        this.timelines = [{ yearsAgo: 0 }, { yearsAgo: 1 }]; // Start with current year and 1 year ago
        this.weatherDataCache = {}; // Cache weather data by year
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

        // Update translations for initial language
        this.updateWelcomeMessageTranslations();
        this.updateSettingsTranslations();
    }

    // Load preferences from localStorage
    loadPreferences() {
        const defaults = {
            theme: 'light',
            tempUnit: 'celsius',
            view: 'daily',
            lang: 'en',
            favorites: []
        };

        try {
            const saved = localStorage.getItem('weather_timeline_prefs');
            const prefs = saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
            // Migrate from system theme to light
            if (prefs.theme === 'system') {
                prefs.theme = 'light';
            }
            return prefs;
        } catch (error) {
            console.error('Failed to load preferences:', error);
            return defaults;
        }
    }

    // Get translation
    t(key, ...args) {
        const lang = this.currentLang || 'en';
        const keys = key.split('.');
        let value = translations[lang];

        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                return key;
            }
        }

        return value || key;
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
        this.changeTheme(this.preferences.theme);

        // Apply language
        const langNames = { en: 'EN', tr: 'TR', es: 'ES' };
        const langTextSpan = this.langDropdownBtn.querySelector('.lang-text');
        if (langTextSpan) {
            langTextSpan.textContent = langNames[this.currentLang];
        }
        const footerLangTextSpan = this.footerLangDropdownBtn.querySelector('.lang-text');
        if (footerLangTextSpan) {
            footerLangTextSpan.textContent = langNames[this.currentLang];
        }

        // Update language dropdown menu
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
        });

        // Update settings panel language buttons
        document.querySelectorAll('.settings-section [data-lang]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
        });

        // Update search placeholder
        this.navbarSearch.placeholder = this.t('searchPlaceholder');

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
        // Navbar elements
        this.appLogo = document.querySelector('.app-logo');
        this.appName = document.querySelector('.app-name');
        this.navbarSearch = document.getElementById('navbarSearch');
        this.navSettingsBtn = document.getElementById('navSettingsBtn');
        this.clearSearchBtn = document.getElementById('clearSearchBtn');
        this.navbarAutocomplete = document.getElementById('navbarAutocomplete');
        this.themeToggleBtn = document.getElementById('themeToggleBtn');
        this.langDropdownBtn = document.getElementById('langDropdownBtn');
        this.langDropdownMenu = document.getElementById('langDropdownMenu');
        this.navFavoritesBtn = document.getElementById('navFavoritesBtn');
        this.navFavoritesDropdown = document.getElementById('navFavoritesDropdown');
        this.navFavoritesDropdownList = document.getElementById('navFavoritesDropdownList');

        // Footer elements
        this.footerFavoritesBtn = document.getElementById('footerFavoritesBtn');
        this.footerFavoritesDropdown = document.getElementById('footerFavoritesDropdown');
        this.footerFavoritesDropdownList = document.getElementById('footerFavoritesDropdownList');
        this.footerShareBtn = document.getElementById('footerShareBtn');
        this.footerSettingsBtn = document.getElementById('footerSettingsBtn');
        this.footerLangDropdownBtn = document.getElementById('footerLangDropdownBtn');
        this.footerLangDropdownMenu = document.getElementById('footerLangDropdownMenu');
        this.footerThemeToggleBtn = document.getElementById('footerThemeToggleBtn');
        this.footerLogo = document.querySelector('.footer-logo');
        this.footerAppName = document.querySelector('.footer-app-name');

        // Settings
        this.settingsPanel = document.getElementById('settingsPanel');
        this.shareBtn = document.getElementById('shareBtn');
        this.closeSettingsBtn = document.getElementById('closeSettings');
        this.favoritesList = document.getElementById('favoritesList');
        this.favoritesHeader = document.getElementById('favoritesHeader');
        this.keyboardShortcutsList = document.getElementById('keyboardShortcutsList');
        this.keyboardShortcutsHeader = document.getElementById('keyboardShortcutsHeader');

        // Location controls
        this.controlsContent = document.getElementById('controlsContent');
        this.viewBtns = document.querySelectorAll('.btn-view[data-view]');
        this.addTimelineBtn = document.getElementById('addTimelineBtn');
        this.jumpToDateBtn = document.getElementById('jumpToDateBtn');

        // Display
        this.favoriteBtn = document.getElementById('favoriteBtn');
        this.welcomeMessage = document.getElementById('welcomeMessage');
        this.timelineControls = document.getElementById('timelineControls');
        this.timelinesWrapper = document.getElementById('timelinesWrapper');

        // Add Timeline Modal
        this.addTimelineModal = document.getElementById('addTimelineModal');
        this.closeModal = document.getElementById('closeModal');
        this.specificYearInput = document.getElementById('specificYear');
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
        this.jumpToday = document.getElementById('jumpToday');
        this.jumpLastWeek = document.getElementById('jumpLastWeek');
        this.jumpLastMonth = document.getElementById('jumpLastMonth');

        // Utility
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
    }

    // Setup event listeners
    setupEventListeners() {
        // Logo - Scroll to top
        this.appLogo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // App Name - Scroll to top
        this.appName.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Navbar - Settings
        this.navSettingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openSettings();
        });
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());

        // Close settings modal on background click
        this.settingsPanel.addEventListener('click', (e) => {
            if (e.target === this.settingsPanel) {
                this.closeSettings();
            }
        });

        // Footer - Settings and Theme
        this.footerSettingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openSettings();
        });
        this.footerThemeToggleBtn.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Footer - Logo (Scroll to top)
        this.footerLogo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Footer - App Name (Scroll to top)
        this.footerAppName.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Share buttons
        this.shareBtn.addEventListener('click', () => this.shareApp());
        this.footerShareBtn.addEventListener('click', () => this.shareApp());

        // Navbar - Search
        this.navbarSearch.addEventListener('input', (e) => this.handleNavbarSearchInput(e.target.value));
        this.navbarSearch.addEventListener('keydown', (e) => this.handleNavbarSearchKeydown(e));
        this.navbarSearch.addEventListener('focus', () => {
            if (this.navbarSearch.value.length >= 2 && this.autocompleteResults.length > 0) {
                this.showNavbarAutocomplete();
            }
        });
        this.navbarSearch.addEventListener('blur', () => {
            // Delay hiding to allow click on autocomplete item
            setTimeout(() => this.hideNavbarAutocomplete(), 200);
        });
        this.navbarSearch.addEventListener('click', () => {
            // Select text when clicking on a selected location
            if (this.currentLocation) {
                this.navbarSearch.select();
            } else {
                // Show "Use My Location" option when search is empty
                this.showUseMyLocationOption();
            }
        });

        // Clear search button
        this.clearSearchBtn.addEventListener('click', () => this.clearSearch());

        // Collapsable favorites
        this.favoritesHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavoritesList();
        });

        // Collapsable keyboard shortcuts
        this.keyboardShortcutsHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleKeyboardShortcutsList();
        });

        // Navbar theme toggle button
        this.themeToggleBtn.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Navbar language dropdown
        this.langDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLangDropdown();
        });

        // Language options in dropdown
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const lang = e.currentTarget.dataset.lang;
                if (lang) {
                    this.changeLanguage(lang);
                    this.langDropdownMenu.style.display = 'none';
                }
            });
        });

        // Footer language dropdown
        this.footerLangDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFooterLangDropdown();
        });

        // Close language dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (this.langDropdownMenu.style.display === 'block' &&
                !this.langDropdownBtn.contains(e.target) &&
                !this.langDropdownMenu.contains(e.target)) {
                this.langDropdownMenu.style.display = 'none';
            }
            if (this.footerLangDropdownMenu.style.display === 'block' &&
                !this.footerLangDropdownBtn.contains(e.target) &&
                !this.footerLangDropdownMenu.contains(e.target)) {
                this.footerLangDropdownMenu.style.display = 'none';
            }
        });

        // Navbar - Favorites dropdown
        this.navFavoritesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleNavFavoritesDropdown();
        });

        // Footer - Favorites dropdown
        this.footerFavoritesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFooterFavoritesDropdown();
        });

        // Close favorites dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (this.navFavoritesDropdown.style.display === 'block' &&
                !this.navFavoritesBtn.contains(e.target) &&
                !this.navFavoritesDropdown.contains(e.target)) {
                this.navFavoritesDropdown.style.display = 'none';
            }
            if (this.footerFavoritesDropdown.style.display === 'block' &&
                !this.footerFavoritesBtn.contains(e.target) &&
                !this.footerFavoritesDropdown.contains(e.target)) {
                this.footerFavoritesDropdown.style.display = 'none';
            }
        });

        // Theme buttons in settings panel
        document.querySelectorAll('.settings-section [data-theme]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent settings panel from closing
                const theme = e.currentTarget.dataset.theme;
                if (theme) {
                    this.changeTheme(theme);
                }
            });
        });

        // Language buttons in settings panel
        document.querySelectorAll('.settings-section [data-lang]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = e.currentTarget.dataset.lang;
                if (lang) {
                    this.changeLanguage(lang);
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

        // Timeline action buttons
        this.addTimelineBtn.addEventListener('click', () => this.openAddTimelineModal());
        this.jumpToDateBtn.addEventListener('click', () => this.openJumpToDateModal());

        // Add Timeline Modal
        this.closeModal.addEventListener('click', () => this.closeAddTimelineModal());
        this.cancelAddTimeline.addEventListener('click', () => this.closeAddTimelineModal());
        this.confirmAddTimeline.addEventListener('click', () => this.addTimeline());
        this.yearsAgoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTimeline();
        });
        this.specificYearInput.addEventListener('keypress', (e) => {
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

        // Jump to date preset buttons
        this.jumpToday.addEventListener('click', () => this.jumpToPresetDate(0));
        this.jumpLastWeek.addEventListener('click', () => this.jumpToPresetDate(7));
        this.jumpLastMonth.addEventListener('click', () => this.jumpToPresetDate(30));

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
                } else if (this.settingsPanel.style.display === 'flex') {
                    this.closeSettings();
                } else if (this.navbarAutocomplete.style.display === 'block') {
                    this.hideNavbarAutocomplete();
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
        const themes = ['light', 'dark', 'neon', 'forest', 'ocean', 'matrix', 'sunset', 'midnight'];
        const currentIndex = themes.indexOf(this.preferences.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.changeTheme(themes[nextIndex]);
    }

    toggleTempUnit() {
        const newUnit = this.preferences.tempUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        this.changeTempUnit(newUnit);
    }

    // Theme toggle (Light/Dark only)
    toggleTheme() {
        const newTheme = this.preferences.theme === 'light' ? 'dark' : 'light';
        this.changeTheme(newTheme);
    }

    // Theme management
    changeTheme(theme) {
        this.preferences.theme = theme;
        this.savePreferences();
        document.documentElement.setAttribute('data-theme', theme);

        const lightIconHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
        `;

        const darkIconHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
        `;

        // Update navbar theme button
        this.themeToggleBtn.dataset.theme = theme;
        this.themeToggleBtn.innerHTML = theme === 'dark' ? darkIconHTML : lightIconHTML;
        this.themeToggleBtn.title = 'Toggle Theme (Light/Dark)';

        // Update footer theme button
        this.footerThemeToggleBtn.dataset.theme = theme;
        this.footerThemeToggleBtn.innerHTML = theme === 'dark' ? darkIconHTML : lightIconHTML;
        this.footerThemeToggleBtn.title = 'Toggle Theme (Light/Dark)';

        // Update settings panel theme buttons
        document.querySelectorAll('.settings-section [data-theme]').forEach(btn => {
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

    // Language dropdown toggle
    toggleLangDropdown() {
        const isVisible = this.langDropdownMenu.style.display === 'block';
        this.langDropdownMenu.style.display = isVisible ? 'none' : 'block';
    }

    // Footer language dropdown toggle
    toggleFooterLangDropdown() {
        const isVisible = this.footerLangDropdownMenu.style.display === 'block';
        this.footerLangDropdownMenu.style.display = isVisible ? 'none' : 'block';
    }

    // Language management
    changeLanguage(lang) {
        this.currentLang = lang;
        this.preferences.lang = lang;
        this.savePreferences();

        // Update navbar and footer dropdown button text
        const langNames = { en: 'EN', tr: 'TR', es: 'ES' };
        const langTextSpan = this.langDropdownBtn.querySelector('.lang-text');
        if (langTextSpan) {
            langTextSpan.textContent = langNames[lang];
        }
        const footerLangTextSpan = this.footerLangDropdownBtn.querySelector('.lang-text');
        if (footerLangTextSpan) {
            footerLangTextSpan.textContent = langNames[lang];
        }

        // Update dropdown menu active state
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Close both dropdowns
        this.langDropdownMenu.style.display = 'none';
        this.footerLangDropdownMenu.style.display = 'none';

        // Update settings panel language buttons
        document.querySelectorAll('.settings-section [data-lang]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // Update search placeholder
        this.navbarSearch.placeholder = this.t('searchPlaceholder');

        // Update view button text
        this.viewBtns.forEach(btn => {
            const view = btn.dataset.view;
            if (view) {
                btn.textContent = this.t(view);
            }
        });

        // Update welcome message and settings
        this.updateWelcomeMessageTranslations();
        this.updateSettingsTranslations();

        // Re-render timelines if location is selected
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

    // Settings modal
    openSettings() {
        this.settingsPanel.style.display = 'flex';
    }

    closeSettings() {
        this.settingsPanel.style.display = 'none';
    }

    async shareApp() {
        const shareData = {
            title: 'Weather Timeline',
            text: 'Compare weather patterns across multiple years!',
            url: window.location.href
        };

        try {
            // Check if Web Share API is supported (typically mobile devices)
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for desktop: copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                this.showSuccess('Link copied to clipboard!');
            }
        } catch (error) {
            // User cancelled share or clipboard write failed
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
                this.showError('Failed to share. Please copy the URL manually.');
            }
        }
    }

    updateWelcomeMessageTranslations() {
        const welcomeTitle = document.getElementById('welcomeTitle');
        const welcomeSubtitle = document.getElementById('welcomeSubtitle');
        const welcomeInstruction = document.getElementById('welcomeInstruction');
        if (welcomeTitle) welcomeTitle.textContent = this.t('welcomeTitle');
        if (welcomeSubtitle) welcomeSubtitle.textContent = this.t('welcomeSubtitle');
        if (welcomeInstruction) welcomeInstruction.textContent = this.t('welcomeInstruction');
    }

    updateSettingsTranslations() {
        // Update settings header
        const settingsHeader = this.settingsPanel.querySelector('.settings-header h3');
        if (settingsHeader) settingsHeader.textContent = this.t('settings');

        // Update settings section labels
        const labels = this.settingsPanel.querySelectorAll('.settings-section label');
        if (labels[0]) labels[0].textContent = this.t('theme');
        if (labels[1]) labels[1].textContent = this.t('language');
        if (labels[2]) labels[2].textContent = this.t('temperatureUnit');

        // Update theme buttons
        const themeButtons = this.settingsPanel.querySelectorAll('.settings-section [data-theme]');
        themeButtons.forEach(btn => {
            if (btn.dataset.theme === 'light') btn.textContent = this.t('light');
            if (btn.dataset.theme === 'dark') btn.textContent = this.t('dark');
        });

        // Update favorites header
        const favoritesHeader = this.favoritesHeader.querySelector('h4');
        if (favoritesHeader) favoritesHeader.textContent = this.t('favoriteLocations');

        // Update keyboard shortcuts header
        const keyboardShortcutsHeader = this.keyboardShortcutsHeader.querySelector('h4');
        if (keyboardShortcutsHeader) keyboardShortcutsHeader.textContent = this.t('keyboardShortcuts');

        // Update keyboard shortcuts descriptions
        const shortcutItems = this.settingsPanel.querySelectorAll('.keyboard-shortcuts-list .shortcut-item span');
        if (shortcutItems[0]) shortcutItems[0].textContent = this.t('shortcutEsc');
        if (shortcutItems[1]) shortcutItems[1].textContent = this.t('shortcutArrows');
        if (shortcutItems[2]) shortcutItems[2].textContent = this.t('shortcutT');
        if (shortcutItems[3]) shortcutItems[3].textContent = this.t('shortcutU');
    }

    toggleFavoritesList() {
        this.favoritesList.classList.toggle('collapsed');
        const icon = this.favoritesHeader.querySelector('.collapse-icon');
        icon.classList.toggle('rotated');
    }

    toggleKeyboardShortcutsList() {
        this.keyboardShortcutsList.classList.toggle('collapsed');
        const icon = this.keyboardShortcutsHeader.querySelector('.collapse-icon');
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

    // Quick add/remove favorite from autocomplete
    quickAddFavorite(index, buttonElement) {
        const result = this.autocompleteResults[index];

        const favorite = {
            name: result.name,
            country: result.country,
            lat: result.latitude,
            lon: result.longitude
        };

        const favIndex = this.preferences.favorites.findIndex(
            f => f.lat === favorite.lat && f.lon === favorite.lon
        );

        if (favIndex >= 0) {
            // Remove from favorites
            this.preferences.favorites.splice(favIndex, 1);
            buttonElement.classList.remove('active');
            buttonElement.title = 'Add to favorites';
            buttonElement.querySelector('svg').setAttribute('fill', 'none');
            this.showSuccess('Removed from favorites');
        } else {
            // Add to favorites
            this.preferences.favorites.push(favorite);
            buttonElement.classList.add('active');
            buttonElement.title = 'Remove from favorites';
            buttonElement.querySelector('svg').setAttribute('fill', 'currentColor');
            this.showSuccess('Added to favorites');
        }

        this.savePreferences();
        this.renderFavorites();

        // Update current location favorite button if this is the current location
        if (this.currentLocation &&
            this.currentLocation.lat === favorite.lat &&
            this.currentLocation.lon === favorite.lon) {
            this.favoriteBtn.classList.toggle('active', favIndex < 0);
        }
    }

    renderFavorites() {
        // Render to settings panel (list view)
        if (this.preferences.favorites.length === 0) {
            this.favoritesList.innerHTML = '<p class="empty-state">No favorites yet. Search for a city and click the star!</p>';
            this.navFavoritesDropdownList.innerHTML = '<p class="empty-state">No favorites yet</p>';
            this.footerFavoritesDropdownList.innerHTML = '<p class="empty-state">No favorites yet</p>';
            return;
        }

        // Settings panel list
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

        // Add click handlers to favorites in settings panel
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

        // Add remove button handlers (settings panel)
        document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = e.currentTarget.closest('.favorite-item');
                const lat = parseFloat(item.dataset.lat);
                const lon = parseFloat(item.dataset.lon);
                this.removeFavorite(lat, lon);
            });
        });

        // Render to navbar dropdown
        const dropdownHTML = this.preferences.favorites.map(fav => `
            <div class="favorite-item" data-lat="${fav.lat}" data-lon="${fav.lon}" data-name="${fav.name}" data-country="${fav.country}">
                <div class="favorite-item-info">
                    <div class="favorite-item-name">${fav.name}</div>
                    <div class="favorite-item-country">${fav.country}</div>
                </div>
            </div>
        `).join('');

        this.navFavoritesDropdownList.innerHTML = dropdownHTML;
        this.footerFavoritesDropdownList.innerHTML = dropdownHTML;

        // Add click handlers to dropdown favorites
        document.querySelectorAll('#navFavoritesDropdownList .favorite-item, #footerFavoritesDropdownList .favorite-item').forEach(item => {
            const lat = parseFloat(item.dataset.lat);
            const lon = parseFloat(item.dataset.lon);
            const name = item.dataset.name;
            const country = item.dataset.country;

            item.addEventListener('click', () => {
                this.loadWeatherData(lat, lon, name, country);
                this.navFavoritesDropdown.style.display = 'none';
                this.footerFavoritesDropdown.style.display = 'none';
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

    toggleNavFavoritesDropdown() {
        const isVisible = this.navFavoritesDropdown.style.display === 'block';
        this.navFavoritesDropdown.style.display = isVisible ? 'none' : 'block';
        // Close footer dropdown if open
        this.footerFavoritesDropdown.style.display = 'none';
        // Close language dropdown if open
        this.langDropdownMenu.style.display = 'none';
    }

    toggleFooterFavoritesDropdown() {
        const isVisible = this.footerFavoritesDropdown.style.display === 'block';
        this.footerFavoritesDropdown.style.display = isVisible ? 'none' : 'block';
        // Close navbar dropdown if open
        this.navFavoritesDropdown.style.display = 'none';
    }

    // Navbar search autocomplete - Optimized
    async handleNavbarSearchInput(query) {
        clearTimeout(this.autocompleteTimeout);
        this.autocompleteSelectedIndex = -1;

        if (query.length < 2) {
            this.hideNavbarAutocomplete();
            this.clearSearchBtn.style.display = 'none';
            return;
        }

        // Show clear button
        this.clearSearchBtn.style.display = 'block';

        // Show loading state
        this.navbarAutocomplete.innerHTML = '<div class="autocomplete-item"><div class="autocomplete-item-name">Searching...</div></div>';
        this.navbarAutocomplete.style.display = 'block';

        this.autocompleteTimeout = setTimeout(async () => {
            try {
                const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
                const response = await fetch(url);
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    this.autocompleteResults = data.results;
                    this.showNavbarAutocomplete();
                } else {
                    this.navbarAutocomplete.innerHTML = '<div class="autocomplete-item"><div class="autocomplete-item-name">No results found</div></div>';
                }
            } catch (error) {
                console.error('Autocomplete error:', error);
                this.hideNavbarAutocomplete();
            }
        }, 250); // Reduced debounce to 250ms for faster response
    }

    showUseMyLocationOption() {
        // Show only "Use My Location" option
        const html = `
            <div class="autocomplete-item use-location-item" data-action="geolocation">
                <div class="autocomplete-item-name">📍 Use My Location</div>
                <div class="autocomplete-item-details">Get weather for your current position</div>
            </div>
        `;

        this.navbarAutocomplete.innerHTML = html;
        this.navbarAutocomplete.style.display = 'block';

        // Add click handler for "Use My Location"
        const geolocationItem = this.navbarAutocomplete.querySelector('[data-action="geolocation"]');
        if (geolocationItem) {
            geolocationItem.addEventListener('click', () => {
                this.useGeolocation();
                this.hideNavbarAutocomplete();
            });
        }
    }

    showNavbarAutocomplete() {
        // Add "Use My Location" option at the top
        let html = `
            <div class="autocomplete-item use-location-item" data-action="geolocation">
                <div class="autocomplete-item-name">📍 Use My Location</div>
                <div class="autocomplete-item-details">Get weather for your current position</div>
            </div>
        `;

        // Add search results
        html += this.autocompleteResults.map((result, index) => {
            const isFavorite = this.preferences.favorites.some(
                f => f.lat === result.latitude && f.lon === result.longitude
            );
            return `
                <div class="autocomplete-item ${index === this.autocompleteSelectedIndex ? 'active' : ''}" data-index="${index}">
                    <div class="autocomplete-item-info">
                        <div class="autocomplete-item-name">${result.name}</div>
                        <div class="autocomplete-item-details">
                            ${result.admin1 ? result.admin1 + ', ' : ''}${result.country}
                            ${result.population ? ' • ' + this.formatPopulation(result.population) : ''}
                        </div>
                    </div>
                    <button class="autocomplete-star-btn ${isFavorite ? 'active' : ''}" data-index="${index}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');

        this.navbarAutocomplete.innerHTML = html;
        this.navbarAutocomplete.style.display = 'block';

        // Add click handler for "Use My Location"
        const geolocationItem = this.navbarAutocomplete.querySelector('[data-action="geolocation"]');
        if (geolocationItem) {
            geolocationItem.addEventListener('click', () => {
                this.useGeolocation();
                this.hideNavbarAutocomplete();
            });
        }

        // Add click handlers for search results
        document.querySelectorAll('.autocomplete-item[data-index]').forEach(item => {
            item.addEventListener('click', (e) => {
                // Don't select city if clicking the star button
                if (e.target.closest('.autocomplete-star-btn')) return;

                const index = parseInt(item.dataset.index);
                if (!isNaN(index)) {
                    this.selectNavbarAutocompleteItem(index);
                }
            });

            // Add hover handler for keyboard navigation
            item.addEventListener('mouseenter', () => {
                const index = parseInt(item.dataset.index);
                if (!isNaN(index)) {
                    this.autocompleteSelectedIndex = index;
                    this.updateNavbarAutocompleteSelection();
                }
            });
        });

        // Add click handlers for star buttons
        document.querySelectorAll('.autocomplete-star-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.dataset.index);
                if (!isNaN(index)) {
                    this.quickAddFavorite(index, btn);
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

    updateNavbarAutocompleteSelection() {
        document.querySelectorAll('.autocomplete-item[data-index]').forEach((item, index) => {
            item.classList.toggle('active', index === this.autocompleteSelectedIndex);
        });
    }

    hideNavbarAutocomplete() {
        this.navbarAutocomplete.style.display = 'none';
        this.autocompleteSelectedIndex = -1;
    }

    selectNavbarAutocompleteItem(index) {
        const result = this.autocompleteResults[index];
        this.hideNavbarAutocomplete();
        this.loadWeatherData(result.latitude, result.longitude, result.name, result.country);
    }

    handleNavbarSearchKeydown(e) {
        const isAutocompleteVisible = this.navbarAutocomplete.style.display === 'block' &&
                                      this.autocompleteResults.length > 0;

        if (e.key === 'Enter') {
            e.preventDefault();
            if (isAutocompleteVisible) {
                // Select first result if no selection made, otherwise use selected index
                const indexToSelect = this.autocompleteSelectedIndex >= 0 ? this.autocompleteSelectedIndex : 0;
                this.selectNavbarAutocompleteItem(indexToSelect);
            } else if (this.navbarSearch.value.trim()) {
                // Search for the typed city name
                this.searchCity(this.navbarSearch.value.trim());
            }
        } else if (e.key === 'Escape') {
            this.hideNavbarAutocomplete();
        } else if (e.key === 'ArrowDown' && isAutocompleteVisible) {
            e.preventDefault();
            this.autocompleteSelectedIndex = Math.min(
                this.autocompleteSelectedIndex + 1,
                this.autocompleteResults.length - 1
            );
            this.updateNavbarAutocompleteSelection();
            // Scroll into view
            const activeItem = document.querySelector('.autocomplete-item.active');
            if (activeItem) {
                activeItem.scrollIntoView({ block: 'nearest' });
            }
        } else if (e.key === 'ArrowUp' && isAutocompleteVisible) {
            e.preventDefault();
            this.autocompleteSelectedIndex = Math.max(this.autocompleteSelectedIndex - 1, 0);
            this.updateNavbarAutocompleteSelection();
            // Scroll into view
            const activeItem = document.querySelector('.autocomplete-item.active');
            if (activeItem) {
                activeItem.scrollIntoView({ block: 'nearest' });
            }
        }
    }

    clearSearch() {
        this.navbarSearch.value = '';
        this.clearSearchBtn.style.display = 'none';
        this.favoriteBtn.style.display = 'none';
        this.hideNavbarAutocomplete();
        this.currentLocation = null;
        this.timelines = [{ yearsAgo: 0 }, { yearsAgo: 1 }]; // Reset to default timelines
        this.welcomeMessage.style.display = 'flex';
        this.timelineControls.style.display = 'none';
        this.timelinesWrapper.style.display = 'none';
        this.navbarSearch.placeholder = this.t('searchPlaceholder');
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
                    // Get city name from coordinates using reverse geocoding
                    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10&addressdetails=1`;
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': 'WeatherTimelineApp/1.0'
                        }
                    });
                    const data = await response.json();

                    let cityName = 'Current Location';
                    let country = '';

                    if (data.address) {
                        // Try to get city name from different fields
                        cityName = data.address.city ||
                                   data.address.town ||
                                   data.address.village ||
                                   data.address.county ||
                                   data.address.state ||
                                   'Current Location';
                        country = data.address.country || '';
                    }

                    this.loadWeatherData(position.coords.latitude, position.coords.longitude, cityName, country);
                } catch (error) {
                    console.error('Geocoding error:', error);
                    // Fallback: still load weather but with generic name
                    this.loadWeatherData(position.coords.latitude, position.coords.longitude, 'Current Location', '');
                }
            },
            (error) => {
                this.hideLoading();
                this.showError('Unable to retrieve your location: ' + error.message);
            }
        );
    }

    // City search
    async searchCity(cityName = null) {
        if (!cityName) {
            cityName = this.navbarSearch.value.trim();
        }

        if (!cityName) {
            this.showError('Please enter a city name');
            return;
        }

        this.showLoading();
        this.hideNavbarAutocomplete();

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

        // Check if we need recent data (within last 7 days) or historical data
        const daysSinceEnd = Math.floor((now - end) / (1000 * 60 * 60 * 24));
        const isRecentData = daysSinceEnd < 7;

        let url;
        if (isRecentData) {
            // Use forecast API for recent/current data (includes past 7 days + forecast)
            url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&past_days=92&forecast_days=1`;
        } else {
            // Use archive API for historical data
            url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDateStr}&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const data = await response.json();

        if (!data.daily || !data.daily.time) {
            throw new Error('Invalid weather data received');
        }

        const weatherData = [];

        for (let i = 0; i < data.daily.time.length; i++) {
            const date = new Date(data.daily.time[i]);

            // Filter to only include dates in our requested range
            if (date >= start && date <= end) {
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
        const englishDesc = descriptions[code] || 'unknown';
        return this.t(`weatherConditions.${englishDesc}`);
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
        // Clear specific year input
        this.specificYearInput.value = '';

        // Set default to next available year in years back field
        const existingYears = this.timelines.map(t => t.yearsAgo);
        let nextYear = 1;
        while (existingYears.includes(nextYear) && nextYear <= 86) {
            nextYear++;
        }
        this.yearsAgoInput.value = nextYear;
        this.addTimelineModal.style.display = 'flex';
        setTimeout(() => this.specificYearInput.focus(), 100);
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

    jumpToPresetDate(daysBack) {
        this.closeJumpToDateModal();
        this.scrollToDate(daysBack);
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
            let scrollBackAmount;

            if (this.currentView === 'daily') {
                // Each day is approximately 150px wide
                scrollBackAmount = daysBack * 150;
            } else if (this.currentView === 'weekly') {
                // Each week is approximately 150px wide
                const weeksBack = Math.floor(daysBack / 7);
                scrollBackAmount = weeksBack * 150;
            } else if (this.currentView === 'monthly') {
                // Each month is approximately 150px wide
                const monthsBack = Math.floor(daysBack / 30);
                scrollBackAmount = monthsBack * 150;
            }

            // Calculate scroll position from the right (today is at the right)
            // scrollWidth - clientWidth gives us the maximum scrollLeft value (rightmost position)
            const maxScroll = container.scrollWidth - container.clientWidth;
            const scrollTarget = Math.max(0, maxScroll - scrollBackAmount);

            // Smooth scroll to target
            container.scrollTo({
                left: scrollTarget,
                behavior: 'smooth'
            });
        });
    }

    async addTimeline() {
        let yearsAgo;

        // Check if specific year is entered
        const specificYear = parseInt(this.specificYearInput.value);
        if (specificYear) {
            const currentYear = new Date().getFullYear();
            if (specificYear < 1940 || specificYear > currentYear - 1) {
                this.showError(`Please enter a year between 1940 and ${currentYear - 1}`);
                return;
            }
            yearsAgo = currentYear - specificYear;
        } else {
            // Use years back input
            yearsAgo = parseInt(this.yearsAgoInput.value);
            if (isNaN(yearsAgo) || yearsAgo < 1 || yearsAgo > 86) {
                this.showError('Please enter a value between 1 and 86');
                return;
            }
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
            const year = new Date().getFullYear() - yearsAgo;
            this.showSuccess(`Added timeline for year ${year}`);

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

    // Sync scroll removed - unified scroll container handles this automatically

    // Render all timelines in unified container
    renderAllTimelines() {
        this.timelinesWrapper.innerHTML = '';

        // Create unified container structure
        const unifiedContainer = document.createElement('div');
        unifiedContainer.className = 'unified-timeline-container';

        // Create scroll controls wrapper
        const scrollControlsWrapper = document.createElement('div');
        scrollControlsWrapper.className = 'unified-scroll-wrapper';

        // Left scroll button (bigger)
        const leftButton = document.createElement('button');
        leftButton.className = 'scroll-btn scroll-left scroll-btn-large';
        leftButton.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6"></path>
            </svg>
        `;

        // Unified timeline scroll container
        const unifiedScroll = document.createElement('div');
        unifiedScroll.className = 'unified-timeline-scroll';

        // Right scroll button (bigger)
        const rightButton = document.createElement('button');
        rightButton.className = 'scroll-btn scroll-right scroll-btn-large';
        rightButton.innerHTML = `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"></path>
            </svg>
        `;

        // Render each timeline as a complete row (header + track)
        this.timelines.forEach((timeline) => {
            const data = this.weatherDataCache[timeline.yearsAgo];
            if (!data) return;

            const aggregated = this.aggregateData(data);

            // Create complete timeline row with header above track
            const timelineRow = this.createCompleteTimelineRow(timeline, aggregated);
            unifiedScroll.appendChild(timelineRow);
        });

        // Assemble unified structure
        scrollControlsWrapper.appendChild(leftButton);
        scrollControlsWrapper.appendChild(unifiedScroll);
        scrollControlsWrapper.appendChild(rightButton);
        unifiedContainer.appendChild(scrollControlsWrapper);

        this.timelinesWrapper.appendChild(unifiedContainer);

        // Setup scroll buttons - scroll 3x more (900px instead of 300px)
        leftButton.addEventListener('click', () => {
            unifiedScroll.scrollLeft -= 900;
        });
        rightButton.addEventListener('click', () => {
            unifiedScroll.scrollLeft += 900;
        });

        // Scroll to today and center it
        setTimeout(() => {
            requestAnimationFrame(() => {
                // Find today's item in the first timeline
                const todayItem = unifiedScroll.querySelector('.timeline-item.today');
                if (todayItem) {
                    // Center the today item in the viewport
                    const scrollContainerRect = unifiedScroll.getBoundingClientRect();
                    const itemRect = todayItem.getBoundingClientRect();
                    const scrollOffset = itemRect.left - scrollContainerRect.left - (scrollContainerRect.width / 2) + (itemRect.width / 2);
                    unifiedScroll.scrollLeft += scrollOffset;
                } else {
                    // Fallback: scroll to end
                    unifiedScroll.scrollLeft = unifiedScroll.scrollWidth;
                }
            });
        }, 300);
    }

    createCompleteTimelineRow(timeline, data) {
        const year = new Date().getFullYear() - timeline.yearsAgo;
        const title = timeline.yearsAgo === 0 ? this.t('currentWeather') :
                      timeline.yearsAgo === 1 ? this.t('oneYearAgo') :
                      `${timeline.yearsAgo} ${this.t('yearsAgo')}`;

        // Create container for header + track
        const rowContainer = document.createElement('div');
        rowContainer.className = 'timeline-row-container';
        rowContainer.dataset.yearsAgo = timeline.yearsAgo;

        // Create header (above track)
        const header = document.createElement('div');
        header.className = 'timeline-row-header';

        if (timeline.yearsAgo === 0) {
            header.innerHTML = `
                <h2>
                    ${title}
                    <span class="year-label-inline">${year}</span>
                </h2>
            `;
        } else {
            header.innerHTML = `
                <h2>
                    ${title}
                    <span class="year-label-inline">${year}</span>
                </h2>
                <button class="btn btn-icon btn-danger remove-timeline-btn" title="Remove this timeline">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            `;

            const removeBtn = header.querySelector('.remove-timeline-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => this.removeTimeline(timeline.yearsAgo));
            }
        }

        // Create track for items
        const track = document.createElement('div');
        track.className = 'timeline-track';

        // Add timeline items
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

        rowContainer.appendChild(header);
        rowContainer.appendChild(track);

        return rowContainer;
    }

    // Scroll sync no longer needed with unified container

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
                    ${diffSign}${diff}${unit} ${this.t('vsCurrent')}
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
        const months = this.t('months');
        const monthsShort = this.t('monthsShort');

        if (isMonth) {
            return `${months[date.getMonth()]} ${date.getFullYear()}`;
        } else if (isWeek && endDate) {
            const startMonth = monthsShort[date.getMonth()];
            const startDay = date.getDate();
            const endMonth = monthsShort[endDate.getMonth()];
            const endDay = endDate.getDate();
            return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
        } else {
            const month = monthsShort[date.getMonth()];
            const day = date.getDate();
            return `${month} ${day}`;
        }
    }

    formatDay(date, isWeek, isMonth) {
        if (isMonth) return this.t('monthlyAverage');
        if (isWeek) return this.t('weeklyAverage');
        const days = this.t('days');
        return days[date.getDay()];
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    // UI helpers
    updateLocationDisplay() {
        const countryText = this.currentLocation.country ? `, ${this.currentLocation.country}` : '';
        this.navbarSearch.value = `${this.currentLocation.name}${countryText}`;

        // Show favorite and clear buttons
        this.favoriteBtn.style.display = 'inline-flex';
        this.clearSearchBtn.style.display = 'block';

        // Update favorite button state
        const isFavorite = this.preferences.favorites.some(
            f => f.lat === this.currentLocation.lat && f.lon === this.currentLocation.lon
        );
        this.favoriteBtn.classList.toggle('active', isFavorite);
    }

    showTimelines() {
        this.welcomeMessage.style.display = 'none';
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
