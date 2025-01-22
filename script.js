const weatherInfo = document.getElementById("weatherInfo");
const cityInput = document.getElementById("cityInput");
const suggestions = document.getElementById("suggestions");
const loading = document.getElementById("loading");
const clearInput = document.getElementById("clearInput");
let citiesList = [];
let selectedCity = null;

/**
 * Sets up event listeners for the application.
 */
function setupEventListeners() {
    cityInput.addEventListener("input", handleCityInput);
    clearInput.addEventListener("click", handleClearInput);
    cityInput.addEventListener("input", debounce(handleCityInputDebounced, 250));
    document.addEventListener("click", handleDocumentClick);
    cityInput.addEventListener("keypress", handleCityInputKeyPress);
}

/**
 * Handles city input changes.
 */
function handleCityInput() {
    clearInput.classList.toggle("visible", cityInput.value.length > 0);
    selectedCity = null;
}

/**
 * Handles clear input button clicks.
 */
function handleClearInput() {
    cityInput.value = "";
    clearInput.classList.remove("visible");
    suggestions.classList.remove("active");
    selectedCity = null;
    localStorage.removeItem('selectedCity');
}

/**
 * Handles city input changes with debouncing.
 */
function handleCityInputDebounced(e) {
    const value = e.target.value.toLowerCase();
    if (value.length < 2) {
        suggestions.classList.remove("active");
        return;
    }

    const matchedCities = citiesList
        .filter((city) => city.name.toLowerCase().includes(value))
        .slice(0, 5);

    if (matchedCities.length > 0) {
        suggestions.innerHTML = matchedCities
            .map(
                (city) => `
              <div class="suggestion-item" onclick="selectCity('${city.name}, ${city.country}')">
                  <i class="fas fa-map-marker-alt"></i>
                  ${city.name}, ${city.country}
              </div>
          `
            )
            .join("");
        suggestions.classList.add("active");
    } else {
        suggestions.classList.remove("active");
    }
}

/**
 * Handles document clicks.
 */
function handleDocumentClick(e) {
    if (!suggestions.contains(e.target) && e.target !== cityInput) {
        suggestions.classList.remove("active");
    }
}

/**
 * Handles city input key presses.
 */
function handleCityInputKeyPress(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        if (selectedCity) {
            suggestions.classList.remove("active");
            fetchWeather(selectedCity);
        }
    }
}

/**
 * Debounces a function.
 * @param {function} func - The function to debounce.
 * @param {number} wait - The debounce wait time.
 * @returns {function} - The debounced function.
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Fetches the list of cities.
 */
function fetchCities() {
    fetch(
        "https://raw.githubusercontent.com/lutangar/cities.json/master/cities.json"
    )
        .then((response) => response.json())
        .then((data) => {
            citiesList = data;
        });
}

/**
 * Selects a city.
 * @param {string} cityName - The name of the city to select.
 */
function selectCity(cityName) {
    selectedCity = cityName;
    fetchWeather(cityName);
    cityInput.value = "";
    suggestions.classList.remove("active");
    clearInput.classList.remove("visible");
    localStorage.setItem('selectedCity', cityName);
}

/**
 * Fetches the weather data for a city.
 * @param {string} city - The name of the city to fetch weather data for.
 */
async function fetchWeather(city) {
    loading.classList.add("active");

    const apiKey = "c1d3394887f949c893762526252201";
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=yes`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            weatherInfo.innerHTML = `
                <div class="weather-main">
                    <i class="fas fa-exclamation-circle" style="font-size: 40px; color: #4f46e5; margin-bottom: 12px;"></i>
                    <h3 style="color: #4f46e5; font-size: 18px;">City not found</h3>
                    <p style="color: rgba(255,255,255,0.7); margin-top: 8px;">Please check the city name</p>
                </div>`;
            return;
        }

        const {
            temp_c,
            condition,
            humidity,
            wind_kph,
            feelslike_c,
            pressure_mb,
            vis_km,
            uv,
        } = data.current;
        const { name, country, localtime } = data.location;

        weatherInfo.innerHTML = `
            <div class="weather-main">
                <div class="location">${name}, ${country}</div>
                <div class="date-time" style="color: rgba(255,255,255,0.7); font-size: 14px; font-weight: 400;">
                    Date: <span style="color: #4f46e5;">${localtime.split(" ")[0]}</span> | Time: <span style="color: #4f46e5;">${localtime.split(" ")[1]}</span>
                </div>
                <img class="weather-icon" src="https:${condition.icon}" alt="${condition.text
            }">
                <div>
                    <div class="temperature">${Math.round(temp_c)}°</div>
                    <div class="condition">${condition.text}</div>
                </div>
            </div>
            
            <div class="weather-details">
                <div class="swiper">
                    <div class="swiper-wrapper">
                        <div class="swiper-slide">
                            <div class="detail-card">
                                <i class="fas fa-tint"></i>
                                <div class="detail-value">${humidity}%</div>
                                <div class="detail-label">Humidity</div>
                            </div>
                            <div class="detail-card">
                                <i class="fas fa-wind"></i>
                                <div class="detail-value">${wind_kph}</div>
                                <div class="detail-label">Wind km/h</div>
                            </div>
                            <div class="detail-card">
                                <i class="fas fa-thermometer-half"></i>
                                <div class="detail-value">${Math.round(
                feelslike_c
            )}°</div>
                                <div class="detail-label">Feels Like</div>
                            </div>
                            <div class="detail-card">
                                <i class="fas fa-leaf"></i>
                                <div class="detail-value">${data.current.air_quality.pm2_5.toFixed(
                1
            )}</div>
                                <div class="detail-label">Air Quality</div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="detail-card">
                                <i class="fas fa-compress-alt"></i>
                                <div class="detail-value">${pressure_mb}</div>
                                <div class="detail-label">Pressure mb</div>
                            </div>
                            <div class="detail-card">
                                <i class="fas fa-eye"></i>
                                <div class="detail-value">${vis_km}</div>
                                <div class="detail-label">Visibility km</div>
                            </div>
                            <div class="detail-card">
                                <i class="fas fa-sun"></i>
                                <div class="detail-value">${uv}</div>
                                <div class="detail-label">UV Index</div>
                            </div>
                            <div class="detail-card">
                                <i class="fas fa-cloud"></i>
                                <div class="detail-value">${data.current.cloud
            }%</div>
                                <div class="detail-label">Cloud Cover</div>
                            </div>
                        </div>
                    </div>
                    <div class="swiper-pagination"></div>
                </div>
            </div>`;

        new Swiper(".swiper", {
            pagination: {
                el: ".swiper-pagination",
            },
        });
    } catch (error) {
        weatherInfo.innerHTML = `
            <div class="weather-main">
                <i class="fas fa-exclamation-triangle" style="font-size: 40px; color: #4f46e5; margin-bottom: 12px;"></i>
                <h3 style="color: #4f46e5; font-size: 18px;">Error</h3>
                <p style="color: rgba(255,255,255,0.7); margin-top: 8px;">Check Your Network</p>
                <p style="color: rgba(255,255,255,0.7); margin-top: 8px;">Unable to fetch weather data</p>
            </div>`;
    } finally {
        loading.classList.remove("active");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    fetchCities();
    const selectedCity = localStorage.getItem('selectedCity');
    fetchWeather(selectedCity ? selectedCity : "London");
    window.addEventListener('resize', handleResize);
});

