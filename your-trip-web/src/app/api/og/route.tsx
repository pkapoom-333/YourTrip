// Dynamic OG Image generator — Next.js ImageResponse
// Used by place pages, post pages, and landing pages for social sharing
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const BRAND_BLUE = "#398AB9";
const BRAND_DARK = "#1C658C";

const CAT_EMOJI: Record<string, string> = {
  attraction: "\U0001F3D4\uFE0F",
  restaurant: "\U0001F35C",
  cafe: "\u2615",
  hotel: "\U0001F3E8",
  activity: "\U0001F3AF",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const title    = searchParams.get("title")    ?? "Your Trip";
  const subtitle = searchParams.get("subtitle") ?? "";
  const category = searchParams.get("category") ?? "";
  const province = searchParams.get("province") ?? "";
  const rating   = searchParams.get("rating")   ?? "";
  const imageUrl = searchParams.get("image")    ?? "";

  const emoji = CAT_EMOJI[category] ?? "\u2708\uFE0F";
  const ratingNum = parseFloat(rating);
  const hasRating = !isNaN(ratingNum) && ratingNum > 0;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "1200px",
          height: "630px",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
          overflow: "hidden",
          background: "#F8FAFC",
        }}
      >
        {/* Left panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: imageUrl ? "520px" : "1200px",
            padding: "48px",
            background: "white",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: BRAND_BLUE,
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Y
            </div>
            <span style={{ fontSize: "18px", fontWeight: 700, color: BRAND_DARK }}>
              Your Trip
            </span>
          </div>

          {/* Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1, justifyContent: "center" }}>
            {/* Category + Province badges */}
            {(category || province) && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {category && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      background: "#EFF6FF",
                      color: BRAND_BLUE,
                      borderRadius: "99px",
                      padding: "4px 14px",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    <span>{emoji}</span>
                    <span>{category}</span>
                  </div>
                )}
                {province && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#64748B", fontSize: "14px" }}>
                    <span>\U0001F4CD</span>
                    <span>{province}</span>
                  </div>
                )}
              </div>
            )}

            {/* Title */}
            <div
              style={{
                fontSize: imageUrl ? "32px" : "48px",
                fontWeight: 800,
                color: "#0F172A",
                lineHeight: 1.2,
                maxWidth: imageUrl ? "440px" : "900px",
              }}
            >
              {title}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <div style={{ fontSize: "16px", color: "#475569", lineHeight: 1.5, maxWidth: imageUrl ? "420px" : "800px" }}>
                {subtitle.length > 120 ? subtitle.slice(0, 120) + "..." : subtitle}
              </div>
            )}

            {/* Rating — emoji star (Satori doesn't support SVG inline) */}
            {hasRating && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "20px" }}>\u2B50</span>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#0F172A" }}>
                  {ratingNum.toFixed(1)}
                </span>
                <span style={{ fontSize: "14px", color: "#64748B" }}>/ 5.0</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94A3B8", fontSize: "13px" }}>
            <span>your-trip-nu.vercel.app</span>
            <span>&#8226;</span>
            <span>&#x2192;</span>
          </div>
        </div>

        {/* Right panel — cover image */}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            style={{ width: "680px", height: "630px", objectFit: "cover" }}
          />
        )}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
