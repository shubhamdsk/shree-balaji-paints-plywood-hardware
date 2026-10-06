import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/brand/LogoMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <LogoMark width={150} height={150} />
      </div>
    ),
    { ...size },
  );
}
