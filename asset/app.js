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

  // Lấy vị trí hiện tại (mặc định là Quy Nhơn)
  document.getElementById("geo-btn").addEventListener("click", () => {
    fetchWeather("Quy Nhon");
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
  "quy nhơn": "Quy Nhon"
};

// ====== Hàm updateUI ======
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

  // Icon hiện tại từ weather.php
  const iconEl = document.getElementById("weather-icon");
  if (iconEl) {
    iconEl.src = data.icon;
    iconEl.alt = weather.description;
  }

  // 👉 Gợi ý trang phục & Nhắc nhở ngày mai
  document.getElementById("suggestion").textContent = data.suggestion || "—";
  document.getElementById("reminder").textContent   = data.reminder || "—";

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

  const iconEl = document.getElementById("weather-icon");
  if (iconEl) iconEl.src = "";
}

// Lấy thời tiết theo tên thành phố
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
    if (data.error) throw new Error(data.error);
    updateUI(data);
  } catch (err) {
    console.error("Lỗi:", err.message);
    displayError(err.message);
  }
}

// Lấy thời tiết theo tọa độ
async function fetchWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(`weather.php?lat=${lat}&lon=${lon}`);
    if (!res.ok) throw new Error("Lỗi kết nối server");
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    updateUI(data);
  } catch (err) {
    console.error("Lỗi:", err.message);
    displayError(err.message);
  }
}
