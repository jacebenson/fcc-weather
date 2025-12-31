var global = window;

async function getCurrentLocation() {
    if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser.');
        throw new Error('Geolocation is not supported by this browser.');
    }
    
    console.log('Getting your location...');
    
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                const returnObject = {
                    latitude: latitude,
                    longitude: longitude,
                    accuracy: accuracy
                };
                console.log('📍 Location found:', returnObject);
                resolve(returnObject);
            },
            function(error) {
                let errorMessage = 'Unknown error occurred';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location service unavailable (Google API rate limit reached)';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                }
                console.log('❌ Error getting location:', errorMessage);
                console.log('💡 Tip: The rate limit usually resets after an hour. Try again later or use a different network.');
                reject(new Error(errorMessage));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    });
}

async function getWeatherData(lat, lon) {
    const url = `https://weather-proxy.freecodecamp.rocks/api/current?lat=${lat}&lon=${lon}`;
    console.log('Fetching weather data from:', url);
    try {
        let response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let weatherData = await response.json();
        console.log('Weather Data:', weatherData);
        return weatherData;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
}

async function geocodeCity(cityName) {
    // Use OpenStreetMap's Nominatim API (free, no API key required)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;
    console.log('Geocoding city:', cityName);
    
    try {
        let response = await fetch(url, {
            headers: {
                'User-Agent': 'WeatherApp/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.status}`);
        }
        
        let results = await response.json();
        
        if (results.length === 0) {
            throw new Error('City not found. Please try again with a different name.');
        }
        
        const location = results[0];
        console.log('📍 Geocoded location:', location.display_name);
        
        return {
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
            name: location.display_name
        };
    } catch (error) {
        console.error('Error geocoding city:', error);
        throw error;
    }
}

function showLocationModal(isError = false) {
    const modal = document.getElementById('locationModal');
    const modalMessage = document.getElementById('modalMessage');
    
    if (isError) {
        modalMessage.textContent = "Google's location service is unavailable. Please enter your city:";
    } else {
        modalMessage.textContent = "Please enter your city:";
    }
    
    modal.style.display = 'flex';
    document.getElementById('cityInput').focus();
}

function hideLocationModal() {
    document.getElementById('locationModal').style.display = 'none';
    document.getElementById('cityInput').value = '';
    document.getElementById('locationError').style.display = 'none';
}

async function handleUserLocationInput() {
    const cityInput = document.getElementById('cityInput').value.trim();
    const errorElement = document.getElementById('locationError');
    
    if (!cityInput) {
        errorElement.textContent = 'Please enter a city name';
        errorElement.style.display = 'block';
        return;
    }
    
    try {
        errorElement.style.display = 'none';
        document.getElementById('location').textContent = '📍 Looking up location...';
        document.getElementById('description').textContent = 'Please wait...';
        
        const location = await geocodeCity(cityInput);
        
        // Store in localStorage for next time
        localStorage.setItem('userLocation', JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
            name: cityInput
        }));
        
        hideLocationModal();
        
        const weatherData = await getWeatherData(location.latitude, location.longitude);
        const moonPhase = getDetailedMoonPhase();
        updateWeatherDisplay(weatherData, moonPhase);
        
    } catch (error) {
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
        console.error('Error processing location:', error);
    }
}

function getDetailedMoonPhase(date = new Date()) {
    const lunarCycle = 29.530588853;
    const knownNewMoon = new Date('2024-01-11T00:00:00Z').getTime();
    const currentTime = date.getTime();
    const daysSinceNewMoon = (currentTime - knownNewMoon) / (1000 * 60 * 60 * 24);
    const phase = (daysSinceNewMoon % lunarCycle) / lunarCycle;
    
    const phases = [
        { name: "New Moon", emoji: "🌑", range: [0.97, 0.03] },
        { name: "Waxing Crescent", emoji: "🌒", range: [0.03, 0.22] },
        { name: "First Quarter", emoji: "🌓", range: [0.22, 0.28] },
        { name: "Waxing Gibbous", emoji: "🌔", range: [0.28, 0.47] },
        { name: "Full Moon", emoji: "🌕", range: [0.47, 0.53] },
        { name: "Waning Gibbous", emoji: "🌖", range: [0.53, 0.72] },
        { name: "Last Quarter", emoji: "🌗", range: [0.72, 0.78] },
        { name: "Waning Crescent", emoji: "🌘", range: [0.78, 0.97] }
    ];
    
    for (let moonPhase of phases) {
        const [start, end] = moonPhase.range;
        if ((start > end && (phase >= start || phase < end)) || 
            (phase >= start && phase < end)) {
            return {
                phase: moonPhase.name,
                emoji: moonPhase.emoji,
                percentage: Math.round(phase * 100),
                daysInCycle: (daysSinceNewMoon % lunarCycle).toFixed(1)
            };
        }
    }
    return { phase: "Unknown", emoji: "🌙", percentage: 0, daysInCycle: 0 };
}

function updateWeatherDisplay(weatherData, moonPhase) {
    global.currentWeatherData = weatherData;
    
    // Weather icon
    const imgElement = document.getElementById('img');
    if (weatherData.weather && weatherData.weather[0] && weatherData.weather[0].icon) {
        imgElement.src = weatherData.weather[0].icon;
        imgElement.alt = weatherData.weather[0].description;
    }
    
    // Location
    const locationElement = document.getElementById('location');
    locationElement.textContent = `📍 ${weatherData.name}, ${weatherData.sys.country}`;
    
    // Show the change location button
    const changeLocationBtn = document.getElementById('changeLocationBtn');
    changeLocationBtn.style.display = 'block';
    
    // Weather description with emoji
    const descriptionElement = document.getElementById('description');
    const weatherDesc = weatherData.weather && weatherData.weather[0] ? weatherData.weather[0].description : 'Unknown';
    const weatherEmoji = getWeatherEmoji(weatherDesc);
    descriptionElement.textContent = `${weatherEmoji} ${weatherDesc}`;
    
    // Update all displays
    updateMinimalistDisplay(weatherData, moonPhase);
}

function getWeatherEmoji(description) {
    const desc = description.toLowerCase();
    if (desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('drizzle')) return '🌦️';
    if (desc.includes('thunderstorm')) return '⛈️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
    return '⛅';
}



function getWindDirection(degrees) {
    const directions = ['↓ N', '↙ NE', '← E', '↖ SE', '↑ S', '↗ SW', '→ W', '↘ NW'];
    return directions[Math.round(degrees / 45) % 8];
}

function formatTime(timestamp, timezoneOffset) {
    // Convert Unix timestamp to local time with timezone offset
    const date = new Date((timestamp + timezoneOffset) * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    
    // Convert to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${displayHours}:${minutes} ${ampm}`;
}

function updateMinimalistDisplay(weatherData, moonPhase) {
    if (!weatherData) return;
    
    // Day section
    if (weatherData.sys && weatherData.sys.sunrise) {
        const timezoneOffset = weatherData.timezone || 0;
        const sunriseTime = formatTime(weatherData.sys.sunrise, timezoneOffset);
        document.getElementById('sunrise').textContent = `🌅 ${sunriseTime}`;
    }
    
    // Temperature range for day
    const tempC = Math.round(weatherData.main.temp);
    const tempF = Math.round((weatherData.main.temp * 9/5) + 32);
    // Main temperature display with high/low
    const tempHighF = Math.round((weatherData.main.temp_max * 9/5) + 32);
    const tempLowF = Math.round((weatherData.main.temp_min * 9/5) + 32);
    
    document.getElementById('currentTemp').textContent = `${tempF}°`;
    document.getElementById('tempRange').textContent = `H: ${tempHighF}° L: ${tempLowF}°`;
    
    // Humidity
    document.getElementById('humidity').textContent = `💧 ${weatherData.main.humidity}%`;
    
    // Night section
    if (weatherData.sys && weatherData.sys.sunset) {
        const timezoneOffset = weatherData.timezone || 0;
        const sunsetTime = formatTime(weatherData.sys.sunset, timezoneOffset);
        document.getElementById('sunset').textContent = `🌇 ${sunsetTime}`;
    }
    
    // Moon phase
    document.getElementById('moonPhase').textContent = `${moonPhase.emoji} ${moonPhase.phase}`;
    
    // Wind info (US units)
    const windMPS = weatherData.wind.speed;
    const windMPH = Math.round(windMPS * 2.237);
    const windDirection = getWindDirection(weatherData.wind.deg);
    document.getElementById('windInfo').textContent = `💨 ${windMPH} mph ${windDirection}`;
    
}

document.addEventListener("DOMContentLoaded", async function(event) {
    console.log("DOM fully loaded and parsed");
    
    // Set up location modal button handlers
    document.getElementById('submitLocation').addEventListener('click', handleUserLocationInput);
    document.getElementById('cancelLocation').addEventListener('click', hideLocationModal);
    document.getElementById('cityInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleUserLocationInput();
        }
    });
    
    // Set up change location button
    document.getElementById('changeLocationBtn').addEventListener('click', function() {
        showLocationModal();
    });
    
    // Check if user has a saved location preference
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
        try {
            const location = JSON.parse(savedLocation);
            console.log('📍 Using saved location:', location.name);
            document.getElementById('location').textContent = '📍 Loading saved location...';
            
            let weatherData = await getWeatherData(location.latitude, location.longitude);
            let moonPhase = getDetailedMoonPhase();
            updateWeatherDisplay(weatherData, moonPhase);
            return;
        } catch (error) {
            console.error('Failed to use saved location:', error.message);
            localStorage.removeItem('userLocation');
        }
    }
    
    try {
        let currentLocation = await getCurrentLocation();
        let weatherData = await getWeatherData(currentLocation.latitude, currentLocation.longitude);
        let moonPhase = getDetailedMoonPhase();
        updateWeatherDisplay(weatherData, moonPhase);
    } catch (error) {
        console.error('Failed to get current location:', error.message);
        
        // Show location input modal instead of using fallback
        document.getElementById('location').textContent = '⚠️ Location Unavailable';
        
        if (error.message.includes('unavailable') || error.message.includes('rate limit')) {
            document.getElementById('description').innerHTML = 
                'Google location API limit exceeded.<br>' +
                'Please enter your location manually.';
        } else if (error.message.includes('denied')) {
            document.getElementById('description').innerHTML = 
                'Location permission denied.<br>' +
                'Please enter your location manually.';
        } else {
            document.getElementById('description').innerHTML = 
                error.message + '<br>Please enter your location manually.';
        }
        
        // Show the location input modal with error message
        showLocationModal(true);
    }
});