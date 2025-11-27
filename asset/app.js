document.addEventListener("DOMContentLoaded", () => {
  fetchWeather("Hanoi"); // mặc định khi mở trang

  // Tìm kiếm theo tên thành phố
  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const city = document.getElementById("city-input").value.trim();
    if (city) {
      fetchWeather(city);
    }
  });

  // Lấy vị trí hiện tại
  document.getElementById("geo-btn").addEventListener("click", () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          alert("Không thể lấy vị trí hiện tại: " + error.message);
          console.error("Geolocation error:", error);
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ định vị.");
    }
  });
});

// Map tên tiếng Việt sang chuẩn tiếng Anh cho OpenWeather
const cityMap = {
  "hà nội": "Hanoi",
  "hn": "Hanoi",
  "thành phố hồ chí minh": "Ho Chi Minh",
  "hồ chí minh": "Ho Chi Minh",
  "sài gòn": "Ho Chi Minh",
  "đà nẵng": "Da Nang",
  "hải phòng": "Hai Phong",
  "cần thơ": "Can Tho",
  "bình định": "Binh Dinh",
};

// Cập nhật giao diện
function updateUI(data) {
  // Đồng hồ
  function updateClock() {
    const now = new Date();
    document.getElementById("clock").textContent = now.toLocaleTimeString("vi-VN");
  }
  if (!window.clockInterval) {
    window.clockInterval = setInterval(updateClock, 1000);
  }
  updateClock();

  const current = data.current;
  const weather = current.weather[0];

  document.getElementById("location-name").textContent = current.name;
  document.getElementById("temp").textContent = Math.round(current.main.temp) + "°C";
  document.getElementById("desc").textContent = weather.description;
  document.getElementById("humidity").textContent = "Độ ẩm: " + current.main.humidity + "%";
  document.getElementById("wind").textContent = "Gió: " + current.wind.speed + " m/s";
  document.getElementById("date").textContent = new Date(current.dt * 1000).toLocaleString("vi-VN");

  // Icon hiện tại
  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
  const iconEl = document.getElementById("weather-icon");
  if (iconEl) {
    iconEl.src = iconUrl;
    iconEl.alt = weather.description;
  }

  // Forecast 5 ngày
  const forecastList = document.getElementById("forecast-list");
  forecastList.innerHTML = "";

  const daily = {};
  data.forecast.list.forEach((item) => {
    const day = new Date(item.dt * 1000).toLocaleDateString("vi-VN");
    if (!daily[day]) {
      daily[day] = item;
    }
  });

  Object.values(daily).slice(0, 5).forEach((item) => {
    const fIconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

    const el = document.createElement("div");
    el.classList.add("forecast-item");
    el.innerHTML = `
      <span>${new Date(item.dt * 1000).toLocaleDateString("vi-VN")}</span>
      <img src="${fIconUrl}" alt="${item.weather[0].description}">
      <span>${Math.round(item.main.temp)}°C</span>
      <span>${item.weather[0].description}</span>
    `;
    forecastList.appendChild(el);
  });
}

// Hiển thị lỗi
function displayError(message) {
  document.getElementById("location-name").textContent = "Lỗi tải dữ liệu";
  document.getElementById("temp").textContent = "";
  document.getElementById("desc").textContent = message;
  document.getElementById("humidity").textContent = "";
  document.getElementById("wind").textContent = "";
  document.getElementById("date").textContent = "";
  document.getElementById("forecast-list").innerHTML = "";

const unitToggle = document.getElementById("unit-toggle");

// Hàm fetch dữ liệu thời tiết
async function fetchWeather(city) {
  try {
    let normalizedCity = city.trim();
    const key = normalizedCity.toLowerCase();
    if (cityMap[key]) {
      normalizedCity = cityMap[key];
    }

    const res = await fetch(`weather.php?city=${encodeURIComponent(normalizedCity)}`);
    if (!res.ok) throw new Error("Lỗi kết nối server");
    const data = await res.json();

    if (data.cod !== 200) {
      locationName.textContent = "Không tìm thấy thành phố!";
      return;
    }

    renderCurrentWeather(data);

    // gọi forecast
    fetchForecast(city);

  } catch (err) {
    console.error("Lỗi fetch:", err);
  }
}

// Hàm fetch dự báo
async function fetchForecast(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=vi`;
    const res = await fetch(url);
    const data = await res.json();

    forecastList.innerHTML = "";

    // lọc lấy 1 mốc giờ mỗi ngày (ví dụ 12:00)
    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    daily.forEach(day => {
      renderForecast(day);
    });

  } catch (err) {
    console.error("Lỗi forecast:", err);
  }
}

// Render thời tiết hiện tại
function renderCurrentWeather(data) {
  const city = data.name;
  const tempC = data.main.temp;
  const tempF = tempC * 9/5 + 32;

  locationName.textContent = city;
  descEl.textContent = data.weather[0].description;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  // gán dataset
  tempEl.dataset.celsius = tempC;
  tempEl.dataset.fahrenheit = tempF;

  tempEl.textContent = unitToggle.checked 
    ? Math.round(tempF) + "°F"
    : Math.round(tempC) + "°C";

  feelsEl.textContent = "Cảm giác: " + Math.round(data.main.feels_like) + "°C";
  humidityEl.textContent = "Độ ẩm: " + data.main.humidity + "%";
  windEl.textContent = "Gió: " + data.wind.speed + " m/s";
}

// Render dự báo
function renderForecast(day) {
  const tempC = day.main.temp;
  const tempF = tempC * 9/5 + 32;

  const el = document.createElement("div");
  el.classList.add("forecast-item");

  el.innerHTML = `
    <div>${new Date(day.dt * 1000).toLocaleDateString("vi-VN", { weekday: "short" })}</div>
    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="">
    <div class="forecast-temp" 
         data-celsius="${tempC}" 
         data-fahrenheit="${tempF}">
         ${unitToggle.checked ? Math.round(tempF) + "°F" : Math.round(tempC) + "°C"}
    </div>
  `;

  forecastList.appendChild(el);
}

// Lắng nghe form search
searchForm.addEventListener("submit", e => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
  }
});

// Toggle °C/°F
if (unitToggle) {
  unitToggle.addEventListener("change", () => {
    const useF = unitToggle.checked;

    // nhiệt độ hiện tại
    if (tempEl.dataset.celsius && tempEl.dataset.fahrenheit) {
      tempEl.textContent = useF
        ? Math.round(tempEl.dataset.fahrenheit) + "°F"
        : Math.round(tempEl.dataset.celsius) + "°C";
    }

    // forecast
    document.querySelectorAll(".forecast-temp").forEach(el => {
      el.textContent = useF
        ? Math.round(el.dataset.fahrenheit) + "°F"
        : Math.round(el.dataset.celsius) + "°C";
    });
  });
}

// Load mặc định
fetchWeather("Hanoi")
