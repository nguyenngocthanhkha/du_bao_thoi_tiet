<?php
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json; charset=utf-8');

// Lấy city từ request (mặc định là Ho Chi Minh)
$city = isset($_GET['city']) ? $_GET['city'] : 'Ha Noi';

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

/* ==========================
   1️⃣ Lấy tọa độ từ Geo API
   ========================== */
$geoUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" . urlencode($city) . ",vn&limit=1&appid={$apiKey}";
$geo = callAPI($geoUrl);

if (!$geo || count($geo) == 0) {
    echo json_encode(["error" => "Không tìm thấy thành phố"]);
    exit;
}

$lat = $geo[0]['lat'];
$lon = $geo[0]['lon'];
$cityName = $geo[0]['name'];

/* ==========================
   2️⃣ Gọi API thời tiết bằng lat/lon
   ========================== */
$urlCurrent  = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&appid={$apiKey}&lang=vi&units=metric";
$urlForecast = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$apiKey}&lang=vi&units=metric";

$current  = callAPI($urlCurrent);
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

/* ==========================
   3️⃣ Gợi ý trang phục
   ========================== */
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

/* ==========================
   4️⃣ Nhắc nhở ngày mai
   ========================== */
$reminder = null;
if (isset($forecast['list'][8])) {
    $tomorrowDesc = strtolower($forecast['list'][8]['weather'][0]['description']);
    if (strpos($tomorrowDesc, 'mưa') !== false) {
        $reminder = "Ngày mai có mưa, nhớ mang ô nhé ☔";
    } elseif (strpos($tomorrowDesc, 'nắng') !== false) {
        $reminder = "Ngày mai trời nắng, nhớ bôi kem chống nắng 🌞";
    } else {
        $reminder = "Ngày mai thời tiết khá ổn, cứ thoải mái nhé ✅";
    }
}

/* ==========================
   5️⃣ Trả dữ liệu về frontend
   ========================== */
echo json_encode([
    "city"       => $cityName,
    "current"    => $current,
    "forecast"   => $forecast,
    "suggestion" => $suggestion,
    "reminder"   => $reminder
]);
