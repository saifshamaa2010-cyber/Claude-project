import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { appear, EASE_IN_OUT } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Shell } from "../components/Shell";
import { COLORS, FONTS } from "../theme";
import type { SceneProps } from "../types";

const Hazard: React.FC<{ top: number; frame: number }> = ({ top, frame }) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      right: 0,
      height: 46,
      backgroundImage: `repeating-linear-gradient(-45deg, ${COLORS.danger} 0px, ${COLORS.danger} 26px, #000 26px, #000 52px)`,
      backgroundPosition: `${frame * 2}px 0px`,
      opacity: 0.85,
    }}
  />
);

export const DisclaimerScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const s = appear(frame, 3, 8);
  const shake = frame < 12 ? (random(`ds-${frame}`) - 0.5) * 20 * (1 - frame / 12) : 0;
  return (
    <Shell scene={scene} chapterNum={chapterNum} accent={COLORS.danger} push={false}>
      <Backdrop accent={COLORS.danger} />
      <Hazard top={150} frame={frame} />
      <Hazard top={884} frame={-frame} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            padding: "10px 60px",
            border: `10px solid ${COLORS.danger}`,
            fontFamily: FONTS.display,
            fontSize: 270,
            lineHeight: 1,
            letterSpacing: 16,
            color: COLORS.danger,
            rotate: "-4deg",
            opacity: s,
            scale: interpolate(s, [0, 1], [1.6, 1]),
            translate: `${shake}px ${shake * 0.5}px`,
            textShadow: `0 0 40px ${COLORS.danger}88`,
          }}
        >
          {scene.text}
        </div>
        <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 44, color: COLORS.text, marginTop: 60, opacity: appear(frame, 14) }}>{scene.sub}</div>
      </AbsoluteFill>
    </Shell>
  );
};

/** One rumor per scene with a status badge and a credibility gauge. */
export const RumorScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const color: string = scene.statusColor;
  const a = appear(frame, 2, 14);
  const b = appear(frame, 8, 16);
  const big = appear(frame, 14, 10);
  const body = appear(frame, 22, 18);
  const meter = interpolate(frame, [20, 70], [0, scene.meter], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const R = 200;
  const circ = 2 * Math.PI * R;
  const arc = 0.75;

  return (
    <Shell scene={scene} chapterNum={chapterNum} accent={color}>
      <Backdrop accent={color} />
      <div style={{ position: "absolute", left: 120, top: 110, height: 860, width: 1060, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, opacity: a }}>
          <div style={{ fontFamily: FONTS.label, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: COLORS.dim }}>
            RUMOR {scene.index}/{scene.total}
          </div>
          <div style={{ padding: "6px 18px", background: color, color: "#000", fontFamily: FONTS.label, fontWeight: 700, fontSize: 28, letterSpacing: 5 }}>{scene.status}</div>
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 88, letterSpacing: 6, color, marginTop: 30, opacity: b }}>{scene.title}</div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: String(scene.big).length > 9 ? 190 : 230,
            lineHeight: 0.9,
            color: COLORS.text,
            letterSpacing: 4,
            opacity: big,
            scale: interpolate(big, [0, 1], [1.25, 1]),
            transformOrigin: "left center",
          }}
        >
          {scene.big}
        </div>
        <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 40, lineHeight: 1.35, color: COLORS.text, marginTop: 36, opacity: body, maxWidth: 1040 }}>{scene.body}</div>
      </div>
      <div style={{ position: "absolute", left: 1300, top: 290, width: 500, height: 500, opacity: a }}>
        <svg width={500} height={500}>
          <g transform="rotate(135 250 250)">
            <circle cx={250} cy={250} r={R} fill="none" stroke="#ffffff1a" strokeWidth={26} strokeDasharray={`${circ * arc} ${circ}`} strokeLinecap="round" />
            <circle
              cx={250}
              cy={250}
              r={R}
              fill="none"
              stroke={color}
              strokeWidth={26}
              strokeDasharray={`${circ * arc * meter} ${circ}`}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 14px ${color})` }}
            />
          </g>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 150, lineHeight: 1, color: COLORS.text }}>{Math.round(meter * 100)}%</div>
          <div style={{ fontFamily: FONTS.label, fontWeight: 500, fontSize: 28, letterSpacing: 6, color: COLORS.dim }}>CREDIBILITY</div>
        </div>
        <div style={{ position: "absolute", top: 470, left: 0, right: 0, textAlign: "center", fontFamily: FONTS.body, fontStyle: "italic", fontSize: 24, color: COLORS.dim }}>
          our estimate, not Marvel's
        </div>
      </div>
    </Shell>
  );
};
