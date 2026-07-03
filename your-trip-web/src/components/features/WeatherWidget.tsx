"use client";

import { useState, useEffect } from "react";
import { getWeatherForCity } from "@/server/actions/weather";
import { Loader2, Wind, Droplets, Sunrise, Sunset, CloudRain, ChevronDown, ChevronUp } from "lucide-react";

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

interface WeatherWidgetProps {
  destination: string;
}

export function WeatherWidget({ destination }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!destination) return;
    setLoading(true);
    setError(null);
    getWeatherForCity(destination)
      .then(({ data, error: err }) => {
        if (err || !data) { setError(err ?? "ไม่สามารถโหลดข้อมูล"); }
        else { setWeather(data); }
      })
      .finally(() => setLoading(false));
  }, [destination]);

  if (!destination) return null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex items-center gap-3">
        <Loader2 className="w-4 h-4 text-[#398AB9] animate-spin" />
        <p className="text-xs text-gray-400 dark:text-slate-500">กำลังโหลดสภาพอากาศ {destination}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
        <p className="text-xs text-gray-400 dark:text-slate-500">🌡️ ไม่สามารถโหลดข้อมูลสภาพอากาศ</p>
      </div>
    );
  }

  if (!weather) return null;

  // Gradient based on condition
  const isHot = weather.temperature >= 32;
  const isRainy = weather.weatherCode >= 51;
  const gradientClass = isRainy
    ? "from-slate-600 to-slate-800"
    : isHot
    ? "from-orange-400 to-amber-500"
    : "from-sky-400 to-blue-600";

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm">
      {/* Main panel */}
      <div className={`bg-gradient-to-br ${gradientClass} px-5 py-4 text-white`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">สภาพอากาศ</p>
            <p className="text-sm font-semibold mt-0.5">{weather.city}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold leading-none">{weather.temperature}°</p>
            <p className="text-xs opacity-80 mt-1">รู้สึกเหมือน {weather.feelsLike}°</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{weather.weatherEmoji}</span>
          <p className="text-sm font-medium opacity-90">{weather.weatherLabel}</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/15 rounded-xl px-2 py-2 text-center">
            <Droplets className="w-3.5 h-3.5 mx-auto mb-0.5 opacity-80" />
            <p className="text-xs font-bold">{weather.humidity}%</p>
            <p className="text-[9px] opacity-70">ความชื้น</p>
          </div>
          <div className="bg-white/15 rounded-xl px-2 py-2 text-center">
            <Wind className="w-3.5 h-3.5 mx-auto mb-0.5 opacity-80" />
            <p className="text-xs font-bold">{weather.windspeed}</p>
            <p className="text-[9px] opacity-70">กม./ชม.</p>
          </div>
          <div className="bg-white/15 rounded-xl px-2 py-2 text-center">
            <Sunrise className="w-3.5 h-3.5 mx-auto mb-0.5 opacity-80" />
            <p className="text-xs font-bold">{weather.sunrise}</p>
            <p className="text-[9px] opacity-70">พระอาทิตย์ขึ้น</p>
          </div>
          <div className="bg-white/15 rounded-xl px-2 py-2 text-center">
            <Sunset className="w-3.5 h-3.5 mx-auto mb-0.5 opacity-80" />
            <p className="text-xs font-bold">{weather.sunset}</p>
            <p className="text-[9px] opacity-70">ตกดิน</p>
          </div>
        </div>
      </div>

      {/* Toggle forecast */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-800 text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-750 transition"
      >
        <span>พยากรณ์ 7 วัน</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* 7-day forecast */}
      {expanded && (
        <div className="bg-white dark:bg-slate-800 px-3 pb-3 border-t border-gray-50 dark:border-slate-700">
          <div className="space-y-1">
            {weather.dailyForecast.map((day) => (
              <div key={day.date} className="flex items-center gap-3 py-1.5">
                <span className="text-xs font-medium text-gray-500 dark:text-slate-400 w-12 flex-shrink-0">{day.dayLabel}</span>
                <span className="text-base">{day.weatherEmoji}</span>
                {day.precipProbability > 20 && (
                  <div className="flex items-center gap-0.5 text-[10px] text-sky-500 dark:text-sky-400">
                    <CloudRain className="w-3 h-3" />
                    {day.precipProbability}%
                  </div>
                )}
                <div className="ml-auto flex items-center gap-2 text-xs">
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{day.maxTemp}°</span>
                  <span className="text-gray-400 dark:text-slate-500">{day.minTemp}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
