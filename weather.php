<?php
header('Content-Type: application/json; charset=utf-8');

// Lấy city từ request
$city = isset($_GET['city']) ? $_GET['city'] : 'Hanoi';

// API key của bạn
$apiKey = "9e74dda636db58c18120b15630a121f8";

// Endpoint OpenWeather
$urlCurrent = "https://api.openweathermap.org/data/2.5/weather?q={$city}&appid={$apiKey}&lang=vi&units=metric";
$urlForecast = "https://api.openweathermap.org/data/2.5/forecast?q={$city}&appid={$apiKey}&lang=vi&units=metric";

// Hàm gọi API
function callAPI($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $output = curl_exec($ch);
    curl_close($ch);
    return json_decode($output, true);
}

// Lấy dữ liệu
$current = callAPI($urlCurrent);
$forecast = callAPI($urlForecast);

// Trả JSON về cho frontend
echo json_encode([
    "current" => $current,
    "forecast" => $forecast
], JSON_UNESCAPED_UNICODE);
