"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedValueProps {
  value: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Displays a value with a subtle fade/slide transition when it changes.
 * Wraps any string value — numbers, text, etc.
 */
export function AnimatedValue({ value, className, style }: AnimatedValueProps) {
  const [displayed, setDisplayed] = useState(value);
  const [animating, setAnimating] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      prevRef.current = value;
      setAnimating(true);
      // Brief fade-out then swap and fade-in
      const timer = setTimeout(() => {
        setDisplayed(value);
        setAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <span
      className={className}
      style={{
        ...style,
        transition: "opacity 0.15s ease, transform 0.15s ease",
        opacity: animating ? 0 : 1,
        transform: animating ? "translateY(4px)" : "translateY(0)",
        display: "inline-block",
      }}
    >
      {displayed}
    </span>
  );
}
