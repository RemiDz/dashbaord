"use client";

import { useRef, useEffect, useState } from "react";
import { useKpIndex } from "@/hooks/useKpIndex";
import { useSchumannData } from "@/hooks/useSchumannData";
import { useLunarData } from "@/hooks/useLunarData";

interface AlertBadge {
  id: string;
  label: string;
  color: string;
  bgColor: string;
}

function Badge({ badge, exiting, onExited }: { badge: AlertBadge; exiting: boolean; onExited: () => void }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (exiting) {
      const el = ref.current;
      if (!el) { onExited(); return; }
      const handler = () => onExited();
      el.addEventListener("animationend", handler, { once: true });
      return () => el.removeEventListener("animationend", handler);
    }
  }, [exiting, onExited]);

  return (
    <span
      ref={ref}
      className={`status-badge inline-flex items-center gap-2 ${exiting ? "animate-badge-exit" : "animate-badge-enter"}`}
      style={{
        color: badge.color,
        backgroundColor: badge.bgColor,
        whiteSpace: "nowrap",
      }}
    >
      <span
        className="inline-block rounded-full animate-alert-pulse"
        style={{
          width: "6px",
          height: "6px",
          backgroundColor: badge.color,
        }}
      />
      {badge.label}
    </span>
  );
}

export function AlertBadges() {
  const { current: kp, isLoading: kpLoading } = useKpIndex();
  const { isSpike, isLoading: schLoading } = useSchumannData();
  const { isFullMoon, isNewMoon, isLoading: lunarLoading } = useLunarData();

  const active: AlertBadge[] = [];

  if (!kpLoading && kp !== null && kp >= 3) {
    active.push({
      id: "kp",
      label: "KP Spike — Post worthy",
      color: "rgba(255, 150, 80, 0.9)",
      bgColor: "rgba(255, 150, 80, 0.12)",
    });
  }

  if (!lunarLoading && isFullMoon) {
    active.push({
      id: "fullmoon",
      label: "Full Moon — Post worthy",
      color: "rgba(255, 250, 235, 0.8)",
      bgColor: "rgba(255, 250, 235, 0.08)",
    });
  }

  if (!lunarLoading && isNewMoon) {
    active.push({
      id: "newmoon",
      label: "New Moon — Post worthy",
      color: "rgba(160, 170, 220, 0.9)",
      bgColor: "rgba(160, 170, 220, 0.1)",
    });
  }

  if (!schLoading && isSpike) {
    active.push({
      id: "schumann",
      label: "Schumann Spike — Post worthy",
      color: "rgba(120, 180, 255, 0.9)",
      bgColor: "rgba(120, 180, 255, 0.1)",
    });
  }

  const [displayed, setDisplayed] = useState<AlertBadge[]>([]);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  const activeIds = new Set(active.map((b) => b.id));
  const displayedIds = new Set(displayed.map((b) => b.id));

  const toAdd = active.filter((b) => !displayedIds.has(b.id) && !exitingIds.has(b.id));
  const toRemove = displayed.filter((b) => !activeIds.has(b.id) && !exitingIds.has(b.id));

  useEffect(() => {
    if (toAdd.length > 0) {
      setDisplayed((prev) => [...prev, ...toAdd]);
    }
    if (toRemove.length > 0) {
      setExitingIds((prev) => {
        const next = new Set(prev);
        toRemove.forEach((b) => next.add(b.id));
        return next;
      });
    }
  }, [toAdd.length, toRemove.length]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleExited(id: string) {
    setDisplayed((prev) => prev.filter((b) => b.id !== id));
    setExitingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  if (displayed.length === 0) return null;

  return (
    <>
      {displayed.map((badge) => (
        <Badge
          key={badge.id}
          badge={badge}
          exiting={exitingIds.has(badge.id)}
          onExited={() => handleExited(badge.id)}
        />
      ))}
    </>
  );
}
