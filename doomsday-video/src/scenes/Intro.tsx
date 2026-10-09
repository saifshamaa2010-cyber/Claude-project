import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { activeLine, appear, EASE_OUT, sceneFade } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Emblem } from "../components/Emblem";
import { COLORS, FONTS } from "../theme";
import type { SceneProps } from "../types";

/** Kinetic-typography hook: one slammed-in word block per narration line. */
export const ColdOpen: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const idx = activeLine(scene.lines, frame);
  const line = scene.lines[idx];
  const local = frame - (line.from - 4);
  const slam = appear(local, 0, 9);
  const shake = local < 8 ? (random(`sh-${frame}`) - 0.5) * 18 * (1 - local / 8) : 0;
  const isDoom = line.kicker === "DOOM";
  // the same scene is reused in the vertical Short
  const vertical = useVideoConfig().height > useVideoConfig().width;

  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, scene.durationInFrames, 1, 10) }}>
      <Backdrop intensity={isDoom ? 1.6 : 0.8} />
      {/* letterbox */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 110, background: "#000" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 110, background: "#000" }} />
      {isDoom ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 0.22 * slam }}>
          <Emblem kind="mask" color={COLORS.doom} size={vertical ? 900 : 760} strokeWidth={3} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: isDoom ? 340 : vertical ? 190 : 210,
            lineHeight: 1,
            color: COLORS.text,
            letterSpacing: interpolate(slam, [0, 1], [40, isDoom ? 24 : 6]),
            scale: interpolate(slam, [0, 1], [1.35, 1]),
            opacity: slam,
            translate: `${shake}px ${shake * 0.6}px`,
            textAlign: "center",
            maxWidth: vertical ? 940 : 1700,
            // gradient text can't take a text-shadow (it paints over the fill), so DOOM glows via filter instead
            textShadow: isDoom
              ? undefined
              : `${(1 - slam) * 14 + 3}px 0 0 rgba(255,40,80,0.55), ${-(1 - slam) * 14 - 3}px 0 0 rgba(40,220,255,0.45), 0 0 60px ${COLORS.doom}55`,
            filter: isDoom ? `drop-shadow(0 0 ${30 + (1 - slam) * 40}px ${COLORS.doom}aa)` : undefined,
            backgroundImage: isDoom ? `linear-gradient(180deg, #d9ffe9 0%, ${COLORS.doom} 60%, #0f5a33 100%)` : undefined,
            WebkitBackgroundClip: isDoom ? "text" : undefined,
            WebkitTextFillColor: isDoom ? "transparent" : undefined,
          }}
        >
          {line.kicker}
        </div>
      </AbsoluteFill>
      {/* impact flash */}
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(local, [0, 5], [0.28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONTS.label,
          fontWeight: 500,
          fontSize: 30,
          letterSpacing: 12,
          color: COLORS.doom,
          opacity: 0.85,
        }}
      >
        {`0${idx + 1}`.slice(-2)} / {`0${scene.lines.length}`.slice(-2)}
      </div>
    </AbsoluteFill>
  );
};

/** Main title card. */
export const TitleCard: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const a = appear(frame, 4, 22);
  const b = appear(frame, 14, 24);
  const ring = interpolate(frame, [0, scene.durationInFrames], [0, 1]);
  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, scene.durationInFrames, 1, 12) }}>
      <Backdrop intensity={1.4} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <svg width={1100} height={1100} style={{ position: "absolute", opacity: 0.6 }}>
          <circle cx={550} cy={550} r={interpolate(ring, [0, 1], [380, 470])} fill="none" stroke={COLORS.doom} strokeWidth={2} strokeDasharray="6 18" opacity={0.6} transform={`rotate(${frame * 0.6} 550 550)`} />
          <circle cx={550} cy={550} r={interpolate(ring, [0, 1], [430, 520])} fill="none" stroke={COLORS.doom} strokeWidth={1} opacity={0.35} />
        </svg>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: FONTS.label,
              fontWeight: 500,
              fontSize: 44,
              letterSpacing: interpolate(a, [0, 1], [30, 14]),
              color: COLORS.text,
              opacity: a,
            }}
          >
            EVERYTHING YOU NEED TO KNOW BEFORE
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 190,
              lineHeight: 0.95,
              letterSpacing: 18,
              color: COLORS.text,
              opacity: b,
              scale: interpolate(b, [0, 1], [1.15, 1]),
              marginTop: 20,
            }}
          >
            AVENGERS
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 300,
              lineHeight: 0.9,
              letterSpacing: 20,
              backgroundImage: `linear-gradient(180deg, #eafff2 0%, ${COLORS.doom} 55%, #0d4a2b 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: `drop-shadow(0 0 40px ${COLORS.doom}66)`,
              opacity: b,
              scale: interpolate(b, [0, 1], [1.25, 1]),
            }}
          >
            DOOMSDAY
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(frame, [0, 8], [0.7, 0], { extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};

/** Chapter card: giant outlined number + title. */
export const ChapterCard: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const a = appear(frame, 0, 12);
  const b = appear(frame, 5, 14);
  const line = interpolate(frame, [3, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, scene.durationInFrames, 1, 9) }}>
      <Backdrop intensity={1.2} />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 160 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 70 }}>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 440,
              lineHeight: 0.8,
              color: "transparent",
              WebkitTextStroke: `4px ${COLORS.doom}`,
              opacity: a,
              translate: `${interpolate(a, [0, 1], [-80, 0])}px 0px`,
            }}
          >
            {scene.num}
          </div>
          <div>
            <div style={{ fontFamily: FONTS.label, fontWeight: 500, fontSize: 40, letterSpacing: 16, color: COLORS.doom, opacity: b }}>CHAPTER {scene.num}</div>
            <div style={{ height: 4, width: 900 * line, background: COLORS.doom, margin: "18px 0 24px", boxShadow: `0 0 24px ${COLORS.doom}` }} />
            <div
              style={{
                fontFamily: FONTS.display,
                fontSize: 150,
                lineHeight: 0.95,
                letterSpacing: 6,
                color: COLORS.text,
                maxWidth: 1050,
                opacity: b,
                translate: `${interpolate(b, [0, 1], [60, 0])}px 0px`,
              }}
            >
              {scene.title}
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: COLORS.doom, opacity: interpolate(frame, [0, 6], [0.35, 0], { extrapolateRight: "clamp" }), mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
