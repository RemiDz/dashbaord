"use client";

import { memo, useMemo } from "react";
import { Panel } from "@/components/shared/Panel";
import { getMoonPhase, toJulianDate, getPhaseName } from "@/lib/lunar-calc";

interface CalendarPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Get Monday of the week containing the given date */
function getMonday(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  date.setDate(date.getDate() - diff);
  return date;
}

/** Add N days to a date */
function addDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
}

/** Build lunar phase map for a date range */
function buildLunarMap(start: Date, end: Date): Map<string, string> {
  const map = new Map<string, string>();
  const current = new Date(start);
  while (current <= end) {
    const utc = new Date(Date.UTC(current.getFullYear(), current.getMonth(), current.getDate(), 12));
    const jd = toJulianDate(utc);
    const phase = getMoonPhase(jd);
    const name = getPhaseName(phase);
    if (name === "Full Moon" || name === "New Moon") {
      map.set(dateKey(current), name);
    }
    current.setDate(current.getDate() + 1);
  }
  return map;
}

function formatRangeLabel(start: Date, end: Date): string {
  const s = `${start.getDate()} ${MONTH_NAMES_SHORT[start.getMonth()]}`;
  const e = `${end.getDate()} ${MONTH_NAMES_SHORT[end.getMonth()]}`;
  return `${s} \u2014 ${e}`;
}

export const CalendarPanel = memo(function CalendarPanel({
  style,
  animationDelay,
}: CalendarPanelProps) {
  const now = new Date();
  const todayStr = dateKey(now);

  const { weeks, rangeStart, rangeEnd, lunarMap } = useMemo(() => {
    const monday = getMonday(now);
    const rStart = new Date(monday);
    const rEnd = addDays(monday, 5 * 7 - 1); // 5 weeks

    // Build 5 weeks of date arrays
    const wks: Date[][] = [];
    for (let w = 0; w < 5; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(addDays(monday, w * 7 + d));
      }
      wks.push(week);
    }

    const lunar = buildLunarMap(rStart, rEnd);

    return { weeks: wks, rangeStart: rStart, rangeEnd: rEnd, lunarMap: lunar };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now.getFullYear(), now.getMonth(), now.getDate()]);

  return (
    <Panel style={style} animationDelay={animationDelay}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "8px 10px 6px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "6px" }}>
          <div className="panel-label" style={{ marginBottom: "2px" }}>
            Calendar
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              fontFamily: "var(--font-cinzel)",
              fontSize: "10px",
              letterSpacing: "0.08em",
              color: "rgba(200, 196, 220, 0.5)",
            }}
          >
            <span>{MONTH_NAMES[now.getMonth()]} {now.getFullYear()}</span>
            <span style={{ fontSize: "8px" }}>
              {formatRangeLabel(rangeStart, rangeEnd)}
            </span>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            textAlign: "center",
            fontFamily: "var(--font-cinzel)",
            fontSize: "12px",
            letterSpacing: "0.1em",
            color: "rgba(180, 200, 255, 0.35)",
            marginBottom: "4px",
          }}
        >
          {DAY_HEADERS.map((d, i) => (
            <div
              key={d}
              style={{
                color: i >= 5 ? "rgba(255, 200, 120, 0.35)" : undefined,
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Week rows */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
          {weeks.map((week, wi) => (
            <div key={wi}>
              {wi > 0 && (
                <div
                  style={{
                    height: "1px",
                    background: "linear-gradient(90deg, transparent, rgba(200, 196, 220, 0.08), transparent)",
                    marginBottom: "2px",
                  }}
                />
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  textAlign: "center",
                }}
              >
                {week.map((date, di) => {
                  const key = dateKey(date);
                  const isToday = key === todayStr;
                  const isWeekend = di >= 5;
                  const isPast = wi === 0 && date < now && !isToday;
                  const lunarPhase = lunarMap.get(key);

                  // Month boundary: show label if this is the 1st of a month
                  const isFirstOfMonth = date.getDate() === 1;

                  return (
                    <div
                      key={key}
                      style={{
                        position: "relative",
                        padding: "3px 0",
                        opacity: isPast ? 0.3 : 1,
                      }}
                    >
                      {/* Month boundary label */}
                      {isFirstOfMonth && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-1px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontFamily: "var(--font-cinzel)",
                            fontSize: "6px",
                            letterSpacing: "0.08em",
                            color: "rgba(200, 196, 220, 0.4)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {MONTH_NAMES_SHORT[date.getMonth()]}
                        </div>
                      )}

                      {/* Today glow ring */}
                      {isToday && (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "clamp(24px, 2vw, 32px)",
                            height: "clamp(24px, 2vw, 32px)",
                            borderRadius: "50%",
                            background: "radial-gradient(circle, rgba(120, 180, 255, 0.2) 0%, transparent 70%)",
                            boxShadow: "0 0 12px rgba(120, 180, 255, 0.3), 0 0 24px rgba(120, 180, 255, 0.1)",
                          }}
                        />
                      )}

                      {/* Date number */}
                      <span
                        style={{
                          position: "relative",
                          fontFamily: "var(--font-jetbrains)",
                          fontSize: "clamp(16px, 1.4vw, 22px)",
                          fontWeight: isToday ? 700 : 400,
                          color: isToday
                            ? "#ffffff"
                            : isWeekend
                              ? "rgba(255, 200, 120, 0.7)"
                              : "rgba(220, 230, 255, 0.7)",
                          textShadow: isToday
                            ? "0 0 10px var(--accent-schumann), 0 0 20px var(--accent-schumann)"
                            : "none",
                        }}
                      >
                        {date.getDate()}
                      </span>

                      {/* Lunar marker */}
                      {lunarPhase && (
                        <div
                          style={{
                            fontSize: "7px",
                            lineHeight: "1",
                            marginTop: "-2px",
                          }}
                        >
                          {lunarPhase === "Full Moon" && (
                            <span style={{ color: "var(--lunar-gold)" }}>&#9679;</span>
                          )}
                          {lunarPhase === "New Moon" && (
                            <span style={{ color: "rgba(200, 196, 220, 0.45)" }}>&#9675;</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
});
