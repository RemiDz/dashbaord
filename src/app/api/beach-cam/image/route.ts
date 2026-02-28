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

  // Fallback: fetch an Unsplash beach photo
  const unsplashUrl = `https://source.unsplash.com/800x600/?${beach.unsplashQuery}`;

  try {
    const res = await fetch(unsplashUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "image/jpeg";
      const buffer = await res.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=290, stale-while-revalidate=60",
        },
      });
    }
  } catch {
    // Unsplash also failed
  }

  // Last resort: transparent pixel
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64",
  );
  return new NextResponse(pixel, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-cache",
    },
  });
}
