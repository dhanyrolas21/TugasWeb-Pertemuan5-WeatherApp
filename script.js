// =====================================================
// Konfigurasi
// =====================================================
// API_KEY diambil dari config.js (file terpisah, TIDAK di-commit ke Git —
// lihat .gitignore). Ini supaya key tidak ikut ter-push ke repo public.
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const HISTORY_KEY = "langit_search_history";
const MAX_HISTORY = 6;
const DEFAULT_CITY = "Medan";

// =====================================================
// State (pakai const/let, bukan var — ES6+)
// =====================================================
let currentUnit = "metric"; // "metric" = °C, "imperial" = °F
let lastCity = null;

// =====================================================
// Referensi elemen DOM
// =====================================================
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const unitSwitch = document.getElementById("unitSwitch");
const labelCelsius = document.getElementById("labelCelsius");
const labelFahrenheit = document.getElementById("labelFahrenheit");

const statusArea = document.getElementById("statusArea");
const statusBox = document.getElementById("statusBox");

const weatherCard = document.getElementById("weatherCard");
const emptyState = document.getElementById("emptyState");

const cityName = document.getElementById("cityName");
const dateTime = document.getElementById("dateTime");
const weatherIcon = document.getElementById("weatherIcon");
const temperature = document.getElementById("temperature");
const unitLabel = document.getElementById("unitLabel");
const description = document.getElementById("description");
const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const forecastRow = document.getElementById("forecastRow");

const locationMap = document.getElementById("locationMap");
const openInMaps = document.getElementById("openInMaps");
const qiCity = document.getElementById("qiCity");
const qiCountry = document.getElementById("qiCountry");
const qiCoords = document.getElementById("qiCoords");
const qiTimezone = document.getElementById("qiTimezone");
const qiSunrise = document.getElementById("qiSunrise");
const qiSunset = document.getElementById("qiSunset");
const qiUpdated = document.getElementById("qiUpdated");

const historyRow = document.getElementById("historyRow");
const historyChips = document.getElementById("historyChips");
const clearHistoryBtn = document.getElementById("clearHistory");

// =====================================================
// Util kecil (arrow functions + template literals)
// =====================================================
const iconUrl = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

const formatTemp = (value) => `${Math.round(value)}°`;

const unitSymbol = () => (currentUnit === "metric" ? "°C" : "°F");

const windSpeedLabel = (speed) =>
  currentUnit === "metric" ? `${speed.toFixed(1)} m/s` : `${speed.toFixed(1)} mph`;

const formatDate = (date) =>
  date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

// Peta kondisi cuaca -> tema latar (dipakai untuk mengganti "mood" halaman)
const moodFromWeather = (main, isNight) => {
  if (isNight) return "night";
  const key = main.toLowerCase();
  if (key === "clear") return "clear";
  if (key === "clouds") return "clouds";
  if (key === "rain" || key === "drizzle") return "rain";
  if (key === "thunderstorm") return "thunderstorm";
  if (key === "snow") return "snow";
  if (key === "mist" || key === "haze" || key === "fog") return "mist";
  return "default";
};

// Data cuaca (dt, sunrise, sunset) datang dalam UTC + offset zona waktu kota
// (detik) — digabung supaya bisa ditampilkan sebagai jam lokal kota tsb.
const cityLocalDate = (unixSeconds, tzOffsetSeconds) =>
  new Date((unixSeconds + tzOffsetSeconds) * 1000);

// timeZone: "UTC" dipakai supaya browser tidak menggeser lagi jam yang
// sudah kita hitung manual di atas.
const formatClock = (date) =>
  date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

const formatFullDateTime = (date) =>
  date.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });

const formatUtcOffset = (tzOffsetSeconds) => {
  const sign = tzOffsetSeconds >= 0 ? "+" : "-";
  const abs = Math.abs(tzOffsetSeconds);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  return `UTC${sign}${hours}${minutes ? ":" + String(minutes).padStart(2, "0") : ""}`;
};

