"use client";

import { memo, useMemo } from "react";
import { Panel } from "@/components/shared/Panel";
import { getMoonPhase, toJulianDate, getPhaseName } from "@/lib/lunar-calc";

interface CalendarPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

// Solstice/equinox dates (UTC) for 2025–2027
const SOLAR_EVENTS: Record<string, string> = {
  "2025-03-20": "Equinox",
  "2025-06-21": "Solstice",
  "2025-09-22": "Equinox",
  "2025-12-21": "Solstice",
  "2026-03-20": "Equinox",
  "2026-06-21": "Solstice",
  "2026-09-22": "Equinox",
  "2026-12-21": "Solstice",
  "2027-03-20": "Equinox",
  "2027-06-21": "Solstice",
  "2027-09-22": "Equinox",
  "2027-12-21": "Solstice",
};

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function dateKey(y: number, m: number, d: number): string {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

/** Build lunar phase map for a given month (year, monthIndex 0-based) */
function buildLunarMap(year: number, month: number): Map<string, string> {
  const map = new Map<string, string>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(Date.UTC(year, month, d, 12));
    const jd = toJulianDate(date);
    const phase = getMoonPhase(jd);
    const name = getPhaseName(phase);
    if (name === "Full Moon" || name === "New Moon") {
      map.set(dateKey(year, month, d), name);
    }
  }
  return map;
}

/** Get calendar grid cells for a month (offset to start on Monday) */
function getMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-based: Mon=0..Sun=6
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MiniMonthProps {
  year: number;
  month: number; // 0-based
  isCurrent: boolean;
  todayKey: string;
  lunarMap: Map<string, string>;
}

function MiniMonth({ year, month, isCurrent, todayKey, lunarMap }: MiniMonthProps) {
  const cells = useMemo(() => getMonthGrid(year, month), [year, month]);
  const fontSize = isCurrent ? "9px" : "8px";
  const headerSize = "9px";
  const dayHeaderSize = "7px";
  const dimOpacity = isCurrent ? 1 : 0.65;

  return (
    <div style={{ opacity: dimOpacity }}>
      {/* Month header */}
      <div
        style={{
          fontFamily: "var(--font-cinzel)",
          fontSize: headerSize,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "rgba(200, 196, 220, 0.7)",
          textAlign: "center",
          marginBottom: "3px",
        }}
      >
        {MONTH_NAMES[month]} {year}
      </div>

      {/* Day-of-week headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "0px",
          textAlign: "center",
          fontFamily: "var(--font-jetbrains)",
          fontSize: dayHeaderSize,
          color: "rgba(180, 200, 255, 0.3)",
          marginBottom: "1px",
        }}
      >
        {DAY_HEADERS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Date grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "0px",
          textAlign: "center",
          fontFamily: "var(--font-jetbrains)",
          fontSize,
        }}
      >
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e-${i}`} style={{ padding: "1px 0" }} />;
          }

          const key = dateKey(year, month, day);
          const isToday = key === todayKey;
          const colIndex = i % 7;
          const isWeekend = colIndex >= 5; // Sat=5, Sun=6
          const lunarPhase = lunarMap.get(key);
          const solarEvent = SOLAR_EVENTS[key];

          return (
            <div
              key={key}
              style={{
                padding: "1px 0",
                position: "relative",
                lineHeight: "1.3",
              }}
            >
              <span
                style={{
                  color: isToday
                    ? "#ffffff"
                    : isWeekend
                      ? "rgba(220, 230, 255, 0.35)"
                      : "rgba(220, 230, 255, 0.7)",
                  textShadow: isToday
                    ? "0 0 8px var(--accent-schumann), 0 0 16px var(--accent-schumann)"
                    : "none",
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {day}
              </span>
              {/* Markers row */}
              {(lunarPhase || solarEvent) && (
                <div
                  style={{
                    fontSize: "6px",
                    lineHeight: "1",
                    marginTop: "-1px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "1px",
                  }}
                >
                  {lunarPhase === "Full Moon" && (
                    <span style={{ color: "var(--lunar-gold)" }}>&#9679;</span>
                  )}
                  {lunarPhase === "New Moon" && (
                    <span style={{ color: "rgba(200, 196, 220, 0.4)" }}>&#9675;</span>
                  )}
                  {solarEvent && (
                    <span style={{ color: "var(--lunar-gold)", opacity: 0.7 }}>&#9670;</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const CalendarPanel = memo(function CalendarPanel({
  style,
  animationDelay,
}: CalendarPanelProps) {
  const now = new Date();
  const todayKey = dateKey(now.getFullYear(), now.getMonth(), now.getDate());

  // Three months: current + next 2
  const months = useMemo(() => {
    const result: { year: number; month: number }[] = [];
    let y = now.getFullYear();
    let m = now.getMonth();
    for (let i = 0; i < 3; i++) {
      result.push({ year: y, month: m });
      m++;
      if (m > 11) {
        m = 0;
        y++;
      }
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now.getFullYear(), now.getMonth()]);

  // Build lunar maps for all 3 months
  const lunarMaps = useMemo(
    () => months.map((m) => buildLunarMap(m.year, m.month)),
    [months],
  );

  return (
    <Panel style={style} animationDelay={animationDelay}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "6px 8px 4px",
          gap: "0px",
        }}
      >
        {/* Panel label */}
        <div className="panel-label" style={{ marginBottom: "4px" }}>
          Calendar
        </div>

        {/* Month grids */}
        {months.map((m, i) => (
          <div key={`${m.year}-${m.month}`}>
            {i > 0 && (
              <div
                style={{
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(200, 196, 220, 0.1), transparent)",
                  margin: "3px 0",
                }}
              />
            )}
            <MiniMonth
              year={m.year}
              month={m.month}
              isCurrent={i === 0}
              todayKey={todayKey}
              lunarMap={lunarMaps[i]}
            />
          </div>
        ))}
      </div>
    </Panel>
  );
});
