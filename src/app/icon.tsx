import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/brand/LogoMark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 14,
        }}
      >
        <LogoMark width={58} height={58} />
      </div>
    ),
    { ...size },
  );
}
