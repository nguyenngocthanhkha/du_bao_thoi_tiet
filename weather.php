<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json; charset=utf-8');

// Lấy city từ request (mặc định là Ho Chi Minh)
$city = isset($_GET['city']) ? $_GET['city'] : 'Ha Noi';

// API key của bạn
$apiKey = "7e1a92020fb10446446cb82105d49457"; // thay bằng key thật

// Endpoint OpenWeather
// Kiểm tra và xác định endpoint dựa trên tham số
if (isset($_GET['lat']) && isset($_GET['lon'])) {
    // Lấy dữ liệu theo tọa độ
    $lat = $_GET['lat'];
    $lon = $_GET['lon'];
    $urlCurrent = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&appid={$apiKey}&lang=vi&units=metric";
    $urlForecast = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$apiKey}&lang=vi&units=metric";
} else {
    // Lấy dữ liệu theo tên thành phố (mặc định là Bình Định)
    $city = isset($_GET['city']) ? $_GET['city'] : 'Binh Dinh';
    $urlCurrent = "https://api.openweathermap.org/data/2.5/weather?q={$city}&appid={$apiKey}&lang=vi&units=metric";
    $urlForecast = "https://api.openweathermap.org/data/2.5/forecast?q={$city}&appid={$apiKey}&lang=vi&units=metric";
}

// Hàm gọi API
function callAPI($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $output = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE); // hàm để lấy mã trạng  thái 

    if ($output === false) {
        return ['error' => 'Lỗi kết nói cURL' . curl_error($ch) , 'code' => 500 ];
    }

    curl_close($ch);
    $data = json_decode($output, true);

      if ($httpCode != 200) {
        return ['error' => $data['message'], 'code' => $httpCode];
    }

    return $data;
}

// Lấy dữ liệu
$current = callAPI($urlCurrent);
$forecast = callAPI($urlForecast);

// Trả JSON về cho frontend
if (isset($current['error']) || isset($forecast['error'])) {
    http_response_code($current['code'] ?? $forecast['code'] ?? 500);
    echo json_encode([
        "error" => $current['error'] ?? $forecast['error'] ?? 'Không lấy được dữ liệu từ OpenWeather'
    ]);
    exit;
}

echo json_encode([
    "current" => $current,
    "forecast" => $forecast
]);
