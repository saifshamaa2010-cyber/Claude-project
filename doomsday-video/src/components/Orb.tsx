import React from "react";

/** Wireframe "universe" globe with a soft glow. `spin` is in radians. */
export const Orb: React.FC<{ color: string; size: number; spin: number; style?: React.CSSProperties }> = ({ color, size, spin, style }) => {
  const r = size / 2;
  const meridians = new Array(6).fill(0).map((_, i) => {
    const theta = (i / 6) * Math.PI + spin;
    return Math.abs(Math.cos(theta)) * r;
  });
  const parallels = [-0.6, -0.3, 0, 0.3, 0.6];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        boxShadow: `0 0 ${size * 0.25}px ${color}66, inset 0 0 ${size * 0.2}px ${color}55`,
        background: `radial-gradient(circle at 35% 30%, ${color}aa 0%, ${color}33 35%, rgba(0,0,0,0.85) 75%)`,
        position: "relative",
        ...style,
      }}
    >
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <g fill="none" stroke={color} strokeWidth={1.4} opacity={0.75}>
          <circle cx={r} cy={r} r={r - 1} />
          {meridians.map((rx, i) => (
            <ellipse key={i} cx={r} cy={r} rx={Math.max(0.5, rx)} ry={r - 1} opacity={0.6} />
          ))}
          {parallels.map((p, i) => {
            const y = r + p * r;
            const w = Math.sqrt(1 - p * p) * r;
            return <ellipse key={i} cx={r} cy={y} rx={w} ry={w * 0.18} opacity={0.5} />;
          })}
        </g>
      </svg>
    </div>
  );
};
