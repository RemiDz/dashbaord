"use client";

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  animationDelay?: string;
  /** Colour for alert-state border glow (e.g. "rgba(230,130,80,0.95)") */
  glowColor?: string;
}

export function Panel({ children, className = "", style, animationDelay, glowColor }: PanelProps) {
  const glowStyle: React.CSSProperties = glowColor
    ? {
        borderColor: glowColor.replace(/[\d.]+\)$/, "0.35)"),
        boxShadow: `0 0 12px ${glowColor.replace(/[\d.]+\)$/, "0.1)")}, inset 0 0 12px ${glowColor.replace(/[\d.]+\)$/, "0.04)")}`,
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
