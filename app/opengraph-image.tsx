import { ImageResponse } from "next/og";
import { shop } from "@/data/shop";

export const alt = shop.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf8f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="120" height="120" viewBox="0 0 48 48" fill="none">
            <rect x="1" y="1" width="46" height="46" rx="12" fill="#1c1917" />
            <rect x="10" y="31" width="28" height="9" rx="2" fill="#292524" />
            <path d="M11 30.5V22.5H37V30.5H11Z" fill="#faf8f5" />
            <path d="M9 22.5L24 10.5L39 22.5H9Z" fill="#f97316" />
            <path
              d="M13.5 21.2C18 19.6 22.5 19.2 24 19.2C25.5 19.2 30 19.6 34.5 21.2"
              stroke="#0d9488"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
            <path
              d="M24 12.2C24 12.2 22.1 16.4 22.1 18.1C22.1 19.55 22.95 20.65 24 20.65C25.05 20.65 25.9 19.55 25.9 18.1C25.9 16.4 24 12.2 24 12.2Z"
              fill="#dc2626"
            />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 56, fontWeight: 700, color: "#1c1917", letterSpacing: "-0.02em" }}>
              {shop.shortName}
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: "#57534e",
                letterSpacing: "0.12em",
                marginTop: 8,
              }}
            >
              PAINTS · PLYWOOD · HARDWARE
            </span>
          </div>
        </div>
        <p style={{ marginTop: 40, fontSize: 24, color: "#78716c" }}>Authorized Asian Paints dealer · Kotul, Maharashtra</p>
      </div>
    ),
    { ...size },
  );
}
