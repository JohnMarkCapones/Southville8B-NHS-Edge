/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title") || "Southville 8B NHS"
  const subtitle = searchParams.get("subtitle") || "Official Site"
  const bg = searchParams.get("bg") || "#0f172a" // slate-900

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: bg,
          color: "white",
          padding: 64,
          backgroundImage:
            "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.08) 2%, transparent 0%)",
          backgroundSize: "32px 32px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: "linear-gradient(135deg, #22d3ee, #6366f1)",
              borderRadius: 16,
            }}
          />
          <div style={{ fontSize: 28, opacity: 0.9 }}>Southville 8B NHS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, opacity: 0.9 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, opacity: 0.7 }}>
          <div>southville8bnhs.com</div>
          <div>Education • Community • Excellence</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // Cache for 7 days on CDN, revalidate every hour at edge
        "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=3600",
      },
    }
  )
}
