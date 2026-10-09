import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

const PARTICLES = new Array(46).fill(0).map((_, i) => ({
  x: random(`px-${i}`) * 1920,
  y: random(`py-${i}`) * 1080,
  size: 2 + random(`ps-${i}`) * 5,
  speed: 0.25 + random(`pv-${i}`) * 0.9,
  drift: (random(`pd-${i}`) - 0.5) * 0.6,
  alpha: 0.15 + random(`pa-${i}`) * 0.45,
}));

/** Persistent animated background: glow, hex grid, embers, vignette. */
export const Backdrop: React.FC<{ accent?: string; intensity?: number }> = ({
  accent = COLORS.doom,
  intensity = 1,
}) => {
  const frame = useCurrentFrame();
  const gx = 50 + Math.sin(frame / 160) * 18;
  const gy = 45 + Math.cos(frame / 210) * 12;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 55% at ${gx}% ${gy}%, ${accent}33 0%, ${accent}0d 45%, transparent 75%)`,
          opacity: intensity,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 40% 35% at ${100 - gx}% ${100 - gy}%, ${COLORS.doom}1f 0%, transparent 70%)`,
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.07 }}>
        <defs>
          <pattern id="hex" width={56} height={97} patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${(frame * 0.3) % 97})`}>
            <path d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L28 97" fill="none" stroke={accent} strokeWidth={1.2} />
          </pattern>
        </defs>
        <rect width={1920} height={1080} fill="url(#hex)" />
      </svg>
      {PARTICLES.map((p, i) => {
        const y = (((p.y - frame * p.speed * 1.6) % 1180) + 1180) % 1180 - 50;
        const x = p.x + Math.sin((frame + i * 40) / 60) * 30 * p.drift * 4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
              opacity: p.alpha * intensity,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 85% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.85) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Film grain + subtle scanlines on top of everything. */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const ox = Math.floor(random(`gx-${frame}`) * 480);
  const oy = Math.floor(random(`gy-${frame}`) * 420);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      <Img
        src={staticFile("textures/noise.jpg")}
        style={{
          position: "absolute",
          width: 2400,
          height: 1500,
          left: -ox,
          top: -oy,
          opacity: 0.07,
          mixBlendMode: "overlay",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 4px)",
          opacity: 0.35,
        }}
      />
    </AbsoluteFill>
  );
};
