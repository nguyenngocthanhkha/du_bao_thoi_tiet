/**
 * Ánh xạ trạng thái thời tiết (weather main) và mã icon sang class CSS nền và icon URL.
 * @param {string} weatherMain - Trạng thái thời tiết chính (ví dụ: 'Clear', 'Rain', 'Clouds').
 * @param {string} iconCode - Mã icon (ví dụ: '01d', '10n').
 * @returns {object} { backgroundClass: string, iconUrl: string }
 */
function getWeatherMapping(weatherMain, iconCode) {
  const isDay = iconCode.endsWith("d");
  let backgroundClass = "weather-default";
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  switch (weatherMain.toLowerCase()) {
    case "clear":
      backgroundClass = isDay ? "weather-sunny" : "weather-night";
      break;

    case "clouds":
      // Sử dụng "sunny" cho mây rải rác nhẹ (02d) hoặc "cloudy" cho mây u ám (04d)
      if (iconCode === "02d" || iconCode === "02n") {
        backgroundClass = isDay ? "weather-sunny" : "weather-night"; // Vẫn sáng/quang nếu mây nhẹ
      } else {
        backgroundClass = "weather-cloudy"; // Mây u ám
      }
      break;

    case "rain":
    case "drizzle":
    case "thunderstorm":
      backgroundClass = "weather-rainy";
      break;

    case "snow":
      backgroundClass = "weather-snowy"; // Cần định nghĩa trong CSS nếu có ảnh tuyết
      break;

    case "mist":
    case "smoke":
    case "haze":
      backgroundClass = "weather-cloudy"; // Sương mù/Mù
      break;

    default:
      backgroundClass = "weather-default";
      break;
  }

  return { backgroundClass, iconUrl };
}

/**
 * Hàm cập nhật Icon và Background cho giao diện.
 * Sử dụng hàm getWeatherMapping để xác định class CSS nền.
 * @param {object} currentWeather - Dữ liệu thời tiết hiện tại (data.current)
 */
function updateBackgroundAndIcon(currentWeather) {
  const mainCondition = currentWeather.weather[0].main;
  const iconCode = currentWeather.weather[0].icon;

  const { backgroundClass, iconUrl } = getWeatherMapping(
    mainCondition,
    iconCode
  );

  console.log(
    "Weather condition:",
    mainCondition,
    "Icon code:",
    iconCode,
    "Background class:",
    backgroundClass
  );

  // 1. Cập nhật Icon (sử dụng icon URL từ PHP)
  const iconEl = document.getElementById("weather-icon");
  if (iconEl) {
    iconEl.src = iconUrl;
    iconEl.alt = currentWeather.weather[0].description;
  }

  // 2. Cập nhật Background
  const appContainer = document.getElementById("app-container");
  if (appContainer) {
    // Xóa tất cả các class nền cũ đã định nghĩa
    appContainer.classList.remove(
      "weather-sunny",
      "weather-rainy",
      "weather-cloudy",
      "weather-night",
      "weather-snowy",
      "weather-default"
    );

    // Thêm class nền mới
    appContainer.classList.add(backgroundClass);
    console.log(
      "Applied background class:",
      backgroundClass,
      "to app-container"
    );
  } else {
    console.error("app-container không tìm thấy!");
  }
}

// ==========================================================
// KẾT THÚC LOGIC CẬP NHẬT BACKGROUND VÀ ICON
// ==========================================================

// ==========================================================
// LOGIC CHUYỂN ĐỔI ĐỘ C / ĐỘ F
// ==========================================================

// Biến lưu trữ đơn vị nhiệt độ hiện tại (mặc định là Celsius)
let currentUnit = "C";

// Biến lưu trữ dữ liệu thời tiết hiện tại
let currentWeatherData = null;

// Hàm chuyển đổi từ Celsius sang Fahrenheit
function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

