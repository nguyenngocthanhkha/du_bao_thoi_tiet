<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

$apiKey = "7e1a92020fb10446446cb82105d49457";

function callAPI($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $output = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if ($output === false) {
        $error = curl_error($ch);
        curl_close($ch);
        return ["error" => $error, "code" => 500];
    }

    curl_close($ch);
    $data = json_decode($output, true);

    if ($httpCode !== 200 || !is_array($data)) {
        return [
            "error" => $data["message"] ?? "API lỗi",
            "code" => $httpCode
        ];
    }

    return $data;
}

// --- Lấy dữ liệu từ query string ---
if (!empty($_GET["lat"]) && !empty($_GET["lon"])) {
    $lat = $_GET["lat"];
    $lon = $_GET["lon"];
    $urlCurrent  = "https://api.openweathermap.org/data/2.5/weather?lat={$lat}&lon={$lon}&appid={$apiKey}&lang=vi&units=metric";
    $urlForecast = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&appid={$apiKey}&lang=vi&units=metric";
} else {
    $city = isset($_GET["city"]) ? urlencode($_GET["city"]) : "Hanoi";
    $urlCurrent  = "https://api.openweathermap.org/data/2.5/weather?q={$city}&appid={$apiKey}&lang=vi&units=metric";
    $urlForecast = "https://api.openweathermap.org/data/2.5/forecast?q={$city}&appid={$apiKey}&lang=vi&units=metric";
}

// --- Gọi API ---
$current  = callAPI($urlCurrent);
$forecast = callAPI($urlForecast);

// --- Kiểm tra lỗi ---
if (isset($current["error"]) || isset($forecast["error"])) {
    http_response_code($current["code"] ?? $forecast["code"] ?? 500);
    echo json_encode([
        "error" => $current["error"] ?? $forecast["error"] ?? "Không lấy được dữ liệu"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// --- Phân tích thời tiết ---
$temp = $current["main"]["temp"] ?? 0;
$desc = strtolower($current["weather"][0]["description"] ?? "");
$icon = $current["weather"][0]["icon"] ?? "01d"; // mặc định trời nắng

// Link icon chuẩn của OpenWeather
$iconUrl = "https://openweathermap.org/img/wn/{$icon}@2x.png";

$suggestion = "Hôm nay thời tiết dễ chịu.";
if (strpos($desc, "mưa") !== false) {
    $suggestion = "Trời có mưa, nhớ mang áo mưa hoặc ô ☔";
} elseif ($temp < 20) {
    $suggestion = "Trời lạnh, nên mặc áo khoác ấm 🧥";
} elseif ($temp > 32) {
    $suggestion = "Trời nóng, mặc đồ thoáng mát 👕 và uống nhiều nước 💧";
}

// --- Nhắc nhở cho ngày mai ---
$reminder = null;
if (isset($forecast["list"][8])) { // ~24h sau
    $tomorrowDesc = strtolower($forecast["list"][8]["weather"][0]["description"] ?? "");
    if (strpos($tomorrowDesc, "mưa") !== false) {
        $reminder = "Ngày mai có mưa, nhớ mang ô nhé ☔";
    } elseif (strpos($tomorrowDesc, "nắng") !== false) {
        $reminder = "Ngày mai trời nắng, nhớ bôi kem chống nắng 🌞";
    } else {
        $reminder = "Ngày mai thời tiết khá ổn ✅";
    }
}

// --- Xuất JSON ---
echo json_encode([
    "current"    => $current,
    "forecast"   => $forecast,
    "icon"       => $iconUrl,
    "suggestion" => $suggestion,
    "reminder"   => $reminder
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
