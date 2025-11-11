<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

// --- API Key ---
$apiKey = "7e1a92020fb10446446cb82105d49457";

// --- Hàm gọi API ---
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

// --- Xác định query ---
// Bấm "Vị trí của tôi" -> luôn là Quy Nhơn
if (isset($_GET["geo"])) {
    $city = "Quy Nhon";
    $urlCurrent  = "https://api.openweathermap.org/data/2.5/weather?q={$city}&appid={$apiKey}&lang=vi&units=metric";
    $urlForecast = "https://api.openweathermap.org/data/2.5/forecast?q={$city}&appid={$apiKey}&lang=vi&units=metric";
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

// --- Xử lý dữ liệu ---
$temp = $current["main"]["temp"] ?? 0;
$desc = strtolower($current["weather"][0]["description"] ?? "");
$icon = $current["weather"][0]["icon"] ?? "01d";

// Link icon chuẩn OpenWeather
$iconUrl = "https://openweathermap.org/img/wn/{$icon}@2x.png";

// Gợi ý trang phục
$suggestion = "Hôm nay thời tiết dễ chịu.";
if (strpos($desc, "mưa") !== false) {
    $suggestion = "Trời có mưa, nhớ mang áo mưa hoặc ô ☔";
} elseif ($temp < 20) {
    $suggestion = "Trời lạnh, nên mặc áo khoác ấm 🧥";
} elseif ($temp > 32) {
    $suggestion = "Trời nóng, mặc đồ thoáng mát 👕 và uống nhiều nước 💧";
}

// Nhắc nhở ngày mai
$reminder = "Không có nhắc nhở đặc biệt.";
if (!empty($forecast["list"]) && isset($forecast["list"][8])) { // ~24h sau
    $tomorrowDesc = strtolower($forecast["list"][8]["weather"][0]["description"] ?? "");
    $tomorrowTemp = $forecast["list"][8]["main"]["temp"] ?? null;

    $reminderArr = [];
    if (strpos($tomorrowDesc, "mưa") !== false) {
        $reminderArr[] = "Ngày mai có mưa, nhớ mang ô nhé ☔";
    }
    if (strpos($tomorrowDesc, "nắng") !== false) {
        $reminderArr[] = "Ngày mai trời nắng, bôi kem chống nắng 🌞";
    }
    if ($tomorrowTemp !== null) {
        if ($tomorrowTemp <= 10) $reminderArr[] = "Ngày mai lạnh, mang áo ấm 🧥";
        if ($tomorrowTemp >= 35) $reminderArr[] = "Ngày mai nóng, uống nhiều nước 💧";
    }

    if (!empty($reminderArr)) {
        $reminder = implode(" | ", $reminderArr);
    } else {
        $reminder = "Ngày mai thời tiết khá ổn ✅";
    }
}

// --- Dữ liệu hourly chart (8 mốc tiếp theo ~24h) ---
$hourly = [];
if (!empty($forecast["list"])) {
    foreach (array_slice($forecast["list"], 0, 8) as $entry) {
        $time = date("H:i", $entry["dt"]);
        $hourly[] = [
            "time" => $time,
            "temp" => round($entry["main"]["temp"])
        ];
    }
}

// --- Xuất JSON ---
echo json_encode([
    "current"    => $current,
    "forecast"   => $forecast,
    "icon"       => $iconUrl,
    "suggestion" => $suggestion,
    "reminder"   => $reminder,
    "hourly"     => $hourly
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
