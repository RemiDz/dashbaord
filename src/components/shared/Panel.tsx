"use client";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  animationDelay?: string;
  /** Colour for alert-state border glow (e.g. "rgba(120,180,255,0.9)") */
  glowColor?: string;
}

export function Panel({ children, className = "", style, animationDelay, glowColor }: PanelProps) {
  const glowStyle: React.CSSProperties = glowColor
    ? {
        borderColor: glowColor.replace(/[\d.]+\)$/, "0.2)"),
        boxShadow: [
          `0 0 0 1px ${glowColor.replace(/[\d.]+\)$/, "0.06)")} inset`,
          `0 4px 30px rgba(0, 0, 0, 0.3)`,
          `0 0 40px ${glowColor.replace(/[\d.]+\)$/, "0.08)")}`,
        ].join(", "),
        transition: "border-color 1.5s ease, box-shadow 1.5s ease",
      }
    : { transition: "border-color 1.5s ease, box-shadow 1.5s ease" };

  return (
    <div
      className={`panel ${className}`}
      style={{
        ...style,
        ...glowStyle,
        animationDelay: animationDelay ?? "0s",
      }}
    >
      {children}
    </div>
  );
}
