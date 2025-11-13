// API key (thay bằng key của bạn)
const API_KEY = "7e1a92020fb10446446cb82105d49457";

let searchForm, cityInput, forecastList, locationName, tempEl, descEl;
let weatherIcon, feelsEl, humidityEl, windEl, dateEl, sunEl, unitToggle;
let weatherChart = null;

// Đảm bảo DOM đã sẵn sàng
function initElements() {
  searchForm = document.getElementById("search-form");
  cityInput = document.getElementById("city-input");
  forecastList = document.getElementById("forecast-list");
  locationName = document.getElementById("location-name");
  tempEl = document.getElementById("temp");
  descEl = document.getElementById("desc");
  weatherIcon = document.getElementById("weather-icon");
  feelsEl = document.getElementById("feels");
  humidityEl = document.getElementById("humidity");
  windEl = document.getElementById("wind");
  dateEl = document.getElementById("date");
  sunEl = document.getElementById("sun");
  unitToggle = document.getElementById("unit-toggle");
}

async function fetchWeather(city) {
  try {
    // Ưu tiên gọi qua server để ổn định hơn và lấy thêm dữ liệu gợi ý/biểu đồ
    const res = await fetch(`weather.php?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error("Kết nối server thất bại");
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Hiện tại
    if (data.current) renderCurrentWeather(data.current);

    // Dự báo 5 ngày (lọc 12:00)
    if (forecastList) {
      forecastList.innerHTML = "";
      if (data.forecast && Array.isArray(data.forecast.list)) {
        const daily = data.forecast.list.filter(item => item.dt_txt && item.dt_txt.includes("12:00:00"));
        daily.forEach(day => renderForecast(day));
      }
    }

    // Gợi ý & nhắc nhở
    const sEl = document.getElementById("suggestion");
    const rEl = document.getElementById("reminder");
    if (sEl) sEl.textContent = "Gợi ý trang phục: " + (data.suggestion || "—");
    if (rEl) rEl.textContent = "Nhắc nhở: " + (data.reminder || "—");

    // Biểu đồ theo giờ
    if (Array.isArray(data.hourly) && data.hourly.length) {
      updateHourlyChart(
        data.hourly.map(h => h.time),
        data.hourly.map(h => h.temp)
      );
    }
  } catch (err) {
    console.error("Lỗi fetch:", err);
    if (locationName) locationName.textContent = "Không tải được dữ liệu";
    if (descEl) descEl.textContent = err.message || "Lỗi không xác định";
  }
}

// Không cần fetchForecast riêng khi đã dùng server tổng hợp

function renderCurrentWeather(data) {
  if (!data || !data.main || !data.weather || !data.weather[0]) return;
  
  const city = data.name || "—";
  const tempC = data.main.temp;
  const tempF = tempC * 9/5 + 32;

  if (locationName) locationName.textContent = city;
  if (descEl) descEl.textContent = data.weather[0].description || "—";
  if (weatherIcon) {
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIcon.alt = data.weather[0].description || "";
  }

  if (tempEl) {
    tempEl.dataset.celsius = tempC;
    tempEl.dataset.fahrenheit = tempF;
    tempEl.textContent = unitToggle && unitToggle.checked
      ? Math.round(tempF) + "°F"
      : Math.round(tempC) + "°C";
  }

  if (feelsEl) feelsEl.textContent = "Cảm giác: " + Math.round(data.main.feels_like) + "°C";
  if (humidityEl) humidityEl.textContent = "Độ ẩm: " + data.main.humidity + "%";
  if (windEl) windEl.textContent = "Gió: " + (data.wind?.speed || 0) + " m/s";

  if (dateEl) {
    dateEl.textContent = new Date(data.dt * 1000).toLocaleString("vi-VN");
  }
  if (sunEl && data.sys) {
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString("vi-VN");
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString("vi-VN");
    sunEl.textContent = `Mặt trời mọc/lặn: ${sunrise} / ${sunset}`;
  }
}

function renderForecast(day) {
  if (!day || !day.main || !day.weather || !forecastList) return;
  
  const tempC = day.main.temp;
  const tempF = tempC * 9/5 + 32;

  const el = document.createElement("div");
  el.classList.add("forecast-item");
  el.innerHTML = `
    <div>${new Date(day.dt * 1000).toLocaleDateString("vi-VN", { weekday: "short" })}</div>
    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description || ""}">
    <div class="forecast-temp" 
         data-celsius="${tempC}" 
         data-fahrenheit="${tempF}">
         ${unitToggle && unitToggle.checked ? Math.round(tempF) + "°F" : Math.round(tempC) + "°C"}
    </div>
  `;
  forecastList.appendChild(el);
}

function updateHourlyChart(labels, temps) {
  const canvas = document.getElementById("weatherChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (weatherChart) {
    weatherChart.data.labels = labels;
    weatherChart.data.datasets[0].data = temps;
    weatherChart.update();
    return;
  }

  weatherChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Nhiệt độ (°C)",
        data: temps,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "rgba(75,192,192,1)"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true, labels: { font: { size: 14 } } }
      },
      scales: {
        x: { title: { display: true, text: "Giờ" } },
        y: { title: { display: true, text: "°C" } }
      }
    }
  });
}

// Khởi tạo khi DOM sẵn sàng
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function init() {
  initElements();

  if (searchForm && cityInput) {
    searchForm.addEventListener("submit", e => {
      e.preventDefault();
      const city = cityInput.value.trim();
      if (city) fetchWeather(city);
    });
  }

  if (unitToggle) {
    unitToggle.addEventListener("change", () => {
      const useF = unitToggle.checked;

      if (tempEl && tempEl.dataset.celsius && tempEl.dataset.fahrenheit) {
        tempEl.textContent = useF
          ? Math.round(tempEl.dataset.fahrenheit) + "°F"
          : Math.round(tempEl.dataset.celsius) + "°C";
      }

      document.querySelectorAll(".forecast-temp").forEach(el => {
        if (el.dataset.celsius && el.dataset.fahrenheit) {
          el.textContent = useF
            ? Math.round(el.dataset.fahrenheit) + "°F"
            : Math.round(el.dataset.celsius) + "°C";
        }
      });
    });
  }

  // Nút "Vị trí của tôi" (luôn Quy Nhơn như yêu cầu)
  const geoBtn = document.getElementById("geo-btn");
  if (geoBtn) {
    geoBtn.addEventListener("click", () => fetchWeather("Quy Nhon"));
  }

  // Load dữ liệu mặc định
  fetchWeather("Hanoi");
}
