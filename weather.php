<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json; charset=utf-8');

// Lấy city từ request (mặc định là Ho Chi Minh)
$city = isset($_GET['city']) ? $_GET['city'] : 'Ho Chi Minh';

// API key của bạn
$apiKey = "7e1a92020fb10446446cb82105d49457"; // thay bằng key thật

// Endpoint OpenWeather
$urlCurrent  = "https://api.openweathermap.org/data/2.5/weather?q={$city}&appid={$apiKey}&lang=vi&units=metric";
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
$current  = callAPI($urlCurrent);
$forecast = callAPI($urlForecast);

// Nếu lỗi API
if (!$current || !$forecast || (isset($current['cod']) && $current['cod'] != 200)) {
    echo json_encode([
        "error" => "Không lấy được dữ liệu từ OpenWeather",
        "current_raw" => $current,
        "forecast_raw" => $forecast
    ]);
    exit;
}

/* ==============================
   🧥 Gợi ý trang phục hôm nay
   ============================== */
$temp = $current['main']['temp'];
$desc = strtolower($current['weather'][0]['description']);
$suggestion = "Hôm nay thời tiết dễ chịu, mặc thoải mái nhé!";

if (strpos($desc, 'mưa') !== false) {
    $suggestion = "Trời có mưa, nhớ mang áo mưa hoặc ô ☔";
} elseif ($temp < 20) {
    $suggestion = "Trời lạnh, nên mặc áo khoác ấm 🧥";
} elseif ($temp > 32) {
    $suggestion = "Trời nóng, nhớ mặc đồ thoáng mát 👕 và uống nhiều nước 💧";
}

/* ==============================
   🔔 Nhắc nhở ngày mai
   ============================== */
$reminder = null;
if (isset($forecast['list'][8])) { 
    // lấy dự báo sau ~24h (API forecast có step 3h → 8 bước = 24h)
    $tomorrowDesc = strtolower($forecast['list'][8]['weather'][0]['description']);

    if (strpos($tomorrowDesc, 'mưa') !== false) {
        $reminder = "Ngày mai có mưa, nhớ mang ô nhé ☔";
    } elseif (strpos($tomorrowDesc, 'nắng') !== false) {
        $reminder = "Ngày mai trời nắng, nhớ bôi kem chống nắng 🌞";
    } else {
        $reminder = "Ngày mai thời tiết khá ổn, cứ thoải mái nhé ✅";
    }
}

// Trả JSON về cho frontend
echo json_encode([
    "current"    => $current,
    "forecast"   => $forecast,
    "suggestion" => $suggestion,
    "reminder"   => $reminder
]);
