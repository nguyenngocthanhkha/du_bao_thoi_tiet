<?php
?><!doctype html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Weather - Dự báo thời tiết</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <!-- Font Awesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="asset/styles.css">
</head>
<body>
    <header class="app-header">
        <div class="container">
            <h1 class="app-title">Dự báo thời tiết</h1>
            <div class="controls">
                <form method="get" id="search-form" class="search-form" autocomplete="off" action="weather.php">
                    <input id="city-input" name="city" type="text" placeholder="Nhập thành phố (VD: Hanoi, Ho Chi Minh)">
                    <button type="submit" class="btn primary">Tìm</button>
                    <ul id="suggestions" class="suggestions"></ul>
                </form>

                <!-- Chỗ hiển thị kết quả -->
                <div id="result"></div>

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

    <main class="container">
        <section id="current" class="card current-weather" aria-live="polite">
            <div class="current-left">
                <h2 id="location-name">—</h2>
                <div class="current-temp">
                    <i id="weather-icon" class="fa-solid fa-cloud fa-2x"></i>
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

                <!-- 🆕 Gợi ý trang phục -->
                <div id="suggestion" class="suggestion-box">
                    Gợi ý trang phục: —
                </div>

                <!-- 🆕 Nhắc nhở ngày mai -->
                <div id="reminder" class="reminder-box">
                    Nhắc nhở: —
                </div>
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

        <section id="forecast" class="card">
            <h3>3-5 ngày tới</h3>
            <div id="forecast-list" class="forecast-list">
                <!-- Items will be rendered by JS -->
            </div>
        </section>
    </main>

    <footer class="app-footer">
        <div class="container">
            <small>
                Nguồn dữ liệu: API thời tiết. Đây là giao diện mẫu — thêm khóa API trong phần cấu hình để hoạt động thật.
            </small>
        </div>
    </footer>

    <script src="./asset/app.js"></script>
</body>
</html>
