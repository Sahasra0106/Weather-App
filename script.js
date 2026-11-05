
// 1. Get HTML Elements

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");
const loading = document.getElementById("loading");

const forecastContainer =
    document.getElementById("forecastContainer");


// 2. Weather Description and Icons

function getWeatherDetails(code) {

    switch (code) {

        case 0:
            return { text: "Clear Sky", icon: "☀️" };

        case 1:
            return { text: "Mainly Clear", icon: "🌤️" };

        case 2:
            return { text: "Partly Cloudy", icon: "⛅" };

        case 3:
            return { text: "Overcast", icon: "☁️" };

        case 45:
        case 48:
            return { text: "Foggy", icon: "🌫️" };

        case 51:
        case 53:
        case 55:
            return { text: "Drizzle", icon: "🌦️" };

        case 61:
        case 63:
        case 65:
            return { text: "Rain", icon: "🌧️" };

        case 71:
        case 73:
        case 75:
            return { text: "Snow", icon: "❄️" };

        case 80:
        case 81:
        case 82:
            return { text: "Rain Showers", icon: "🌦️" };

        case 95:
        case 96:
        case 99:
            return { text: "Thunderstorm", icon: "⛈️" };

        default:
            return { text: "Weather Unavailable", icon: "🌍" };
    }
}


// 3. Display Current Weather

function displayWeather(data, place) {

    const current = data.current;

    const weather = getWeatherDetails(current.weather_code);

    cityName.textContent = place;

    temperature.textContent =
        current.temperature_2m + " °C";

    description.textContent = weather.text;

    weatherIcon.textContent = weather.icon;

    humidity.textContent =
        current.relative_humidity_2m;

    wind.textContent =
        current.wind_speed_10m;

    // Display 5-day forecast
    displayForecast(data.daily);
}


// 4. Display 5-Day Forecast

function displayForecast(dailyData) {

    forecastContainer.innerHTML = "";

    for (let i = 0; i < dailyData.time.length; i++) {

        const date = new Date(
            dailyData.time[i] + "T00:00:00"
        );

        const day = date.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const weather =
            getWeatherDetails(dailyData.weather_code[i]);

        const maxTemp =
            dailyData.temperature_2m_max[i];

        const minTemp =
            dailyData.temperature_2m_min[i];

        const forecastCard = document.createElement("div");

        forecastCard.className = "forecast-card";

        forecastCard.innerHTML = `
            <h3>${day}</h3>
            <p class="forecast-icon">${weather.icon}</p>
            <p>${weather.text}</p>
            <p class="forecast-temp">
                ${maxTemp}°C / ${minTemp}°C
            </p>
        `;

        forecastContainer.appendChild(forecastCard);
    }
}


// 5. Fetch Weather Using Coordinates

async function fetchWeather(latitude, longitude) {

    const weatherURL =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`;

    const response = await fetch(weatherURL);

    if (!response.ok) {
        throw new Error("Unable to fetch weather data");
    }

    const data = await response.json();

    return data;
}


// 6. Search Weather by City

async function getWeather() {

    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name");
        return;
    }

    loading.style.display = "block";

    try {

        let cityName = city;

        if (cityName.toLowerCase() === "samalkota") {
            cityName = "Samalkot";
        }

        // Get city coordinates

        const geoURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en&format=json`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to find city");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found. Please try another city.");
            return;
        }

        const location = geoData.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        // Fetch weather data

        const weatherData =
            await fetchWeather(latitude, longitude);

        const place =
            location.name + ", " + location.country;

        // Display weather

        displayWeather(weatherData, place);

    } catch (error) {

        console.error("Error:", error);

        alert("Unable to fetch weather. Please try again.");

    } finally {

        loading.style.display = "none";
    }
}


// 7. Current GPS Location Weather

function getCurrentLocationWeather() {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    loading.style.display = "block";

    navigator.geolocation.getCurrentPosition(

        async function (position) {

            try {

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                console.log("Latitude:", latitude);
                console.log("Longitude:", longitude);

                const weatherData =
                    await fetchWeather(latitude, longitude);

                displayWeather(
                    weatherData,
                    "Your Current Location"
                );

            } catch (error) {

                console.error("GPS Weather Error:", error);

                alert("Unable to fetch weather for your location.");

            } finally {

                loading.style.display = "none";
            }
        },

        function (error) {

            loading.style.display = "none";

            console.error("Location Error:", error);

            alert("Unable to access your location. Please allow location permission.");
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}


// 8. Search Button Event

searchBtn.addEventListener("click", getWeather);


// 9. Enter Key Event

cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        getWeather();
    }
});


// 10. My Location Button Event

locationBtn.addEventListener("click", getCurrentLocationWeather);
