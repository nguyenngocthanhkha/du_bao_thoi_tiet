<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json; charset=utf-8');

// Lấy city từ request (mặc định là Ho Chi Minh)
$city = isset($_GET['city']) ? $_GET['city'] : 'Ho Chi Minh';

// API key của bạn
$apiKey = "7e1a92020fb10446446cb82105d49457"; // thay bằng key thật

// Endpoint OpenWeather
$urlCurrent = "https://api.openweathermap.org/data/2.5/weather?q={$city}&appid={$apiKey}&lang=vi&units=metric";
$urlForecast = "https://api.openweathermap.org/data/2.5/forecast?q={$city}&appid={$apiKey}&lang=vi&units=metric";

// Hàm gọi API
function callAPI($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $output = curl_exec($ch);

    if ($output === false) {
        return null;
    }

    curl_close($ch);
    return json_decode($output, true);
}

// Lấy dữ liệu
$current = callAPI($urlCurrent);
$forecast = callAPI($urlForecast);

// Trả JSON về cho frontend
if (!$current || !$forecast || isset($current['cod']) && $current['cod'] != 200) {
    echo json_encode([
        "error" => "Không lấy được dữ liệu từ OpenWeather",
        "current_raw" => $current,
        "forecast_raw" => $forecast
    ]);
    exit;
}

echo json_encode([
    "current" => $current,
    "forecast" => $forecast
]);
