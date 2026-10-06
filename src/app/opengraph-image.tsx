import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/brand/LogoMark";
import { shop } from "@/config/shop";

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
          <LogoMark width={120} height={120} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 56, fontWeight: 800, color: "#a3121b", letterSpacing: "-0.02em" }}>
              {shop.shortName}
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 500,
                color: "#1e2a5a",
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
