document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "6812271205319ca74d9c28c6c8cd8c02"; 
    const city = "Chennai"; 
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                document.getElementById("weather-info").innerHTML = "⚠️ Error fetching weather!";
                return;
            }

            const weatherCondition = data.weather[0].main;
            const temp = data.main.temp;
            const iconCode = data.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

            let suggestion = "";
            if (weatherCondition.includes("Rain") || weatherCondition.includes("Thunderstorm")) {
                suggestion = "🌧️ Rainy day! Best transport: 🚆 Train or 🚌 Bus (avoid autos).";
            } else if (temp > 35) {
                suggestion = "🔥 Hot day! Best transport: 🚆 Train (avoid sun exposure).";
            } else {
                suggestion = "🌞 Clear weather! Best transport: 🚆 Train, 🛺 Share Auto, or 🚌 Bus.";
            }

            document.getElementById("weather-info").innerHTML = `
                <img src="${iconUrl}" alt="Weather Icon" style="width: 40px; vertical-align: middle;">
                <strong>${weatherCondition} | ${temp}°C</strong>
            `;

            const bestTransportElement = document.getElementById("best-transport");
            if (bestTransportElement) {
                bestTransportElement.innerHTML = suggestion;
            }
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            document.getElementById("weather-info").innerHTML = "⚠️ Error fetching weather!";
        });
});

function trackTransport() {
    const location = document.getElementById("location").value;
    const destination = document.getElementById("destination").value;

    if (location && destination) {
        window.location.href = "fare_time_details.html";
    } else {
        alert("Please enter both location and destination.");
    }
}
