<?php ?>
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dự báo thời tiết</title>
  <!-- Google Fonts + FontAwesome -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <!-- CSS -->
  <link rel="stylesheet" href="asset/styles.css">
</head>
<body>
  <header class="app-header">
    <div class="container">
      <h1 class="app-title">Dự báo thời tiết</h1>
      <div class="controls">
        <!-- Form tìm kiếm -->
        <form id="search-form" class="search-form" autocomplete="off">
          <input id="city-input" name="city" type="text" placeholder="Nhập thành phố (VD: Hanoi, Ho Chi Minh)">
          <button type="submit" class="btn primary">Tìm</button>
          <ul id="suggestions" class="suggestions"></ul>
        </form>

        <!-- Nút chức năng -->
        <div class="control-actions">
          <button id="geo-btn" class="btn">Vị trí của tôi</button>
          <button id="notify-btn" class="btn">Bật thông báo</button>
          <div class="toggle">
            <input type="checkbox" id="unit-toggle" />
            <label for="unit-toggle" title="Chuyển °C / °F">
              <span>°C</span>
              <span class="thumb"></span>
              <span>°F</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </header>

  <main id="app-container"  class="container">
    <!-- Thời tiết hiện tại -->
    <section id="current" class="card current-weather" aria-live="polite">
      <div class="current-left">
        <h2 id="location-name">—</h2>
        <div class="current-temp">
          <img id="weather-icon" src="" alt="icon thời tiết" class="weather-icon">
          <div>
            <div id="temp" class="temp">—</div>
            <div id="desc" class="desc">—</div>
          </div>
        </div>
        <div class="details">
          <span id="feels">Cảm giác: —</span>
          <span id="humidity">Độ ẩm: —</span>
          <span id="wind">Gió: —</span>
        </div>

        <div id="suggestion" class="suggestion-box">Gợi ý trang phục: —</div>
        <div id="reminder" class="reminder-box">Nhắc nhở: —</div>
      </div>

      <div class="current-right">
        <div class="meta">
          <span id="date">—</span>
          <span id="clock">—</span>
          <span id="sun">Mặt trời mọc/lặn: —</span>
        </div>
        <div id="alerts" class="alerts" hidden>
          <strong>Cảnh báo:</strong>
          <ul id="alerts-list"></ul>
        </div>
      </div>
    </section>

    <!-- Dự báo -->
    <section id="forecast" class="card">
      <h3>3-5 ngày tới</h3>
      <div id="forecast-list" class="forecast-list"></div>
    </section>
  </main>

  <footer class="app-footer">
    <div class="container">
      <small>Nguồn dữ liệu: OpenWeather API — cần có API key để hoạt động thật.</small>
    </div>
  </footer>

<!-- Thêm ngay dưới phần dự báo -->
<section id="hourly-chart" class="card">
  <h3>Biểu đồ thời tiết theo giờ</h3>
  <canvas id="weatherChart" height="120"></canvas>
</section>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  // --- Ví dụ dữ liệu giờ (demo) ---
  const hourlyData = [
    { hour: "06:00", temp: 24 },
    { hour: "09:00", temp: 27 },
    { hour: "12:00", temp: 30 },
    { hour: "15:00", temp: 32 },
    { hour: "18:00", temp: 29 },
    { hour: "21:00", temp: 26 }
  ];

  const ctx = document.getElementById("weatherChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: hourlyData.map(d => d.hour),
      datasets: [{
        label: "Nhiệt độ (°C)",
        data: hourlyData.map(d => d.temp),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.3,
        pointRadius: 5,
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
</script>

<!-- Script -->
<script>
  // --- Gợi ý trang phục dựa trên nhiệt độ ---
  function getClothingSuggestion(tempC) {
    if (tempC <= 10) return "Áo khoác dày, áo len, khăn quàng";
    if (tempC <= 20) return "Áo khoác nhẹ, áo dài tay";
    if (tempC <= 30) return "Áo thun, quần dài/short";
    return "Quần áo nhẹ, mát, đội nón khi ra nắng";
  }

  // --- Nhắc nhở cho ngày mai dựa trên dự báo ---
  function getTomorrowReminder(forecastList) {
    const tomorrow = forecastList[1]; // giả sử mảng forecastList thứ 2 là ngày mai
    if (!tomorrow) return "Không có nhắc nhở đặc biệt.";
    let reminder = "";
    if (tomorrow.temp_max >= 35) reminder += "Uống nhiều nước, tránh nắng. ";
    if (tomorrow.weather.toLowerCase().includes("rain")) reminder += "Mang ô hoặc áo mưa. ";
    if (tomorrow.temp_min <= 10) reminder += "Mang áo ấm. ";
    return reminder || "Không có nhắc nhở đặc biệt.";
  }

  // --- Ví dụ cập nhật sau khi fetch API ---
  const currentTempC = 28; // nhiệt độ hiện tại (°C)
  const forecastList = [
    { temp_min: 27, temp_max: 30, weather: "clear" },
    { temp_min: 26, temp_max: 33, weather: "rain" }, // ngày mai
    { temp_min: 25, temp_max: 32, weather: "clouds" },
  ];

  document.getElementById("suggestion").textContent =
    "Gợi ý trang phục: " + getClothingSuggestion(currentTempC);

  document.getElementById("reminder").textContent =
    "Nhắc nhở: " + getTomorrowReminder(forecastList);

  // --- Sửa nút "Vị trí của tôi" luôn là Quy Nhơn ---
  document.getElementById("geo-btn").addEventListener("click", () => {
    fetchWeather("Quy Nhon"); // gọi hàm fetchWeather trong app.js
  });
</script>

<script src="./asset/app.js"></script>
</body>
</html>
