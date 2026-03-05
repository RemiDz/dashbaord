import { NextResponse } from "next/server";
import { getCurrentDaytimeBeach } from "@/lib/beach-data";

/**
 * Beach Cam Image Proxy — fetches the current daytime beach's snapshot
 * server-side to bypass CORS and hotlinking restrictions.
 * Falls back to Unsplash beach photos if the webcam image fails.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const { beach } = getCurrentDaytimeBeach();

  // Try fetching the webcam snapshot server-side
  try {
    const res = await fetch(beach.snapshotUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        "Referer": "https://www.skylinewebcams.com/",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "image/jpeg";
      if (contentType.startsWith("image/")) {
        const buffer = await res.arrayBuffer();
        if (buffer.byteLength > 1024) {
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=55, stale-while-revalidate=30",
            },
          });
        }
      }
    }
  } catch {
    // Webcam fetch failed, fall through to Unsplash
  }

  // Fallback: return a minimal SVG ocean gradient placeholder
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a284f"/>
      <stop offset="50%" stop-color="#0f3d6e"/>
      <stop offset="100%" stop-color="#1a5c8a"/>
    </linearGradient></defs>
    <rect width="800" height="600" fill="url(#g)"/>
  </svg>`;
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=60",
    },
  });
}
