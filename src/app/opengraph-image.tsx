import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background: "#F6F4EF",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "#C62834",
            color: "#ffffff",
            fontSize: 52,
            fontWeight: 700,
            marginBottom: 36,
          }}
        >
          PB
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            color: "#17161A",
          }}
        >
          Prime Bookin
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 30,
            color: "#5C5A60",
          }}
        >
          Everything local, one cart away
        </div>
      </div>
    ),
    { ...size }
  );
}