// Hàm cập nhật hiển thị nhiệt độ khi chuyển đổi đơn vị
function updateTemperatureDisplay() {
  if (!currentWeatherData) return;

  const current = currentWeatherData.current;
  const unitSymbol = currentUnit === "C" ? "°C" : "°F";

  // Cập nhật nhiệt độ hiện tại
  let temp = current.main.temp;
  if (currentUnit === "F") {
    temp = celsiusToFahrenheit(temp);
  }
  const tempElement = document.getElementById("temp");
  if (tempElement) {
    tempElement.textContent = Math.round(temp) + unitSymbol;
  }

  // Cập nhật nhiệt độ dự báo
  const forecastList = document.getElementById("forecast-list");
  if (forecastList) {
    const forecastItems = forecastList.querySelectorAll(".forecast-item");
    
    const daily = {};
    currentWeatherData.forecast.list.forEach((item) => {
      const day = new Date(item.dt * 1000).toLocaleDateString("vi-VN");
      if (!daily[day]) {
        daily[day] = item;
      }
    });

    const dailyArray = Object.values(daily).slice(0, 5);
    forecastItems.forEach((item, index) => {
      if (dailyArray[index]) {
        let forecastTemp = dailyArray[index].main.temp;
        if (currentUnit === "F") {
          forecastTemp = celsiusToFahrenheit(forecastTemp);
        }
        // Cập nhật nhiệt độ trong forecast item (span thứ 3)
        const tempSpan = item.querySelector("span:nth-child(3)");
        if (tempSpan) {
          tempSpan.textContent = Math.round(forecastTemp) + unitSymbol;
        }
      }
    });
  }
}
// ==========================================================
// KẾT THÚC LOGIC CHUYỂN ĐỔI ĐỘ C / ĐỘ F
// ==========================================================

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

  // Event listener cho nút toggle chuyển đổi đơn vị
  const unitToggle = document.getElementById("unit-toggle");
  if (unitToggle) {
    unitToggle.addEventListener("change", (e) => {
      // Nếu checkbox được check thì chuyển sang Fahrenheit, ngược lại là Celsius
      currentUnit = e.target.checked ? "F" : "C";
      updateTemperatureDisplay();
    });
  }
});

// Map tên tiếng Việt sang chuẩn tiếng Anh cho OpenWeather
const cityMap = {
  "hà nội": "Hanoi",
  hn: "Hanoi",
  "thành phố hồ chí minh": "Ho Chi Minh",
  "hồ chí minh": "Ho Chi Minh",
  "sài gòn": "Ho Chi Minh",
  "đà nẵng": "Da Nang",
  "hải phòng": "Hai Phong",
  "cần thơ": "Can Tho",
  "bình định": "Binh Dinh",
  "quy nhơn": "Quy Nhon",
};

// ====== Hàm updateUI ======
function updateUI(data) {
  // Lưu trữ dữ liệu thời tiết hiện tại để sử dụng cho chuyển đổi đơn vị
  currentWeatherData = data;

  // Đồng hồ
  function updateClock() {
    const now = new Date();
    document.getElementById("clock").textContent =
      now.toLocaleTimeString("vi-VN");
  }
  if (!window.clockInterval) {
    window.clockInterval = setInterval(updateClock, 1000);
  }
  updateClock();

  const current = data.current;
  const weather = current.weather[0];

  // >>> BƯỚC QUAN TRỌNG: Gọi hàm cập nhật nền và icon <<<
  // Truyền toàn bộ dữ liệu current từ API
  updateBackgroundAndIcon(current);

  // Debug: Kiểm tra xem dữ liệu có đúng không
  console.log("Current weather data:", current);

  document.getElementById("location-name").textContent = current.name;
  
  // Hiển thị nhiệt độ theo đơn vị hiện tại
  const unitSymbol = currentUnit === "C" ? "°C" : "°F";
  let temp = current.main.temp;
  if (currentUnit === "F") {
    temp = celsiusToFahrenheit(temp);
  }
  document.getElementById("temp").textContent =
    Math.round(temp) + unitSymbol;
  
  document.getElementById("desc").textContent = weather.description;
  document.getElementById("humidity").textContent =
    "Độ ẩm: " + current.main.humidity + "%";
  document.getElementById("wind").textContent =
    "Gió: " + current.wind.speed + " m/s";
  document.getElementById("date").textContent = new Date(
    current.dt * 1000
  ).toLocaleString("vi-VN");

  // 👉 Gợi ý trang phục & Nhắc nhở ngày mai
  document.getElementById("suggestion").textContent = data.suggestion || "—";
  document.getElementById("reminder").textContent = data.reminder || "—";

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

  Object.values(daily)
    .slice(0, 5)
    .forEach((item) => {
      const fIconUrl = `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`;

      // Chuyển đổi nhiệt độ theo đơn vị hiện tại
      let forecastTemp = item.main.temp;
      if (currentUnit === "F") {
        forecastTemp = celsiusToFahrenheit(forecastTemp);
      }

      const el = document.createElement("div");
      el.classList.add("forecast-item");
      el.innerHTML = `
      <span>${new Date(item.dt * 1000).toLocaleDateString("vi-VN")}</span>
      <img src="${fIconUrl}" alt="${item.weather[0].description}">
      <span>${Math.round(forecastTemp)}${unitSymbol}</span>
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

    const res = await fetch(
      `weather.php?city=${encodeURIComponent(normalizedCity)}`
    );
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
