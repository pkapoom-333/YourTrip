"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, ChevronRight } from "lucide-react";

interface TripCountdownProps {
  trip: {
    id: string;
    title: string;
    destination: string;
    startDate: Date | string | null;
    endDate: Date | string | null;
    status: string;
    coverImage?: string | null;
  };
}

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isToday: boolean;
  isOngoing: boolean;
  isPast: boolean;
}

function calcCountdown(startDate: Date): Countdown {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const diff = start - now;

  if (diff < 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: false, isOngoing: true, isPast: false };
  }
  if (diff < 86_400_000 && new Date(startDate).toDateString() === new Date().toDateString()) {
    const mins = Math.floor(diff / 60_000);
    return { days: 0, hours: Math.floor(mins / 60), minutes: mins % 60, seconds: 0, isToday: true, isOngoing: false, isPast: false };
  }

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, minutes, seconds, isToday: false, isOngoing: false, isPast: false };
}

export function TripCountdownWidget({ trip }: TripCountdownProps) {
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  useEffect(() => {
    if (!trip.startDate) return;
    const startDate = new Date(trip.startDate);

    // Check if past end date
    if (trip.endDate && new Date(trip.endDate).getTime() < Date.now()) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isToday: false, isOngoing: false, isPast: true });
      return;
    }

    setCountdown(calcCountdown(startDate));
    const interval = setInterval(() => setCountdown(calcCountdown(startDate)), 1000);
    return () => clearInterval(interval);
  }, [trip.startDate, trip.endDate]);

  if (!trip.startDate || !countdown) return null;

  return (
    <Link href={`/trips/${trip.id}`}
      className="block bg-gradient-to-r from-[#398AB9] to-[#1C658C] rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-[#398AB9]/30 transition group">
      {/* Cover image background */}
      {trip.coverImage && (
        <div className="absolute inset-0 opacity-20">
          <img src={trip.coverImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      )}

      <div className="relative p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white/70 text-[11px] font-medium uppercase tracking-wider mb-0.5">
              {countdown.isPast ? "ทริปที่ผ่านมา" : countdown.isOngoing ? "กำลังเดินทาง 🎉" : countdown.isToday ? "วันนี้เลย! 🚀" : "นับถอยหลัง"}
            </p>
            <h3 className="text-white font-bold text-base truncate">{trip.title}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="w-3 h-3 text-white/60" />
              <span className="text-white/70 text-xs">{trip.destination}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-white transition mt-1" />
        </div>

        {/* Countdown display */}
        {!countdown.isPast && !countdown.isOngoing && (
          <div className="flex gap-2">
            {countdown.isToday ? (
              <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-white font-bold text-sm">
                  {String(countdown.hours).padStart(2, "0")}:{String(countdown.minutes).padStart(2, "0")}
                </span>
              </div>
            ) : (
              [
                { v: countdown.days, l: "วัน" },
                { v: countdown.hours, l: "ชม." },
                { v: countdown.minutes, l: "นาที" },
              ].map(({ v, l }) => (
                <div key={l} className="bg-white/20 rounded-xl px-3 py-2 text-center flex-1">
                  <div className="text-white font-bold text-xl leading-none">{String(v).padStart(2, "0")}</div>
                  <div className="text-white/60 text-[10px] mt-0.5">{l}</div>
                </div>
              ))
            )}
          </div>
        )}

        {countdown.isOngoing && (
          <div className="bg-white/20 rounded-xl px-3 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white text-sm font-medium">เดินทางอยู่ตอนนี้</span>
          </div>
        )}

        {countdown.isPast && (
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-white/60" />
            <span className="text-white/70 text-sm">
              {new Date(trip.startDate).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
