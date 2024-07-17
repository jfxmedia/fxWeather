let debounceTimer;
const suggestionContainer = document.querySelector('.suggestions');
const suggestionCities = document.querySelector('.suggestion-cities');
const favoriteContainer = document.querySelector('.favorites');
const favoriteCitiesContainer = document.querySelector('.favorite-cities');

const debounce = (func, delay) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(func, delay);
};

// Fetch suggestions from geoURL based on city typed into input
const fetchSuggestions = async () => {
  const city = document.getElementById('location').value;
  if (city.length < 3) {
    clearSuggestions();
    return;
  }

  const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=6&language=en&format=json`;

  try {
    const response = await fetch(geoURL);
    const data = await response.json();
    displaySuggestions(data.results);
  } catch (err) {
    console.error('Error when selecting city:', err);
  }
};

const clearSuggestions = () => {
  suggestionCities.innerHTML = ''; // Clear previous suggestions
  suggestionContainer.style.display = "none"; // Hide suggestions container
  favoriteCitiesContainer.style.display = 'none'
};

const displaySuggestions = (results) => {
  suggestionCities.innerHTML = ''; // Clear previous suggestions
  suggestionContainer.style.display = "flex";

  results.forEach(({ latitude, longitude, timezone, name, admin1 }) => {
    const favoriteIcon = document.createElement('span');
    favoriteIcon.classList.add('fa-regular', 'fa-heart');
    favoriteIcon.addEventListener('click', (event) => {
      event.stopPropagation();
      addFavoriteCity(name, admin1, latitude, longitude, timezone);
      favoriteIcon.classList.remove('fa-regular');
      favoriteIcon.classList.add('fa-solid');
    });

    const suggestion = document.createElement('p');
    suggestion.dataset.lat = latitude;
    suggestion.dataset.long = longitude;
    suggestion.dataset.tz = timezone;
    if (`${admin1}` === 'undefined') {
      suggestion.innerHTML = `${name}`;
      } else {
      suggestion.innerHTML = `${name}, ${admin1}`;
      }
    suggestion.appendChild(favoriteIcon);
    suggestion.addEventListener('click', selectCity);

    suggestionCities.appendChild(suggestion);
  });
};

const addFavoriteCity = (city, state, latitude, longitude, timezone) => {
  const cityText = `${city}, ${state}`;

  // Check if city is already in the list before adding it, if true then exit function
  if ([...favoriteCitiesContainer.querySelectorAll('p')].some(p => p.textContent.includes(cityText))) {
    return;
  }

  const favoriteCity = document.createElement('p');
  favoriteCity.textContent = `${state !== undefined ? `${city}, ${state}` : `${city}`}`;
  favoriteCity.dataset.lat = latitude;
  favoriteCity.dataset.long = longitude;
  favoriteCity.dataset.tz = timezone;

  // Add delete icon
  const deleteIcon = document.createElement('span');
  deleteIcon.classList.add('fa-solid', 'fa-xmark');
  deleteIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    removeFavoriteCity(favoriteCity);
  });
  favoriteCity.appendChild(deleteIcon);

  favoriteCity.addEventListener('click', selectCity);

  favoriteCitiesContainer.appendChild(favoriteCity);

  // Save to local storage
  saveToLocalStorage({ city: city, state: state, latitude: latitude, longitude: longitude, timezone: timezone });
};



const removeFavoriteCity = (favoriteCity) => {
  const cityText = favoriteCity.textContent.replace('×', '').trim();
  let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
  favoriteCities = favoriteCities.filter(cityObj => cityObj.city !== cityText);
  localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
  favoriteCity.remove();
};

const selectCity = (event) => {
  const selectedCity = event.target.innerHTML.replace(/<[^>]*>/g, '').trim(); // Remove HTML tags
  const lat = event.target.dataset.lat;
  const long = event.target.dataset.long;
  const tz = event.target.dataset.tz;

  document.querySelector('.city-name').innerHTML = `${selectedCity}`;
  fetchWeather(lat, long, tz);
  mapInit(lat, long, selectedCity);
  clearSuggestions();
};

// Fetch weather data
const fetchWeather = async (lat, long, tz) => {
  const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&timezone=${tz}&current=precipitation&current_weather=true&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&daily=temperature_2m_max,weather_code,sunshine_duration,precipitation_sum,precipitation_probability_max&hourly=temperature_2m,relative_humidity_2m,is_day,precipitation,precipitation_probability,rain,showers,weather_code,cloud_cover,wind_speed_10m`;

  try {
    const response = await fetch(weatherURL);
    const data = await response.json();
    console.log(data); // Log the full API response
    displayWeather(data);
  } catch (err) {
    console.error('Error:', err);
  }
};

