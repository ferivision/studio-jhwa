import { ImageResponse } from "next/og";
import { brandColors, SITE_NAME } from "@/config/constants";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export function renderOgImage({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: brandColors.charcoal,
        color: brandColors.plaster,
      }}
    >
      <div
        style={{
          height: 2,
          width: "100%",
          background: brandColors.glow,
          boxShadow: `0 0 32px 8px ${brandColors.glow}66`,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 72, lineHeight: 1.05, letterSpacing: "-0.02em" }}>{title}</div>
        <div style={{ fontSize: 30, color: brandColors.mist }}>{subtitle}</div>
      </div>
      <div style={{ fontSize: 28 }}>{SITE_NAME}</div>
    </div>,
    OG_SIZE,
  );
}
