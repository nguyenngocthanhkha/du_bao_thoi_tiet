document.addEventListener("DOMContentLoaded", () => {
  // Mặc định hiển thị thời tiết Hà Nội khi trang được tải
  fetchWeather("Hanoi");

  document.getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const city = document.getElementById("city-input").value.trim();
    if (city) {
      fetchWeather(city);
    }
  });

  document.getElementById("geo-btn").addEventListener("click", () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          alert("Không thể lấy vị trí hiện tại của bạn: " + error.message);
          console.error("Geolocation error:", error);
        }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ tính năng định vị.");
    }
  });
});

// Hàm cập nhật giao diện
function updateUI(data) {
  function updateClock() {
    const now = new Date();
    document.getElementById("clock").textContent =
      now.toLocaleTimeString("vi-VN");
  }
  if (!window.clockInterval) {
    window.clockInterval = setInterval(updateClock, 1000);
  }
  updateClock();

  document.getElementById("location-name").textContent = data.current.name;
  document.getElementById("temp").textContent =
    Math.round(data.current.main.temp) + "°C";
  document.getElementById("desc").textContent =
    data.current.weather[0].description;
  document.getElementById("humidity").textContent =
    "Độ ẩm: " + data.current.main.humidity + "%";
  document.getElementById("wind").textContent =
    "Gió: " + data.current.wind.speed + " m/s";
  document.getElementById("date").textContent = new Date(
    data.current.dt * 1000
  ).toLocaleString("vi-VN");

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
      const el = document.createElement("div");
      el.classList.add("forecast-item");
      el.innerHTML = `
            <span>${new Date(item.dt * 1000).toLocaleDateString("vi-VN")}</span>
            <span>${Math.round(item.main.temp)}°C</span>
            <span>${item.weather[0].description}</span>
        `;
      forecastList.appendChild(el);
    });
}

// Hàm hiển thị lỗi
function displayError(message) {
  document.getElementById("location-name").textContent = "Lỗi tải dữ liệu";
  document.getElementById("temp").textContent = "";
  document.getElementById("desc").textContent = message;
  document.getElementById("humidity").textContent = "";
  document.getElementById("wind").textContent = "";
  document.getElementById("date").textContent = "";
  document.getElementById("forecast-list").innerHTML = "";
}

// Hàm lấy thời tiết theo tên thành phố
async function fetchWeather(city) {
  try {
    const res = await fetch(`weather.php?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error("Lỗi kết nối server");
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    updateUI(data);
  } catch (err) {
    console.error("Lỗi:", err.message);
    displayError(err.message);
  }
}

// Hàm lấy thời tiết theo tọa độ
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
