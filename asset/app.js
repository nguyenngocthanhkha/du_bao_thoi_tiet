document.getElementById("search-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const city = document.getElementById("city-input").value;

    const res = await fetch(`weather.php?city=${city}`);
    const data = await res.json();

    console.log(data); // debug

    // Hiển thị dữ liệu
    document.getElementById("location-name").textContent = data.current.name;
    document.getElementById("temp").textContent = data.current.main.temp + "°C";
    document.getElementById("desc").textContent = data.current.weather[0].description;
    document.getElementById("humidity").textContent = "Độ ẩm: " + data.current.main.humidity + "%";
    document.getElementById("wind").textContent = "Gió: " + data.current.wind.speed + " m/s";
    document.getElementById("date").textContent = new Date(data.current.dt * 1000).toLocaleString("vi-VN");

    // Dự báo 5 ngày
    const forecastList = document.getElementById("forecast-list");
    forecastList.innerHTML = "";
    data.forecast.list.slice(0, 5).forEach(item => {
        const el = document.createElement("div");
        el.classList.add("forecast-item");
        el.innerHTML = `
            <span>${new Date(item.dt * 1000).toLocaleDateString("vi-VN")}</span>
            <span>${item.main.temp}°C</span>
            <span>${item.weather[0].description}</span>
        `;
        forecastList.appendChild(el);
    });
});
