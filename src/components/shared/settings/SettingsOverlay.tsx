"use client";

import { useEffect, useState } from "react";
import { useSettings, THEMES, CLOCKS, type ThemeId, type ClockId } from "@/contexts/SettingsContext";

/** Tiny cog icon anchored bottom-right. Fades in on hover/tap. */
export function SettingsOverlay() {
  const { theme, clock, setTheme, setClock } = useSettings();
  const [open, setOpen] = useState(false);
  const [hinting, setHinting] = useState(true);

  // Fade the trigger back in briefly on idle interaction so it's
  // discoverable on a wall monitor without being distracting.
  useEffect(() => {
    if (open) {
      setHinting(true);
      return;
    }
    const id = setTimeout(() => setHinting(false), 4000);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open dashboard settings"
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 30,
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "rgba(8, 8, 20, 0.55)",
          border: "1px solid var(--border-brass)",
          color: "var(--moonsilver)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          opacity: open ? 0 : hinting ? 0.6 : 0.12,
          transition: "opacity 1.2s ease, transform 0.3s ease",
          pointerEvents: open ? "none" : "auto",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = hinting ? "0.6" : "0.18")}
      >
        <CogIcon />
      </button>

      {open && (
        <SettingsPanel
          theme={theme}
          clock={clock}
          onThemeChange={setTheme}
          onClockChange={setClock}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function CogIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M19.4 13a7.8 7.8 0 0 0 0-2l2-1.6-2-3.5-2.4.8a7.8 7.8 0 0 0-1.7-1l-.4-2.5h-4l-.4 2.5a7.8 7.8 0 0 0-1.7 1L6.4 5.9l-2 3.5L6.6 11a7.8 7.8 0 0 0 0 2l-2 1.6 2 3.5 2.4-.8a7.8 7.8 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.8 7.8 0 0 0 1.7-1l2.4.8 2-3.5-2.2-1.6Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PanelProps {
  theme: ThemeId;
  clock: ClockId;
  onThemeChange: (id: ThemeId) => void;
  onClockChange: (id: ClockId) => void;
  onClose: () => void;
}

function SettingsPanel({ theme, clock, onThemeChange, onClockChange, onClose }: PanelProps) {
  const [tab, setTab] = useState<"themes" | "clock">("themes");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Dashboard preferences"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        background: "rgba(3, 3, 12, 0.65)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 200ms ease",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(780px, 92vw)",
          maxHeight: "86vh",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, rgba(240, 238, 248, 0.03) 0%, rgba(200, 196, 220, 0.06) 50%, rgba(240, 238, 248, 0.02) 100%)",
          border: "1px solid var(--border-brass-strong)",
          borderRadius: 18,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 1px rgba(200,196,220,0.05) inset",
          backdropFilter: "blur(22px) saturate(1.2)",
          WebkitBackdropFilter: "blur(22px) saturate(1.2)",
          padding: "18px 22px 20px",
          color: "var(--text-primary)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <p className="panel-label" style={{ letterSpacing: 4 }}>Dashboard</p>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(18px, 1.6vw, 22px)",
                fontStyle: "italic",
                color: "var(--text-primary)",
                marginTop: 2,
              }}
            >
              Ambience
            </p>
          </div>
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              border: "1px solid var(--border-brass)",
              background: "rgba(0,0,0,0.25)",
              color: "var(--moonsilver)",
              borderRadius: "50%",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid var(--border-brass)" }}>
          {(["themes", "clock"] as const).map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 11,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  padding: "10px 14px",
                  background: "transparent",
                  border: "none",
                  color: active ? "var(--accent-gold)" : "var(--text-label)",
                  borderBottom: active ? "1px solid var(--accent-gold)" : "1px solid transparent",
                  marginBottom: -1,
                  cursor: "pointer",
                  transition: "color 0.2s ease, border-color 0.2s ease",
                }}
              >
                {t === "themes" ? "Theme" : "Clock Face"}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", paddingRight: 4 }}>
          {tab === "themes" ? (
            <ThemeGrid selected={theme} onSelect={onThemeChange} />
          ) : (
            <ClockGrid selected={clock} onSelect={onClockChange} />
          )}
        </div>
      </div>
    </div>
  );
}

function ThemeGrid({ selected, onSelect }: { selected: ThemeId; onSelect: (id: ThemeId) => void }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: 10,
      }}
    >
      {THEMES.map((t) => {
        const active = t.id === selected;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 8,
              padding: 12,
              background: "rgba(0,0,0,0.25)",
              border: `1px solid ${active ? "var(--accent-gold)" : "var(--border-brass)"}`,
              borderRadius: 12,
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color 0.25s ease, transform 0.2s ease",
              boxShadow: active ? "0 0 20px rgba(232, 201, 122, 0.18)" : "none",
            }}
          >
            <div style={{ display: "flex", gap: 6, width: "100%" }}>
              {t.swatches.map((c, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 22,
                    borderRadius: 6,
                    background: c,
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                  }}
                />
              ))}
            </div>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 12,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: active ? "var(--accent-gold)" : "var(--text-primary)",
                }}
              >
                {t.name}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginTop: 2,
                }}
              >
                {t.tagline}
              </p>
            </div>
            {active && <ActiveDot />}
          </button>
        );
      })}
    </div>
  );
}

function ClockGrid({ selected, onSelect }: { selected: ClockId; onSelect: (id: ClockId) => void }) {
  const groups: { label: string; kind: "analog" | "digital" | "innovative" }[] = [
    { label: "Analog", kind: "analog" },
    { label: "Digital", kind: "digital" },
    { label: "Innovative", kind: "innovative" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {groups.map((g) => (
        <div key={g.kind}>
          <p className="data-label" style={{ marginBottom: 8 }}>{g.label}</p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
              gap: 8,
            }}
          >
            {CLOCKS.filter((c) => c.kind === g.kind).map((c) => {
              const active = c.id === selected;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c.id)}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    padding: "10px 12px",
                    background: "rgba(0,0,0,0.25)",
                    border: `1px solid ${active ? "var(--accent-gold)" : "var(--border-brass)"}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "border-color 0.25s ease",
                    boxShadow: active ? "0 0 20px rgba(232, 201, 122, 0.18)" : "none",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 11.5,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: active ? "var(--accent-gold)" : "var(--text-primary)",
                    }}
                  >
                    {c.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 12.5,
                      fontStyle: "italic",
                      color: "var(--text-secondary)",
                      marginTop: 2,
                    }}
                  >
                    {c.description}
                  </p>
                  {active && <ActiveDot />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActiveDot() {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "var(--accent-gold)",
        boxShadow: "0 0 8px var(--accent-gold)",
      }}
    />
  );
}
