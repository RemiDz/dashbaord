import { NextResponse } from "next/server";

/**
 * Beach Cam Image Proxy — fetches webcam snapshots server-side to
 * bypass CORS and hotlinking restrictions.
 *
 * Falls back to Unsplash beach photos if the webcam image fails.
 */

// Same beach list as the metadata route (snapshot URLs only)
const SNAPSHOT_URLS = [
  "https://cdn.skylinewebcams.com/social814.jpg",
  "https://cdn.skylinewebcams.com/social993.jpg",
  "https://www.weathercamnetwork.com.au/bondi_beach/982x737.jpg",
  "https://cdn.skylinewebcams.com/social5726.jpg",
  "https://cdn.skylinewebcams.com/social604.jpg",
  "https://cdn.skylinewebcams.com/social1197.jpg",
  "https://cdn.skylinewebcams.com/social723.jpg",
  "https://cdn.skylinewebcams.com/social5.jpg",
  "https://cdn.skylinewebcams.com/social1818.jpg",
  "https://cdn.skylinewebcams.com/social1111.jpg",
  "https://cdn.skylinewebcams.com/social4642.jpg",
  "https://cdn.skylinewebcams.com/social1200.jpg",
  "https://cdn.skylinewebcams.com/social3216.jpg",
];

// Unsplash search terms per beach for relevant fallback photos
const UNSPLASH_QUERIES = [
  "maldives+beach+ocean",
  "bali+beach+tropical",
  "bondi+beach+sydney",
  "waikiki+beach+hawaii",
  "copacabana+beach+rio",
  "santorini+greece+sea",
  "tulum+beach+mexico",
  "seychelles+beach+tropical",
  "phuket+beach+thailand",
  "barbados+beach+caribbean",
  "fiji+beach+island",
  "zanzibar+beach+ocean",
  "cancun+beach+caribbean",
];

function getCurrentBeachIndex(): number {
  const fiveMinSlot = Math.floor(Date.now() / (5 * 60 * 1000));
  return fiveMinSlot % SNAPSHOT_URLS.length;
}

export const dynamic = "force-dynamic";

export async function GET() {
  const index = getCurrentBeachIndex();
  const webcamUrl = SNAPSHOT_URLS[index];

  // Try fetching the webcam snapshot server-side
  try {
    const res = await fetch(webcamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        "Referer": "https://www.skylinewebcams.com/",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "image/jpeg";
      // Verify it's actually an image
      if (contentType.startsWith("image/")) {
        const buffer = await res.arrayBuffer();
        // Verify minimum size (a valid JPEG should be > 1KB)
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

  // Fallback: redirect to Unsplash for a beautiful beach photo
  const query = UNSPLASH_QUERIES[index] || "tropical+beach+ocean";
  const unsplashUrl = `https://source.unsplash.com/800x600/?${query}`;

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

  // Last resort: return a 1x1 transparent pixel
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
