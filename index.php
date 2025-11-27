<?php ?>
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Dự báo thời tiết</title>

  <!-- Fonts + Icons -->
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

<!-- App content -->
<main id="app-container" class="container">

  <!-- Thời tiết hiện tại -->
  <section id="current" class="card current-weather" aria-live="polite">
    <div class="current-left">
      <h2 id="location-name">—</h2>
      <div class="current-temp">
        <img id="weather-icon" src="" class="weather-icon">
        <div>
          <div id="temp" class="temp">—</div>
          <div id="desc" class="desc">—</div>
        </div>
      </div>

<<<<<<< HEAD
    <!-- Dự báo -->
    <section id="forecast" class="card">
      <h3>3-5 ngày tới</h3>
      <div id="forecast-list" class="forecast-list"></div>
    </section>

    <!-- Biểu đồ thời tiết theo giờ -->
    <section id="hourly-chart" class="card">
      <h3>Biểu đồ thời tiết theo giờ</h3>
      <canvas id="weatherChart" height="120"></canvas>
    </section>
  </main>
=======
      <div class="details">
        <span id="feels">Cảm giác: —</span>
        <span id="humidity">Độ ẩm: —</span>
        <span id="wind">Gió: —</span>
      </div>
>>>>>>> 5fd709939b24bab39b6809c16cda08bf5f5db876

      <div id="suggestion" class="suggestion-box">Gợi ý trang phục: —</div>
      <div id="reminder" class="reminder-box">Nhắc nhở: —</div>
    </div>

<<<<<<< HEAD
<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
=======
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
    <h3>3–5 ngày tới</h3>
    <div id="forecast-list" class="forecast-list"></div>
  </section>
</main>

<footer class="app-footer">
  <div class="container">
    <small>Nguồn dữ liệu: OpenWeather API — cần API key.</small>
  </div>
</footer>

<!-- Biểu đồ nhiệt độ -->
<section id="hourly-chart" class="card">
  <h3>Biểu đồ nhiệt độ theo giờ</h3>
  <canvas id="weatherChart" height="120"></canvas>
</section>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
let weatherChart = null;

// ===============================
// LOAD DỮ LIỆU TỪ weather.php

async function loadHourlyWeather(city) {
    const res = await fetch(`weather.php?city=${city}`);
    const data = await res.json();

    if(!data.hourly){
        console.warn("Không có dữ liệu hourly từ server.");
        return;
    }

    updateChart(data.hourly);
}

// ===============================
// VẼ / UPDATE CHART

function updateChart(hourly) {
    const ctx = document.getElementById("weatherChart").getContext("2d");

    if (weatherChart) weatherChart.destroy();

    weatherChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: hourly.map(h => h.time),
            datasets: [{
                label: "Nhiệt độ (°C)",
                data: hourly.map(h => h.temp),
                borderColor: "rgba(75,192,192,1)",
                backgroundColor: "rgba(75,192,192,0.3)",
                filling: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: "rgba(75,192,192,1)"
            }]
        }
    });
}

// ===============================
// LIÊN KẾT VỚI FORM TÌM KIẾM

document.getElementById("search-form").addEventListener("submit", function(e){
    e.preventDefault();
    const city = document.getElementById("city-input").value.trim();
    if(city) {
        loadHourlyWeather(city);
    }
});

// ===============================
// NÚT “Vị trí của tôi” => Mặc định Quy Nhơn

document.getElementById("geo-btn").addEventListener("click", () => {
    loadHourlyWeather("Quy Nhon");
});


// AUTO UPDATE REAL-TIME
// Cập nhật mỗi 5 phút

setInterval(() => {
    const city = document.getElementById("location-name").textContent || "Quy Nhon";
    loadHourlyWeather(city);
    console.log("Biểu đồ đã cập nhật lúc", new Date().toLocaleTimeString());
}, 300000); // 300.000 ms = 5 phút

// Load mặc định
loadHourlyWeather("Quy Nhon");
</script>
>>>>>>> 5fd709939b24bab39b6809c16cda08bf5f5db876

<script src="./asset/app.js"></script>
</body>
</html>
