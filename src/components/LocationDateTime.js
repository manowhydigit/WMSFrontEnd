import React, { useEffect, useState } from "react";
import "./LocationDateTime.css";

const LocationDateTime = () => {
  const [location, setLocation] = useState({
    municipality: "Loading...",
    country: "",
  });
  const [temperature, setTemperature] = useState("...");
  const [dateTime, setDateTime] = useState(new Date());

  const WEATHER_API_KEY = "33fb936b8c658a7d2743cfef282557cf";

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch location and weather
  useEffect(() => {
    const fetchWeather = (lat, lon) => {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      )
        .then((res) => res.json())
        .then((weatherData) => {
          const temp = weatherData.current_weather.temperature;
          setTemperature(`${temp}°C`);
        })
        .catch(() => setTemperature("N/A"));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
            .then((res) => res.json())
            .then((data) => {
              // Use municipality first, fallback to other fields
              const municipality =
                data.address?.municipality ||
                data.address?.city ||
                data.address?.town ||
                "Unknown";
              const country = data.address?.country || "Unknown";

              setLocation({
                municipality,
                country,
              });

              fetchWeather(latitude, longitude);
            })
            .catch(() => {
              setLocation({
                municipality: `${latitude.toFixed(2)}°`,
                country: `${longitude.toFixed(2)}°`,
              });
              fetchWeather(latitude, longitude);
            });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocation({
            municipality: "Location blocked",
            country: "Enable geolocation",
          });
        }
      );
    } else {
      setLocation({
        municipality: "Geolocation not supported",
        country: "",
      });
    }
  }, []);

  return (
    <div
      style={{
        color: "#fff",
        fontSize: "12px",
        marginLeft: "-970px",
        marginTop: "80px",
        letterSpacing: "2px",
      }}
    >
      <p style={{ fontSize: "16px", fontFamily: "'Lily Script One', cursive" }}>
        {/* {location.municipality}, {location.country} • {temperature} */}
      </p>
      <p style={{ fontSize: "16px", fontFamily: "'Lily Script One', cursive" }}>
        {dateTime.toLocaleString("en-IN", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })}
      </p>
    </div>
  );
};

export default LocationDateTime;
