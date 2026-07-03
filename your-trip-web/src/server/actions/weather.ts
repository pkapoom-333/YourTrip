"use server";

// Open-Meteo API — free, no key, accurate
// Geocoding via nominatim (OSM)

interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windspeed: number;
  weatherCode: number;
  weatherLabel: string;
  weatherEmoji: string;
  isDay: boolean;
  sunrise: string;
  sunset: string;
  dailyForecast: Array<{
    date: string;
    dayLabel: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
    weatherEmoji: string;
    precipProbability: number;
  }>;
}

function weatherCodeToInfo(code: number): { label: string; emoji: string } {
  if (code === 0) return { label: "ท้องฟ้าแจ่มใส", emoji: "☀️" };
  if (code <= 2) return { label: "มีเมฆบางส่วน", emoji: "⛅" };
  if (code === 3) return { label: "มีเมฆมาก", emoji: "☁️" };
  if (code <= 49) return { label: "หมอก", emoji: "🌫️" };
  if (code <= 57) return { label: "ฝนปรอย", emoji: "🌦️" };
  if (code <= 67) return { label: "ฝนตก", emoji: "🌧️" };
  if (code <= 77) return { label: "หิมะตก", emoji: "❄️" };
  if (code <= 82) return { label: "ฝนตกหนัก", emoji: "⛈️" };
  if (code <= 86) return { label: "หิมะตกหนัก", emoji: "🌨️" };
  if (code <= 99) return { label: "พายุฟ้าคะนอง", emoji: "⛈️" };
  return { label: "ไม่ทราบ", emoji: "🌡️" };
}

function dayLabel(dateStr: string): string {
  const days = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
  const d = new Date(dateStr);
  const today = new Date();
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "วันนี้";
  if (diff === 1) return "พรุ่งนี้";
  return days[d.getDay()];
}

export async function getWeatherForCity(city: string): Promise<{ data?: WeatherData; error?: string }> {
  try {
    // Step 1: Geocode
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)},Thailand&format=json&limit=1`,
      { headers: { "User-Agent": "YourTrip/1.0" }, next: { revalidate: 3600 } }
    );
    const geoData = await geoRes.json() as Array<{ lat: string; lon: string; display_name: string }>;
    if (!geoData.length) return { error: "ไม่พบตำแหน่ง" };

    const { lat, lon } = geoData[0];

    // Step 2: Fetch weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max` +
      `&timezone=Asia%2FBangkok&forecast_days=7`,
      { next: { revalidate: 1800 } }
    );
    const wd = await weatherRes.json() as {
      current: {
        temperature_2m: number;
        relative_humidity_2m: number;
        apparent_temperature: number;
        weather_code: number;
        wind_speed_10m: number;
        is_day: number;
      };
      daily: {
        time: string[];
        weather_code: number[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        sunrise: string[];
        sunset: string[];
        precipitation_probability_max: number[];
      };
    };

    const cur = wd.current;
    const info = weatherCodeToInfo(cur.weather_code);

    return {
      data: {
        city: city,
        temperature: Math.round(cur.temperature_2m),
        feelsLike: Math.round(cur.apparent_temperature),
        humidity: cur.relative_humidity_2m,
        windspeed: Math.round(cur.wind_speed_10m),
        weatherCode: cur.weather_code,
        weatherLabel: info.label,
        weatherEmoji: info.emoji,
        isDay: cur.is_day === 1,
        sunrise: wd.daily.sunrise[0]?.split("T")[1]?.slice(0, 5) ?? "--:--",
        sunset: wd.daily.sunset[0]?.split("T")[1]?.slice(0, 5) ?? "--:--",
        dailyForecast: wd.daily.time.map((date, i) => ({
          date,
          dayLabel: dayLabel(date),
          maxTemp: Math.round(wd.daily.temperature_2m_max[i]),
          minTemp: Math.round(wd.daily.temperature_2m_min[i]),
          weatherCode: wd.daily.weather_code[i],
          weatherEmoji: weatherCodeToInfo(wd.daily.weather_code[i]).emoji,
          precipProbability: wd.daily.precipitation_probability_max[i] ?? 0,
        })),
      },
    };
  } catch {
    return { error: "ไม่สามารถโหลดข้อมูลสภาพอากาศ" };
  }
}
