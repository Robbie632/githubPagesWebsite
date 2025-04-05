
const weatherInfoDiv = document.getElementById('weather-info');
const locationInput = document.getElementById('location');
const errorMessageDiv = document.getElementById('error-message');
const weatherButton = document.getElementById("weather-button");
weatherButton.addEventListener("click", getWeather);

async function getWeather() {

    const location = locationInput.value.trim();
    if (!location) {
        errorMessageDiv.textContent = 'Please enter a city';
        weatherInfoDiv.textContent = '';
        return;
    }

    errorMessageDiv.textContent = '';
    weatherInfoDiv.textContent = 'Loading weather...';

    // Using Open-Meteo API (no API key required for non-commercial use)
    const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=1`;

    try {
        const geocodingResponse = await fetch(apiUrl);
        const geocodingData = await geocodingResponse.json();

        if (geocodingData.results && geocodingData.results.length > 0) {
            const { latitude, longitude } = geocodingData.results[0];
            const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&forecast_days=1`;

            const weatherResponse = await fetch(weatherApiUrl);
            const weatherData = await weatherResponse.json();

            if (weatherData.current) {
                const temperature = weatherData.current.temperature_2m;
                const weatherCode = weatherData.current.weather_code;
                const weatherDescription = getWeatherDescription(weatherCode);
                const city = geocodingData.results[0].name;
                const country = geocodingData.results[0].country;

                weatherInfoDiv.innerHTML = `
                    <h2>Weather in ${city}, ${country}</h2>
                    <p>Temperature: ${temperature} °C</p>
                    <p>Conditions: ${weatherDescription}</p>
                `;
            } else {
                weatherInfoDiv.textContent = 'Could not retrieve current weather data.';
            }
        } else {
            weatherInfoDiv.textContent = 'Location not found. Please try again.';
        }

    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherInfoDiv.textContent = 'Failed to fetch weather data. Please check your connection.';
    }
}

function getWeatherDescription(weatherCode) {
    // Source: https://open-meteo.com/en/docs#current_weather
    const descriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Slight or moderate thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail'
    };
    return descriptions[weatherCode] || 'Unknown weather condition';
}
