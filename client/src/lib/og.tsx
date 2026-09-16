import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";

/**
 * Shared 1200×630 Open Graph card used by the opengraph-image.tsx routes
 * under blog/[slug] and projects/[slug].
 *
 * Satori can't parse woff2, so src/assets/og/ holds static TTF instances
 * pinned from the same @fontsource-variable files the site itself loads
 * (regenerate with fonttools varLib.instancer if the fonts ever change).
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const NAVY = "#0F172A";
const BLUE = "#2563eb";
const BLUE_LIGHT = "#60a5fa";
const GRAY = "#94A3B8";

async function loadFont(file: string) {
  return readFile(path.join(process.cwd(), "src/assets/og", file));
}

export interface OgCardProps {
  /** Small uppercase line above the title (tags, industry, section name). */
  eyebrow: string;
  title: string;
  /** Grey line under the title (date · reading time, price, …). */
  meta?: string;
}

export async function renderOgImage({ eyebrow, title, meta }: OgCardProps) {
  const [heading, headingMedium, body] = await Promise.all([
    loadFont("PlusJakartaSans-Bold.ttf"),
    loadFont("PlusJakartaSans-Medium.ttf"),
    loadFont("Outfit-Regular.ttf"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: NAVY,
          backgroundImage: `radial-gradient(circle at 85% -10%, rgba(37, 99, 235, 0.35), transparent 55%), radial-gradient(circle at -5% 110%, rgba(37, 99, 235, 0.18), transparent 45%)`,
          fontFamily: "Outfit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              backgroundColor: BLUE,
            }}
          />
          <div style={{ fontSize: 28, color: "#E2E8F0" }}>ruudjuffermans.nl</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Plus Jakarta Sans Medium",
              fontSize: 24,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: BLUE_LIGHT,
              marginBottom: 24,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontFamily: "Plus Jakarta Sans",
              fontSize: title.length > 70 ? 52 : 62,
              lineHeight: 1.15,
              color: "#F8FAFC",
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {meta ? (
            <div style={{ fontSize: 26, color: GRAY, marginTop: 28 }}>{meta}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", width: 120, height: 6, backgroundColor: BLUE }} />
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Plus Jakarta Sans", data: heading, weight: 700, style: "normal" },
        { name: "Plus Jakarta Sans Medium", data: headingMedium, weight: 500, style: "normal" },
        { name: "Outfit", data: body, weight: 400, style: "normal" },
      ],
    },
  );
}
