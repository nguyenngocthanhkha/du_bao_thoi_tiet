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

    /* ------------------------
       🕑 Đồng hồ thời gian thực
       ------------------------ */
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("vi-VN");
      document.getElementById("clock").textContent = timeStr;
    }
    if (!window.clockInterval) {
      window.clockInterval = setInterval(updateClock, 1000);
    }
    updateClock();

    /* ------------------------
       🌤 Thời tiết hiện tại
       ------------------------ */
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

    /* ------------------------
       📅 Dự báo 5 ngày
       ------------------------ */
    const forecastList = document.getElementById("forecast-list");
    forecastList.innerHTML = "";

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

    /* ------------------------
       👕 Gợi ý trang phục
       ------------------------ */
    let suggestionBox = document.getElementById("suggestion");
    if (!suggestionBox) {
      suggestionBox = document.createElement("div");
      suggestionBox.id = "suggestion";
      suggestionBox.classList.add("card", "suggestion-box");
      document.querySelector("main.container").appendChild(suggestionBox);
    }
    suggestionBox.textContent = "👕 Gợi ý: " + data.suggestion;

    /* ------------------------
       🔔 Nhắc nhở ngày mai
       ------------------------ */
    if (data.reminder) {
      // Hiện luôn trong giao diện
      let reminderBox = document.getElementById("reminder");
      if (!reminderBox) {
        reminderBox = document.createElement("div");
        reminderBox.id = "reminder";
        reminderBox.classList.add("card", "reminder-box");
        document.querySelector("main.container").appendChild(reminderBox);
      }
      reminderBox.textContent = "🔔 " + data.reminder;

      // Thông báo popup (nếu cho phép)
      if (Notification.permission === "granted") {
        new Notification("🌦 Nhắc nhở thời tiết", {
          body: data.reminder,
          icon: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            new Notification("🌦 Nhắc nhở thời tiết", {
              body: data.reminder,
              icon: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
            });
          }
        });
      }
    }
  } catch (err) {
    console.error("Lỗi:", err.message);

    document.getElementById("location-name").textContent = "Lỗi tải dữ liệu";
    document.getElementById("temp").textContent = "";
    document.getElementById("desc").textContent = err.message;
    document.getElementById("humidity").textContent = "";
    document.getElementById("wind").textContent = "";
    document.getElementById("date").textContent = "";
    document.getElementById("forecast-list").innerHTML = "";

    let suggestionBox = document.getElementById("suggestion");
    if (suggestionBox) suggestionBox.textContent = "";

    let reminderBox = document.getElementById("reminder");
    if (reminderBox) reminderBox.textContent = "";
  }
});