const displayWeather = (data) => {
  const icons = {
    0: './images/sunny.svg',
    1: './images/sunny.svg',
    2: './images/partly_cloudy.svg',
    3: './images/overcast.svg',
    45: './images/fog.svg',
    48: './images/fog.svg',
    51: './images/light_rain.svg',
    53: './images/medium_rain.svg',
    55: './images/heavy_rain.svg',
    56: './images/light_rain.svg',
    57: './images/heavy_rain.svg',
    61: './images/light_rain.svg',
    63: './images/medium_rain.svg',
    65: './images/heavy_rain.svg',
    66: './images/light_rain.svg',
    67: './images/_rain_heavy.svg',
    71: './images/light_snow.svg',
    73: './images/medium_snow.svg',
    75: './images/heavy_snow.svg',
    77: './images/heavy_snow.svg',
    80: './images/light_rain.svg',
    81: './images/medium_rain.svg',
    82: './images/heavy_rain.svg',
    85: './images/light_sleet.svg',
    86: './images/heavy_sleet.svg',
    95: './images/heavy_storms.svg',
  };

  // Clear previous week data
  const weekContainer = document.querySelector('.week');
  weekContainer.innerHTML = '';

  // Generate and display daily weather
  if (data.daily && data.daily.temperature_2m_max) {
    data.daily.temperature_2m_max.forEach((tempMax, index) => {
      const precipProb = data.daily.precipitation_probability_max && data.daily.precipitation_probability_max[index] !== undefined ? data.daily.precipitation_probability_max[index] : 0;
      const weatherCode = data.daily.weather_code && data.daily.weather_code[index] !== undefined ? data.daily.weather_code[index] : null;
      const date = data.daily.time && data.daily.time[index] != undefined ? data.daily.time[index] : null;

      const dayElement = document.createElement('div');
      dayElement.classList.add('week-weather');
      dayElement.innerHTML = `<p>${date.replace('2024-', '')}</p>`

      const iconElement = document.createElement('img');
      iconElement.classList.add('week-icon');
      iconElement.src = icons[weatherCode] || './images/partly_cloudy.svg';

      const tempElement = document.createElement('div');
      tempElement.classList.add('day');
      tempElement.innerHTML = `${tempMax}<i>&deg;</i><br>${precipProb}<i style="padding:0 10px" class="fa-solid fa-droplet"></i>`;

      dayElement.appendChild(iconElement);
      dayElement.appendChild(tempElement);

      weekContainer.appendChild(dayElement);

      const weekDayOneTitle = document.querySelector('.week-weather');
      weekDayOneTitle.querySelector('p').textContent = `Today`;
    });
  }

  // Clear previous hourly data
  const hourlyContainer = document.querySelector('.current-weather-hours');
  hourlyContainer.innerHTML = '';

  // Get the current time and the next whole hour
  const currentDate = new Date();
  const currentHour = currentDate.getHours();
  const nextWholeHour = (currentHour + 1) % 24; // Ensure the hour wraps around at 24
  
  // Find the index of the next whole hour in the data
  const nextHourIndex = data.hourly.time.findIndex(time => new Date(time).getHours() === nextWholeHour);


  // Generate and display hourly weather for the next 10 hours
  if (data.hourly && data.hourly.temperature_2m && nextHourIndex !== -1) {
    for (let i = 0; i < 10; i++) {
      const index = nextHourIndex + i;
      if (index < data.hourly.time.length) {
        const hourElement = document.createElement('div');
        hourElement.classList.add('hour-weather');

        const currentRain = document.querySelector('.current-rain');
        const currentRainChance = data.hourly.precipitation_probability && data.hourly.precipitation_probability[0] !== undefined ? data.hourly.precipitation_probability[0] : 0;
        currentRain.innerHTML = `${currentRainChance}<i style="padding:0 10px" class="fa-solid fa-droplet">`;
  

        const hourTime = new Date(data.hourly.time[index]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temp = data.hourly.temperature_2m[index];
        const humidity = data.hourly.relative_humidity_2m[index];

        hourElement.innerHTML = `<p class="hourly-time">${hourTime.replace(':00','')}</p><p class="hourly-temp">${temp}&deg;</p><p class="hourly-rain">${currentRainChance}%</p>`;

        hourlyContainer.appendChild(hourElement);
        }
      }
  }

  // Chances of weather conditions
  let dayCondition = '';
  let rainCondition = '';

  if (data.daily.sunshine_duration && data.daily.precipitation_probability_max){
    if (data.daily.sunshine_duration[0] >= 50000 != 0 && data.daily.precipitation_probability_max[0] <= 50 != 0) {
      dayCondition = 'mostly sunny';
      rainCondition = data.daily.precipitation_probability_max[0]
    } else if (data.daily.sunshine_duration[0] <= 50000 || 0 && data.daily.precipitation_probability_max[0] >= 50 || 0) {
      dayCondition = 'partly cloudy';
      rainCondition = data.daily.precipitation_probability_max[0]
    };
  } else {
    console.log('Data points do not exist')
  }

  if (data.current_weather) {
    const currentIcon = document.querySelector('.current-icon');
    const currentTemp = document.querySelector('.current-temp');
    const currentDescription = document.querySelector('.current-description');

    currentTemp.innerHTML = `${data.current_weather.temperature}&deg;`;
    const currentWeatherCode = data.current_weather.weathercode;
    currentIcon.src = icons[currentWeatherCode] || './images/partly_cloudy.svg';
    currentDescription.textContent = `Today will be ${dayCondition} with a ${rainCondition}% of rain.`;
  }
};


// Open favorite cities list
document.querySelector('.favorite-icon').addEventListener('click', (event) => {
  event.stopPropagation();
  favoriteCitiesContainer.style.display = favoriteCitiesContainer.style.display === 'flex' ? 'none' : 'flex';
  suggestionContainer.style.display = 'none'
});

// Click off suggestions or favorites to close
document.addEventListener('click', (event) => {
  if (!suggestionCities.contains(event.target)) {
    if (suggestionContainer.style.display === 'flex') {
      suggestionContainer.style.display = 'none';
    }}

  if (!favoriteCitiesContainer.contains(event.target)) {
    if (favoriteCitiesContainer.style.display === 'flex') {
      favoriteCitiesContainer.style.display = 'none';
    }}
  
});

// Map Functions
const mapInit = (lat, long, selectedCity) => {
  mapToggle();
  let container = L.DomUtil.get('map');
  if (container != null) {
    container._leaflet_id = null;
  }

  let map = L.map('map').setView([lat, long], 10);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.marker([lat, long]).addTo(map)
    .bindPopup(`${selectedCity}`)
    .openPopup();
};

const mapToggle = () => {
  const map = document.querySelector('.map-container');
  const week = document.querySelector('.week');
  const current = document.querySelector('.current-container');
  if (map.style.display === "none") {
    map.style.display = "block";
  }
  if (current.style.display === "none") {
    current.style.display = "flex";
  }
  if (week.style.display === "none") {
    week.style.display = "flex";
  }
};

// Save to Localstorage for Favorites
const saveToLocalStorage = (cityObj) => {
  let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
  if (!favoriteCities.some(c => c.city === cityObj.city && c.state === cityObj.state)) {
    favoriteCities.push(cityObj);
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
  }
};


// Load from Localstorage of Favorites
const loadFromLocalStorage = () => {
  const favoriteCitiesList = JSON.parse(localStorage.getItem('favoriteCities')) || [];
  favoriteCitiesList.forEach(({ city, state, latitude, longitude, timezone }) => {
    if (!Array.from(favoriteCitiesContainer.querySelectorAll('p')).some(p => p.textContent.includes(`${city}, ${state}`))) {
      addFavoriteCity(city, state, latitude, longitude, timezone);
    }
  });
};

// Event listener to load local storage on DOMContentLoaded
document.addEventListener('DOMContentLoaded', loadFromLocalStorage);

// Event listener for keyup in the location input field
document.getElementById('location').addEventListener('keyup', () => debounce(fetchSuggestions, 300));

