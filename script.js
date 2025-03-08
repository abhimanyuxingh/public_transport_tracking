// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Firestore Database
const db = firebase.firestore();

// OpenWeather API Key
const weatherApiKey = "6812271205319ca74d9c28c6c8cd8c02";
const city = "Chennai"; // Can be changed to user-input location
const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`;

// Fetch Weather Data
fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {
        if (data.cod !== 200) {
            document.getElementById("weather-info").innerHTML = "⚠️ Error fetching weather!";
            return;
        }

        // Extract weather details
        const weatherCondition = data.weather[0].main;
        const temp = data.main.temp;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        // Determine best transport option
        let suggestion = "";
        if (weatherCondition.includes("Rain") || weatherCondition.includes("Thunderstorm")) {
            suggestion = "🌧️ Rainy day! Best transport: 🚆 Train or 🚌 Bus (avoid autos).";
        } else if (temp > 35) {
            suggestion = "🔥 Hot day! Best transport: 🚆 Train (avoid sun exposure).";
        } else {
            suggestion = "🌞 Clear weather! Best transport: 🚆 Train, 🛺 Share Auto, or 🚌 Bus.";
        }

        // Display weather info
        document.getElementById("weather-info").innerHTML = `
            <img src="${iconUrl}" alt="Weather Icon" style="width: 40px; vertical-align: middle;">
            <strong>${weatherCondition} | ${temp}°C</strong>
        `;

        // Display transport suggestion
        const bestTransportElement = document.getElementById("best-transport");
        if (bestTransportElement) {
            bestTransportElement.innerHTML = suggestion;
        }

        // Fetch Weather Alerts
        fetchWeatherAlerts(city);
    })
    .catch(error => {
        console.error("Error fetching weather data:", error);
        document.getElementById("weather-info").innerHTML = "⚠️ Error fetching weather!";
    });

// Fetch Weather Alerts Function
function fetchWeatherAlerts(city) {
    const alertsUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&alerts`;

    fetch(alertsUrl)
        .then(response => response.json())
        .then(data => {
            if (data.alerts && data.alerts.length > 0) {
                document.getElementById("weather-alert").innerHTML = `<strong>⚠️ Weather Alert: ${data.alerts[0].event}</strong> - ${data.alerts[0].description}`;
            } else {
                document.getElementById("weather-alert").innerHTML = "✅ No weather alerts.";
            }
        })
        .catch(error => {
            console.error("Error fetching weather alerts:", error);
            document.getElementById("weather-alert").innerHTML = "⚠️ Unable to fetch weather alerts!";
        });
}

// Save User Transport Selection to Firebase
function saveTransportSelection() {
    const location = document.getElementById("location").value;
    const destination = document.getElementById("destination").value;
    const transport = document.getElementById("transport").value;

    if (location && destination && transport) {
        db.collection("transport_selections").add({
            location: location,
            destination: destination,
            transport: transport,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log("✅ Data saved successfully in Firestore!");
            fetchPastSearches(); // Refresh search history
        }).catch(error => {
            console.error("❌ Error saving data:", error);
        });
    } else {
        alert("⚠️ Please enter all fields!");
    }
}

// Fetch & Display Recent Searches
function fetchPastSearches() {
    db.collection("transport_selections")
      .orderBy("timestamp", "desc")
      .limit(5)
      .get()
      .then(snapshot => {
          let searchHistory = "";
          snapshot.forEach(doc => {
              const data = doc.data();
              searchHistory += `<li>${data.location} to ${data.destination} via ${data.transport}</li>`;
          });
          document.getElementById("search-history").innerHTML = searchHistory;
      })
      .catch(error => {
          console.error("❌ Error fetching past searches:", error);
      });
}

// Fetch data when the page loads
document.addEventListener("DOMContentLoaded", fetchPastSearches);
