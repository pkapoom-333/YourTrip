import { notFound } from "next/navigation";
import { getTripById } from "@/server/actions/trips";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TripPrintPage({ params }: Props) {
  const { id } = await params;
  const { data: trip } = await getTripById(id);
  if (!trip) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tripData = trip as any;
  const days: any[] = tripData.days ?? [];
  const totalPlaces = days.reduce((s: number, d: any) => s + (d.items?.length ?? 0), 0);

  return (
    <html lang="th">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{tripData.title} — YourTrip Itinerary</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1a1a1a; background: #fff; }
          .container { max-width: 800px; margin: 0 auto; padding: 32px 24px; }
          .header { border-bottom: 2px solid #398AB9; padding-bottom: 16px; margin-bottom: 24px; }
          .logo { color: #398AB9; font-size: 14px; font-weight: 700; margin-bottom: 4px; }
          .title { font-size: 28px; font-weight: 800; color: #1a1a1a; margin-bottom: 6px; }
          .meta { color: #666; font-size: 13px; display: flex; gap: 16px; flex-wrap: wrap; margin-top: 8px; }
          .badge { background: #398AB9; color: white; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; }
          .day { margin-bottom: 28px; break-inside: avoid; }
          .day-header { background: #398AB9; color: white; padding: 8px 14px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
          .item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
          .item:last-child { border-bottom: none; }
          .num { width: 24px; height: 24px; background: #f0f6fb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #398AB9; flex-shrink: 0; margin-top: 1px; }
          .info { flex: 1; }
          .iname { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
          .imeta { font-size: 11px; color: #888; margin-bottom: 2px; }
          .inotes { font-size: 12px; color: #555; font-style: italic; }
          .itime { font-size: 11px; color: #398AB9; font-weight: 600; white-space: nowrap; }
          .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; color: #999; font-size: 11px; }
          .print-btn { position: fixed; bottom: 24px; right: 24px; background: #398AB9; color: white; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(57,138,185,0.4); }
          @media print { .print-btn { display: none; } body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="logo">Your Trip</div>
            <h1 className="title">{tripData.title}</h1>
            <div className="meta">
              {tripData.destination && <span>📍 {tripData.destination}</span>}
              {tripData.startDate && tripData.endDate && (
                <span>📅 {new Date(tripData.startDate).toLocaleDateString("th-TH")} — {new Date(tripData.endDate).toLocaleDateString("th-TH")}</span>
              )}
              <span>🗓 {days.length} วัน</span>
              <span>📌 {totalPlaces} สถานที่</span>
              {tripData.budget && <span>💰 งบ {tripData.budget.toLocaleString()} บาท</span>}
              <span className="badge">{
                tripData.status === "PLANNING" ? "วางแผน" :
                tripData.status === "CONFIRMED" ? "ยืนยันแล้ว" :
                tripData.status === "ONGOING" ? "กำลังเดินทาง" : "เสร็จสิ้น"
              }</span>
            </div>
          </div>

          {tripData.description && (
            <p style={{ marginBottom: 24, color: "#555", fontSize: 14, lineHeight: 1.6 }}>{tripData.description}</p>
          )}

          {days.map((day: any) => (
            <div key={day.id} className="day">
              <div className="day-header">
                <span>วันที่ {day.dayNumber ?? day.day}: {day.date ? new Date(day.date).toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long" }) : `วันที่ ${day.dayNumber ?? day.day}`}</span>
                <span style={{ fontSize: 12, opacity: 0.85 }}>{day.items?.length ?? 0} สถานที่</span>
              </div>
              {day.notes && (
                <p style={{ fontSize: 12, color: "#666", margin: "0 0 10px", fontStyle: "italic", padding: "0 4px" }}>📝 {day.notes}</p>
              )}
              {(day.items?.length ?? 0) === 0 ? (
                <p style={{ fontSize: 13, color: "#aaa", padding: "8px 4px" }}>— ยังไม่มีรายการ —</p>
              ) : (
                (day.items ?? []).map((item: any, i: number) => (
                  <div key={item.id} className="item">
                    <div className="num">{i + 1}</div>
                    <div className="info">
                      <div className="iname">
                        {item.type === "place" ? "📍 " : item.type === "restaurant" ? "🍽 " : "🏨 "}
                        {item.place?.name ?? item.title ?? item.customTitle ?? "สถานที่"}
                      </div>
                      {item.place?.province && <div className="imeta">{item.place.province}</div>}
                      {item.notes && <div className="inotes">{item.notes}</div>}
                    </div>
                    {item.startTime && (
                      <div className="itime">{item.startTime}{item.endTime ? ` – ${item.endTime}` : ""}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          ))}

          <div className="footer">สร้างโดย Your Trip · ส่งออก {new Date().toLocaleDateString("th-TH")}</div>
        </div>
        <button className="print-btn" onClick={() => window.print()}>🖨 พิมพ์ / บันทึก PDF</button>
      </body>
    </html>
  );
}
