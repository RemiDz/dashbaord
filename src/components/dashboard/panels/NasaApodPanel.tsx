"use client";

import { memo, useState, useEffect, useRef, useCallback } from "react";
import { Panel } from "@/components/shared/Panel";

interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: "image" | "video";
  date: string;
  copyright?: string;
  thumbnail_url?: string;
}

interface NasaApodPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

const CACHE_KEY = "nasa-apod-cache";

function getCachedApod(): ApodData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as { date: string; data: ApodData };
    const today = new Date().toISOString().slice(0, 10);
    if (cached.date === today) return cached.data;
    return null;
  } catch {
    return null;
  }
}

function setCachedApod(data: ApodData) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ date: data.date, data })
    );
  } catch {
    // localStorage full or unavailable — non-critical
  }
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function msUntilMidnightUTC(): number {
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return tomorrow.getTime() - now.getTime() + 60_000; // +1min buffer
}

export const NasaApodPanel = memo(function NasaApodPanel({
  style,
  animationDelay,
}: NasaApodPanelProps) {
  const [apod, setApod] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const midnightTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchApod = useCallback(async () => {
    // Check localStorage cache first
    const cached = getCachedApod();
    if (cached) {
      setApod(cached);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    try {
      const apiKey =
        process.env.NEXT_PUBLIC_NASA_API_KEY || "DEMO_KEY";
      const res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&thumbs=true`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApodData = await res.json();
      setCachedApod(data);
      setApod(data);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount + schedule midnight UTC refresh
  useEffect(() => {
    fetchApod();

    function scheduleRefresh() {
      midnightTimerRef.current = setTimeout(() => {
        // Clear cache so fresh fetch occurs
        try { localStorage.removeItem(CACHE_KEY); } catch { /* */ }
        setImgLoaded(false);
        fetchApod();
        scheduleRefresh(); // reschedule for next midnight
      }, msUntilMidnightUTC());
    }

    scheduleRefresh();

    return () => {
      clearTimeout(midnightTimerRef.current);
    };
  }, [fetchApod]);

  // Preload the image
  useEffect(() => {
    if (!apod || apod.media_type === "video") {
      // For videos, use thumbnail if available
      if (apod?.thumbnail_url) {
        const img = new window.Image();
        img.onload = () => setImgLoaded(true);
        img.onerror = () => setImgLoaded(true); // show anyway
        img.src = apod.thumbnail_url;
      }
      return;
    }

    const img = new window.Image();
    img.onload = () => setImgLoaded(true);
    img.onerror = () => setImgLoaded(true);
    img.src = apod.hdurl || apod.url;
  }, [apod]);

  const imageUrl = apod
    ? apod.media_type === "video"
      ? apod.thumbnail_url || null
      : apod.hdurl || apod.url
    : null;

  const isFresh = apod?.date === new Date().toISOString().slice(0, 10);

  return (
    <Panel
      className="relative overflow-hidden"
      style={{ ...style, padding: 0 }}
      animationDelay={animationDelay}
    >
      {/* Shimmer loading skeleton */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(10, 20, 40, 0.9) 0%, rgba(15, 25, 50, 0.8) 50%, rgba(10, 20, 40, 0.9) 100%)",
            borderRadius: "inherit",
            zIndex: 1,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(232, 201, 122, 0.04) 50%, transparent 100%)",
              animation: "shimmer 2s ease-in-out infinite",
            }}
          />
        </div>
      )}

      {/* Background image */}
      {imageUrl && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "inherit",
            zIndex: 1,
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 300ms ease",
          }}
        />
      )}

      {/* Fallback gradient when no image */}
      {(!imageUrl && !loading) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(10, 15, 40, 0.9) 0%, rgba(20, 10, 45, 0.85) 50%, rgba(10, 20, 50, 0.9) 100%)",
            borderRadius: "inherit",
            zIndex: 1,
          }}
        />
      )}

      {/* Dark gradient overlay at bottom for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.6) 80%, rgba(0,0,0,0.85) 100%)",
          borderRadius: "inherit",
          zIndex: 2,
        }}
      />

      {/* Top-left label */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 14,
          zIndex: 4,
        }}
      >
        <span
          className="panel-label"
          style={{ color: "rgba(255, 255, 255, 0.6)" }}
        >
          Astronomy Picture of the Day
        </span>
      </div>

      {/* Status indicator — top right */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          zIndex: 4,
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            backgroundColor: isFresh
              ? "rgba(80, 220, 120, 0.9)"
              : "rgba(232, 201, 122, 0.7)",
            boxShadow: isFresh
              ? "0 0 6px rgba(80, 220, 120, 0.6)"
              : "0 0 6px rgba(232, 201, 122, 0.4)",
            animation: "breathe 2s ease-in-out infinite",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "2px",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          {isFresh ? "TODAY" : "CACHED"}
        </span>
      </div>

      {/* Hover description overlay */}
      {hovered && apod && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            background: "rgba(5, 10, 25, 0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: "inherit",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "20px 18px",
            animation: "fadeIn 200ms ease",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(11px, 0.9vw, 14px)",
              fontWeight: 600,
              letterSpacing: "0.5px",
              color: "rgba(232, 201, 122, 0.9)",
              marginBottom: 8,
            }}
          >
            {apod.title}
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(10px, 0.8vw, 13px)",
              fontWeight: 300,
              lineHeight: 1.5,
              color: "rgba(255, 255, 255, 0.75)",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 5,
              WebkitBoxOrient: "vertical",
            }}
          >
            {apod.explanation}
          </p>
        </div>
      )}

      {/* Hover target zone */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 6,
          cursor: "default",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {/* Bottom overlay with title + date */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 14px 12px",
          zIndex: 3,
        }}
      >
        {apod ? (
          <>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(13px, 1.1vw, 17px)",
                fontWeight: 600,
                letterSpacing: "1px",
                color: "rgba(255, 255, 255, 0.9)",
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {apod.title}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginTop: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(10px, 0.8vw, 13px)",
                  fontWeight: 300,
                  color: "rgba(255, 255, 255, 0.5)",
                  textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                }}
              >
                {formatDate(apod.date)}
              </span>
              {apod.copyright && (
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "clamp(9px, 0.7vw, 11px)",
                    fontWeight: 300,
                    color: "rgba(255, 255, 255, 0.35)",
                    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  }}
                >
                  &copy; {apod.copyright}
                </span>
              )}
            </div>
          </>
        ) : error ? (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(12px, 0.9vw, 15px)",
              fontStyle: "italic",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            Awaiting cosmic transmission...
          </p>
        ) : null}
      </div>
    </Panel>
  );
});
