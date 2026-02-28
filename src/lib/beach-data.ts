/**
 * Curated beach webcam list with timezone offsets for daytime filtering.
 * Spread across UTC-10 to UTC+12 for 24-hour coverage.
 */

export interface BeachCam {
  name: string;
  country: string;
  snapshotUrl: string;
  unsplashQuery: string;
  utcOffset: number;
  lat: number;
  lon: number;
}

export const BEACHES: BeachCam[] = [
  // UTC -10
  {
    name: "Waikiki Beach",
    country: "Hawaii",
    snapshotUrl: "https://cdn.skylinewebcams.com/social5726.jpg",
    unsplashQuery: "waikiki+beach+hawaii",
    utcOffset: -10,
    lat: 21.2766,
    lon: -157.8278,
  },
  // UTC -5
  {
    name: "Tulum Beach",
    country: "Mexico",
    snapshotUrl: "https://cdn.skylinewebcams.com/social723.jpg",
    unsplashQuery: "tulum+beach+mexico",
    utcOffset: -5,
    lat: 20.2085,
    lon: -87.4654,
  },
  {
    name: "Cancun Beach",
    country: "Mexico",
    snapshotUrl: "https://cdn.skylinewebcams.com/social3216.jpg",
    unsplashQuery: "cancun+beach+caribbean",
    utcOffset: -5,
    lat: 21.1619,
    lon: -86.8515,
  },
  // UTC -4
  {
    name: "Silver Rock Beach",
    country: "Barbados",
    snapshotUrl: "https://cdn.skylinewebcams.com/social1111.jpg",
    unsplashQuery: "barbados+beach+caribbean",
    utcOffset: -4,
    lat: 13.0529,
    lon: -59.5088,
  },
  // UTC -3
  {
    name: "Copacabana Beach",
    country: "Brazil",
    snapshotUrl: "https://cdn.skylinewebcams.com/social604.jpg",
    unsplashQuery: "copacabana+beach+rio",
    utcOffset: -3,
    lat: -22.9711,
    lon: -43.1822,
  },
  // UTC +2
  {
    name: "Santorini",
    country: "Greece",
    snapshotUrl: "https://cdn.skylinewebcams.com/social1197.jpg",
    unsplashQuery: "santorini+greece+sea",
    utcOffset: 2,
    lat: 36.3932,
    lon: 25.4615,
  },
  // UTC +3
  {
    name: "Nungwi Beach",
    country: "Zanzibar",
    snapshotUrl: "https://cdn.skylinewebcams.com/social1200.jpg",
    unsplashQuery: "zanzibar+beach+ocean",
    utcOffset: 3,
    lat: -5.7269,
    lon: 39.2960,
  },
  // UTC +4
  {
    name: "Beau Vallon Beach",
    country: "Seychelles",
    snapshotUrl: "https://cdn.skylinewebcams.com/social5.jpg",
    unsplashQuery: "seychelles+beach+tropical",
    utcOffset: 4,
    lat: -4.6056,
    lon: 55.4308,
  },
  // UTC +5
  {
    name: "Meeru Island Beach",
    country: "Maldives",
    snapshotUrl: "https://cdn.skylinewebcams.com/social814.jpg",
    unsplashQuery: "maldives+beach+ocean",
    utcOffset: 5,
    lat: 4.4475,
    lon: 73.7172,
  },
  // UTC +7
  {
    name: "Patong Beach",
    country: "Phuket, Thailand",
    snapshotUrl: "https://cdn.skylinewebcams.com/social1818.jpg",
    unsplashQuery: "phuket+beach+thailand",
    utcOffset: 7,
    lat: 7.8963,
    lon: 98.2962,
  },
  // UTC +8
  {
    name: "Seminyak Beach",
    country: "Bali, Indonesia",
    snapshotUrl: "https://cdn.skylinewebcams.com/social993.jpg",
    unsplashQuery: "bali+beach+tropical",
    utcOffset: 8,
    lat: -8.6915,
    lon: 115.1682,
  },
  // UTC +11
  {
    name: "Bondi Beach",
    country: "Australia",
    snapshotUrl: "https://www.weathercamnetwork.com.au/bondi_beach/982x737.jpg",
    unsplashQuery: "bondi+beach+sydney",
    utcOffset: 11,
    lat: -33.8915,
    lon: 151.2767,
  },
  // UTC +12
  {
    name: "Malolo Lailai Island",
    country: "Fiji",
    snapshotUrl: "https://cdn.skylinewebcams.com/social4642.jpg",
    unsplashQuery: "fiji+beach+island",
    utcOffset: 12,
    lat: -17.7765,
    lon: 177.1065,
  },
];

/** Get local hour (0-23) at a given UTC offset */
function getLocalHour(utcOffset: number): number {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utcMs + utcOffset * 3600000);
  return local.getHours();
}

/** Get local time string at a given UTC offset */
export function getLocalTime(utcOffset: number): string {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utcMs + utcOffset * 3600000);
  return local.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Filter beaches to those currently in daylight (07:00–18:00 local) */
export function getDaytimeBeaches(): BeachCam[] {
  const daytime = BEACHES.filter((b) => {
    const hour = getLocalHour(b.utcOffset);
    return hour >= 7 && hour < 18;
  });
  // Fallback: if no beaches are in daylight, return all
  return daytime.length > 0 ? daytime : BEACHES;
}

/** Get the current daytime beach based on 5-minute rotation */
export function getCurrentDaytimeBeach(): { beach: BeachCam; index: number; total: number } {
  const eligible = getDaytimeBeaches();
  const fiveMinSlot = Math.floor(Date.now() / (5 * 60 * 1000));
  const index = fiveMinSlot % eligible.length;
  return { beach: eligible[index], index, total: eligible.length };
}