const countryName = (code) => {
  try {
    return new Intl.DisplayNames(["id"], { type: "region" }).of(code) || code;
  } catch (err) {
    return code;
  }
};


const showLoading = () => {
  statusArea.hidden = false;
  statusBox.className = "status__box is-loading";
  statusBox.innerHTML = `<span class="spinner" aria-hidden="true"></span> Mengambil data cuaca...`;
};

const showError = (message) => {
  statusArea.hidden = false;
  statusBox.className = "status__box is-error";
  statusBox.textContent = message;
};

const hideStatus = () => {
  statusArea.hidden = true;
  statusBox.textContent = "";
};

// =====================================================
// Riwayat pencarian — BONUS (LocalStorage)
// =====================================================
const getHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
};

const saveToHistory = (city) => {
  const existing = getHistory().filter(
    (item) => item.toLowerCase() !== city.toLowerCase()
  );
  const updated = [city, ...existing].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  renderHistory();
};

const renderHistory = () => {
  const history = getHistory();

  if (history.length === 0) {
    historyRow.hidden = true;
    return;
  }

  historyRow.hidden = false;
  // .map() dipakai untuk membangun elemen chip dari array riwayat
  historyChips.innerHTML = history
    .map((city) => `<button type="button" class="history__chip" data-city="${city}">${city}</button>`)
    .join("");
};

historyChips.addEventListener("click", (event) => {
  const chip = event.target.closest(".history__chip");
  if (!chip) return;
  cityInput.value = chip.dataset.city;
  handleSearch(chip.dataset.city);
});

clearHistoryBtn.addEventListener("click", () => {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
});

