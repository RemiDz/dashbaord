"use client";

import { memo, useState, useEffect, useRef } from "react";
import { Panel } from "@/components/shared/Panel";
import { useBeachCam } from "@/hooks/useBeachCam";

interface BeachCamPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

export const BeachCamPanel = memo(function BeachCamPanel({
  style,
  animationDelay,
}: BeachCamPanelProps) {
  const { name, country, snapshotUrl, localTime, temp, isLoading, error } =
    useBeachCam();

  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [prevImgSrc, setPrevImgSrc] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [fading, setFading] = useState(false);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // When snapshot URL changes, trigger crossfade
  useEffect(() => {
    if (!snapshotUrl) return;

    // Append cache-busting timestamp
    const bustUrl = `${snapshotUrl}${snapshotUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;

    // Preload the new image
    const img = new Image();
    img.onload = () => {
      setImgError(false);
      setPrevImgSrc(imgSrc);
      setImgSrc(bustUrl);
      setFading(true);

      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = setTimeout(() => {
        setFading(false);
        setPrevImgSrc(null);
      }, 1200);
    };
    img.onerror = () => {
      setImgError(true);
    };
    img.src = bustUrl;

    return () => clearTimeout(fadeTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotUrl]);

  const hasData = name !== null && !imgError;

  return (
    <Panel
      className="relative overflow-hidden"
      style={{ ...style, padding: 0 }}
      animationDelay={animationDelay}
    >
      {/* Background image layers for crossfade */}
      {prevImgSrc && fading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${prevImgSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "inherit",
            zIndex: 0,
            opacity: 1,
            transition: "opacity 1.2s ease",
          }}
        />
      )}
      {imgSrc && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${imgSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "inherit",
            zIndex: 1,
            opacity: fading ? 0 : 1,
            animation: fading ? "beachCamFadeIn 1.2s ease forwards" : undefined,
          }}
        />
      )}

      {/* Fallback gradient when no image */}
      {(!imgSrc || imgError) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(10, 40, 80, 0.8) 0%, rgba(5, 20, 50, 0.9) 50%, rgba(15, 50, 90, 0.7) 100%)",
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
            "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.65) 85%, rgba(0,0,0,0.8) 100%)",
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
          zIndex: 3,
        }}
      >
        <span
          className="panel-label"
          style={{ color: "rgba(255, 255, 255, 0.6)" }}
        >
          Beach Cam
        </span>
      </div>

      {/* LIVE indicator — top right */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          zIndex: 3,
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
            backgroundColor: hasData
              ? "rgba(80, 220, 120, 0.9)"
              : "rgba(255, 80, 60, 0.7)",
            boxShadow: hasData
              ? "0 0 6px rgba(80, 220, 120, 0.6)"
              : "0 0 6px rgba(255, 80, 60, 0.4)",
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
          LIVE
        </span>
      </div>

      {/* Bottom overlay with location info */}
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
        {hasData ? (
          <>
            {/* Location name */}
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(13px, 1.1vw, 17px)",
                fontWeight: 600,
                letterSpacing: "1px",
                color: "rgba(255, 255, 255, 0.9)",
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              {name}
            </p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(11px, 0.85vw, 14px)",
                fontWeight: 300,
                color: "rgba(255, 255, 255, 0.55)",
                textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                marginTop: 1,
              }}
            >
              {country}
            </p>

            {/* Time + temp row */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 12,
                marginTop: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(14px, 1.1vw, 18px)",
                  fontWeight: 300,
                  color: "rgba(255, 255, 255, 0.75)",
                  textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                }}
              >
                {localTime}
              </span>
              {temp !== null && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(13px, 1vw, 16px)",
                    fontWeight: 300,
                    color: "rgba(232, 201, 122, 0.8)",
                    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  }}
                >
                  {temp}°C
                </span>
              )}
            </div>
          </>
        ) : (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(14px, 1.1vw, 18px)",
              fontStyle: "italic",
              color: "rgba(255, 255, 255, 0.4)",
            }}
          >
            {isLoading ? "Connecting..." : error ? "Awaiting signal..." : "Connecting..."}
          </p>
        )}
      </div>
    </Panel>
  );
});
