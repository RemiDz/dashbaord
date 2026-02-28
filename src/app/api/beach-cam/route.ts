import { NextResponse } from "next/server";

/**
 * Beach Cam API route — serves rotating webcam snapshots from
 * exotic beaches using SkylineWebcams CDN + Bondi fallback.
 *
 * Rotates to a new beach every 5 minutes based on server time.
 */

interface BeachCam {
  name: string;
  country: string;
  snapshotUrl: string;
  utcOffset: number; // hours
  lat: number;
  lon: number;
}

const BEACHES: BeachCam[] = [
  {
    name: "Meeru Island Beach",
    country: "Maldives",
    snapshotUrl: "https://cdn.skylinewebcams.com/social814.jpg",
    utcOffset: 5,
    lat: 4.4475,
    lon: 73.7172,
  },
  {
    name: "Seminyak Beach",
    country: "Bali, Indonesia",
    snapshotUrl: "https://cdn.skylinewebcams.com/social993.jpg",
    utcOffset: 8,
    lat: -8.6915,
    lon: 115.1682,
  },
  {
    name: "Bondi Beach",
    country: "Australia",
    snapshotUrl: "https://www.weathercamnetwork.com.au/bondi_beach/982x737.jpg",
    utcOffset: 11,
    lat: -33.8915,
    lon: 151.2767,
  },
  {
    name: "Waikiki Beach",
    country: "Hawaii",
    snapshotUrl: "https://cdn.skylinewebcams.com/social5726.jpg",
    utcOffset: -10,
    lat: 21.2766,
    lon: -157.8278,
  },
  {
    name: "Copacabana Beach",
    country: "Brazil",
    snapshotUrl: "https://cdn.skylinewebcams.com/social604.jpg",
    utcOffset: -3,
    lat: -22.9711,
    lon: -43.1822,
  },
  {
    name: "Santorini",
    country: "Greece",
    snapshotUrl: "https://cdn.skylinewebcams.com/social1197.jpg",
    utcOffset: 2,
    lat: 36.3932,
    lon: 25.4615,
  },
  {
    name: "Tulum Beach",
    country: "Mexico",
    snapshotUrl: "https://cdn.skylinewebcams.com/social723.jpg",
    utcOffset: -5,
    lat: 20.2085,
    lon: -87.4654,
  },
  {
    name: "Beau Vallon Beach",
    country: "Seychelles",
    snapshotUrl: "https://cdn.skylinewebcams.com/social5.jpg",
    utcOffset: 4,
    lat: -4.6056,
    lon: 55.4308,
  },
  {
    name: "Patong Beach",
    country: "Phuket, Thailand",
    snapshotUrl: "https://cdn.skylinewebcams.com/social1818.jpg",
    utcOffset: 7,
    lat: 7.8963,
    lon: 98.2962,
  },
  {
    name: "Silver Rock Beach",
    country: "Barbados",
    snapshotUrl: "https://cdn.skylinewebcams.com/social1111.jpg",
    utcOffset: -4,
    lat: 13.0529,
    lon: -59.5088,
  },
  {
    name: "Malolo Lailai Island",
    country: "Fiji",
    snapshotUrl: "https://cdn.skylinewebcams.com/social4642.jpg",
    utcOffset: 12,
    lat: -17.7765,
    lon: 177.1065,
  },
  {
    name: "Nungwi Beach",
    country: "Zanzibar",
    snapshotUrl: "https://cdn.skylinewebcams.com/social1200.jpg",
    utcOffset: 3,
    lat: -5.7269,
    lon: 39.2960,
  },
  {
    name: "Cancun Beach",
    country: "Mexico",
    snapshotUrl: "https://cdn.skylinewebcams.com/social3216.jpg",
    utcOffset: -5,
    lat: 21.1619,
    lon: -86.8515,
  },
];

/** Get local time string at a given UTC offset */
function getLocalTime(utcOffset: number): string {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utcMs + utcOffset * 3600000);
  return local.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Get current beach index based on 5-minute rotation */
function getCurrentBeachIndex(): number {
  const fiveMinSlot = Math.floor(Date.now() / (5 * 60 * 1000));
  return fiveMinSlot % BEACHES.length;
}

export async function GET() {
  try {
    const index = getCurrentBeachIndex();
    const beach = BEACHES[index];

    // Fetch temperature from Open-Meteo (no key needed)
    let temp: number | null = null;
    try {
      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${beach.lat}&longitude=${beach.lon}` +
        `&current=temperature_2m&timezone=auto`;
      const res = await fetch(weatherUrl, { next: { revalidate: 1800 } });
      if (res.ok) {
        const data = await res.json();
        temp = Math.round(data.current?.temperature_2m ?? 0);
      }
    } catch {
      // Temperature is non-critical
    }

    return NextResponse.json({
      name: beach.name,
      country: beach.country,
      snapshotUrl: beach.snapshotUrl,
      localTime: getLocalTime(beach.utcOffset),
      temp,
      index,
      total: BEACHES.length,
    });
  } catch (error) {
    console.error("Beach cam error:", error);
    return NextResponse.json(
      { name: null, error: "Data temporarily unavailable" },
      { status: 200 },
    );
  }
}
