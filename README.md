# Weather App - Ứng dụng Dự báo Thời tiết

Ứng dụng web dự báo thời tiết được xây dựng bằng PHP và JavaScript, sử dụng OpenWeather API.

## Tính năng

- 🌤️ Hiển thị thời tiết hiện tại với đầy đủ thông tin (nhiệt độ, độ ẩm, gió, cảm giác)
- 📅 Dự báo thời tiết 3-5 ngày tới
- 📊 Biểu đồ nhiệt độ theo giờ (24h tiếp theo)
- 🌍 Tìm kiếm thời tiết theo thành phố
- 📍 Lấy thời tiết theo vị trí (Quy Nhơn)
- 🌡️ Chuyển đổi giữa °C và °F
- 🎨 Giao diện đẹp với hình nền thay đổi theo thời tiết
- 👕 Gợi ý trang phục dựa trên nhiệt độ
- ⏰ Nhắc nhở thời tiết ngày mai

## Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: PHP
- **API**: OpenWeather API
- **Chart**: Chart.js
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter)

## Cài đặt

1. Clone repository này về máy
2. Đặt thư mục vào `htdocs` của XAMPP (hoặc thư mục web server của bạn)
3. Mở file `weather.php` và thay `$apiKey` bằng API key của bạn từ [OpenWeather](https://openweathermap.org/api)
4. Mở file `asset/app.js` và thay `API_KEY` bằng API key của bạn
5. Truy cập `http://localhost/WeatherApp/index.php`

## Cấu trúc thư mục

```
WeatherApp/
├── asset/
│   ├── app.js          # Logic JavaScript chính
│   ├── styles.css      # File CSS
│   └── image/          # Hình ảnh nền
├── index.php           # Trang chính
├── weather.php         # API endpoint (PHP)
└── README.md           # File này
```

## API Key

Bạn cần đăng ký tài khoản miễn phí tại [OpenWeather](https://openweathermap.org/api) để lấy API key.

## License

MIT License