// =====================================================
// Prakiraan 5 hari — BONUS
// API forecast mengembalikan data tiap 3 jam (40 entri / 5 hari).
// Data ini dikelompokkan per tanggal memakai reduce(), lalu
// tiap kelompok diringkas jadi satu kartu harian memakai map().
// =====================================================
const groupForecastByDay = (list) => {
  const today = new Date().toISOString().split("T")[0];

  const grouped = list.reduce((acc, item) => {
    const date = item.dt_txt.split(" ")[0];
    if (date === today) return acc; // lewati sisa hari ini, mulai dari besok
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return Object.entries(grouped)
    .slice(0, 5)
    .map(([date, items]) => {
      const temps = items.map((item) => item.main.temp);
      const maxTemp = Math.max(...temps);
      const minTemp = Math.min(...temps);
      const midday =
        items.find((item) => item.dt_txt.includes("12:00:00")) ||
        items[Math.floor(items.length / 2)];

      return {
        date: new Date(date),
        maxTemp,
        minTemp,
        icon: midday.weather[0].icon,
        description: midday.weather[0].description,
      };
    });
};

const renderForecast = (days) => {
  forecastRow.innerHTML = days
    .map((day) => {
      const label = day.date.toLocaleDateString("id-ID", { weekday: "short" });
      return `
        <div class="forecast__card">
          <p class="forecast__day">${label}</p>
          <img class="forecast__icon" src="${iconUrl(day.icon)}" alt="${day.description}">
          <p class="forecast__range">
            ${formatTemp(day.maxTemp)} <span class="low">${formatTemp(day.minTemp)}</span>
          </p>
        </div>
      `;
    })
    .join("");
};

// =====================================================
// Render cuaca saat ini
// =====================================================
const renderCurrentWeather = (data) => {
  const { name, main, weather, wind: windData, dt, timezone } = data;
  const condition = weather[0];

  const localTime = new Date((dt + timezone) * 1000);
  const hourUTC = localTime.getUTCHours();
  const isNight = hourUTC < 6 || hourUTC >= 18;

  document.body.dataset.mood = moodFromWeather(condition.main, isNight);

  cityName.textContent = `${name}, ${data.sys.country}`;
  dateTime.textContent = formatDate(new Date());

  weatherIcon.src = iconUrl(condition.icon);
  weatherIcon.alt = condition.description;

  temperature.textContent = formatTemp(main.temp);
  unitLabel.textContent = unitSymbol();
  description.textContent = condition.description;

  feelsLike.textContent = formatTemp(main.feels_like);
  humidity.textContent = `${main.humidity}%`;
  wind.textContent = windSpeedLabel(windData.speed);

  weatherCard.hidden = false;
  emptyState.hidden = true;
};

// =====================================================
// Peta lokasi & info singkat — dari data yang sama, tidak perlu request baru
// =====================================================
const renderLocationInfo = (data) => {
  const { coord, sys, timezone, dt } = data;
  const mapsQuery = `${coord.lat},${coord.lon}`;

  locationMap.src = `https://www.google.com/maps?q=${mapsQuery}&z=12&output=embed`;
  openInMaps.href = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  qiCity.textContent = data.name;
  qiCountry.textContent = countryName(sys.country);
  qiCoords.textContent = `${coord.lat.toFixed(4)}, ${coord.lon.toFixed(4)}`;
  qiTimezone.textContent = formatUtcOffset(timezone);
  qiSunrise.textContent = formatClock(cityLocalDate(sys.sunrise, timezone));
  qiSunset.textContent = formatClock(cityLocalDate(sys.sunset, timezone));
  qiUpdated.textContent = `${formatFullDateTime(cityLocalDate(dt, timezone))} ${formatUtcOffset(timezone)}`;
};

// =====================================================
// Fetch ke OpenWeatherMap (async/await + Fetch API)
// =====================================================
const fetchWeatherData = async (endpoint, city) => {
  const url = `${BASE_URL}/${endpoint}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}&lang=id`;
  const response = await fetch(url);

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (!response.ok) {
    throw new Error("API_ERROR");
  }

  return response.json();
};

const handleSearch = async (cityRaw) => {
  const city = cityRaw.trim();
  if (!city) return;

  if (typeof API_KEY === "undefined" || !API_KEY) {
    showError("API key belum diisi. Salin config.example.js jadi config.js, lalu isi API_KEY dengan key dari OpenWeatherMap.");
    return;
  }

  showLoading();
  weatherCard.hidden = true;

  try {
    const [current, forecast] = await Promise.all([
      fetchWeatherData("weather", city),
      fetchWeatherData("forecast", city),
    ]);

    hideStatus();
    renderCurrentWeather(current);
    renderForecast(groupForecastByDay(forecast.list));
    renderLocationInfo(current);

    lastCity = city;
    saveToHistory(current.name);
  } catch (error) {
    weatherCard.hidden = true;

    if (error.message === "NOT_FOUND") {
      showError(`Kota "${city}" tidak ditemukan. Coba periksa ejaannya.`);
    } else if (error instanceof TypeError) {
      // fetch melempar TypeError saat tidak ada koneksi / network error
      showError("Tidak bisa terhubung ke server. Periksa koneksi internet Anda.");
    } else {
      showError("Terjadi kesalahan saat mengambil data cuaca. Silakan coba lagi.");
    }
  }
};

// =====================================================
// Event listeners
// =====================================================
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleSearch(cityInput.value);
});

unitSwitch.addEventListener("click", () => {
  const isNowFahrenheit = unitSwitch.getAttribute("aria-checked") !== "true";
  currentUnit = isNowFahrenheit ? "imperial" : "metric";

  unitSwitch.setAttribute("aria-checked", String(isNowFahrenheit));
  unitSwitch.setAttribute(
    "aria-label",
    isNowFahrenheit ? "Ganti satuan suhu ke Celsius" : "Ganti satuan suhu ke Fahrenheit"
  );
  labelCelsius.classList.toggle("is-active", !isNowFahrenheit);
  labelFahrenheit.classList.toggle("is-active", isNowFahrenheit);

  handleSearch(lastCity || DEFAULT_CITY);
});

// =====================================================
// Inisialisasi — dashboard langsung tampilkan kota default (Medan),
// tapi kolom pencarian dibiarkan kosong supaya user bisa langsung ketik
// =====================================================
renderHistory();
handleSearch(DEFAULT_CITY);