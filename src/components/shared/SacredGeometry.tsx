"use client";

/**
 * Flower of Life — sacred geometry background overlay.
 * Renders a classic 7-circle seed pattern with two concentric rings
 * of petals at 2–3% opacity. Positioned fixed behind all panels.
 */

const R = 120; // Base circle radius
const CX = 500; // SVG centre
const CY = 500;

/** Generate circle positions for the Flower of Life pattern */
function flowerCircles(): [number, number][] {
  const circles: [number, number][] = [];

  // Centre circle
  circles.push([CX, CY]);

  // First ring: 6 circles around centre
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    circles.push([CX + R * Math.cos(angle), CY + R * Math.sin(angle)]);
  }

  // Second ring: 6 circles at double distance + 6 between
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    circles.push([CX + R * 2 * Math.cos(angle), CY + R * 2 * Math.sin(angle)]);
  }
  for (let i = 0; i < 6; i++) {
    const angle = ((i + 0.5) / 6) * Math.PI * 2 - Math.PI / 2;
    const dist = R * Math.sqrt(3);
    circles.push([CX + dist * Math.cos(angle), CY + dist * Math.sin(angle)]);
  }

  return circles;
}

const CIRCLES = flowerCircles();

export function SacredGeometry() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full"
        style={{
          maxWidth: "min(90vh, 90vw)",
          maxHeight: "min(90vh, 90vw)",
          opacity: 0.025,
        }}
        aria-hidden="true"
      >
        {/* Outer bounding circle */}
        <circle
          cx={CX}
          cy={CY}
          r={R * 3}
          fill="none"
          stroke="rgba(205, 170, 110, 1)"
          strokeWidth={0.5}
        />

        {/* Flower of Life circles */}
        {CIRCLES.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={R}
            fill="none"
            stroke="rgba(205, 170, 110, 1)"
            strokeWidth={0.5}
          />
        ))}
      </svg>
    </div>
  );
}
