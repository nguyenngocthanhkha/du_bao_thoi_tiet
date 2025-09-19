document.getElementById("search-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const city = document.getElementById("city-input").value.trim();
  if (!city) return;

  try {
    const res = await fetch(`weather.php?city=${encodeURIComponent(city)}`);
    if (!res.ok) throw new Error("Lỗi kết nối server");

    const data = await res.json();
    console.log("Data:", data);

    if (!data.current || !data.forecast) {
      throw new Error("Dữ liệu không hợp lệ từ API");
    }

    // --- Đồng hồ ---
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("vi-VN");
      document.getElementById("clock").textContent = timeStr;
    }
    if (!window.clockInterval) {
      // chỉ setInterval 1 lần
      window.clockInterval = setInterval(updateClock, 1000);
    }
    updateClock();

    // --- Thời tiết hiện tại ---
    document.getElementById("location-name").textContent = data.current.name;
    document.getElementById("temp").textContent =
      Math.round(data.current.main.temp) + "°C";
    document.getElementById("desc").textContent =
      data.current.weather[0].description;
    document.getElementById("humidity").textContent =
      "Độ ẩm: " + data.current.main.humidity + "%";
    document.getElementById("wind").textContent =
      "Gió: " + data.current.wind.speed + " m/s";
    document.getElementById("date").textContent = new Date(
      data.current.dt * 1000
    ).toLocaleString("vi-VN");

    // --- Dự báo 5 ngày (mỗi ngày lấy 1 mốc) ---
    const forecastList = document.getElementById("forecast-list");
    forecastList.innerHTML = "";

    // lấy theo ngày duy nhất (0h hoặc 12h chẳng hạn)
    const daily = {};
    data.forecast.list.forEach((item) => {
      const day = new Date(item.dt * 1000).toLocaleDateString("vi-VN");
      if (!daily[day]) {
        daily[day] = item;
      }
    });

    Object.values(daily)
      .slice(0, 5)
      .forEach((item) => {
        const el = document.createElement("div");
        el.classList.add("forecast-item");
        el.innerHTML = `
        <span>${new Date(item.dt * 1000).toLocaleDateString("vi-VN")}</span>
        <span>${Math.round(item.main.temp)}°C</span>
        <span>${item.weather[0].description}</span>
      `;
        forecastList.appendChild(el);
      });
  } catch (err) {
    console.error("Lỗi:", err.message);

    // hiển thị lỗi ra giao diện thay vì chỉ alert
    document.getElementById("location-name").textContent = "Lỗi tải dữ liệu";
    document.getElementById("temp").textContent = "";
    document.getElementById("desc").textContent = err.message;
    document.getElementById("humidity").textContent = "";
    document.getElementById("wind").textContent = "";
    document.getElementById("date").textContent = "";
    document.getElementById("forecast-list").innerHTML = "";
  }
});
