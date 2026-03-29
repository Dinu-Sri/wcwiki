import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") || "default";
  const title = searchParams.get("title") || "wcWIKI";
  const subtitle = searchParams.get("subtitle") || "";
  const image = searchParams.get("image");

  // Color scheme
  const bg = "#faf8f5";
  const primary = "#2563eb";
  const textDark = "#1a1a1a";
  const textMuted = "#6b7280";
  const accentWarm = "#d4a574";

  // Type-specific decorators
  const typeLabels: Record<string, string> = {
    artist: "Artist",
    painting: "Painting",
    article: "Article",
    default: "",
  };
  const typeLabel = typeLabels[type] || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: bg,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Watercolor decorative element - top right */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${accentWarm}22 0%, ${accentWarm}08 50%, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* Bottom left decorative */}
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${primary}15 0%, ${primary}05 50%, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* Content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "100%",
            padding: "60px",
            alignItems: "center",
            gap: "40px",
          }}
        >
          {/* Text side */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "center",
              gap: "16px",
            }}
          >
            {/* Site branding */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: primary,
                  letterSpacing: "-0.5px",
                }}
              >
                wcWIKI
              </div>
              {typeLabel && (
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    backgroundColor: `${primary}15`,
                    display: "flex",
                  }}
                >
                  {typeLabel}
                </div>
              )}
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: title.length > 40 ? 36 : 48,
                fontWeight: 700,
                color: textDark,
                lineHeight: 1.15,
                letterSpacing: "-0.5px",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              {title}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <div
                style={{
                  fontSize: 22,
                  color: textMuted,
                  lineHeight: 1.4,
                  display: "flex",
                }}
              >
                {subtitle}
              </div>
            )}

            {/* Bottom bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 3,
                  backgroundColor: accentWarm,
                  borderRadius: "2px",
                  display: "flex",
                }}
              />
              <div
                style={{
                  fontSize: 14,
                  color: textMuted,
                }}
              >
                The Watercolor Encyclopedia
              </div>
            </div>
          </div>

          {/* Image side */}
          {image && (
            <div
              style={{
                width: 280,
                height: 280,
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
                border: `3px solid ${accentWarm}40`,
                display: "flex",
                flexShrink: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt=""
                width={280}
                height={280}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          )}
        </div>

        {/* Bottom border accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${primary}, ${accentWarm}, ${primary})`,
            display: "flex",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=604800, s-maxage=604800",
      },
    }
  );
}
