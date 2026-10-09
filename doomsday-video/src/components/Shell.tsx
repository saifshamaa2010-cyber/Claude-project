import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { sceneFade } from "../anim";
import { COLORS, FONTS } from "../theme";
import type { Scene } from "../types";

/** Shared scene wrapper: per-scene fade, slow camera push and the chapter bug. */
export const Shell: React.FC<{
  scene: Scene;
  chapterNum?: string;
  accent?: string;
  push?: boolean;
  children: React.ReactNode;
}> = ({ scene, chapterNum, accent = COLORS.doom, push = true, children }) => {
  const frame = useCurrentFrame();
  const d = scene.durationInFrames;
  return (
    <AbsoluteFill style={{ opacity: sceneFade(frame, d) }}>
      <AbsoluteFill style={{ scale: push ? interpolate(frame, [0, d], [1, 1.035]) : 1 }}>{children}</AbsoluteFill>
      {scene.chapter ? <ChapterBug num={chapterNum} title={scene.chapter} accent={accent} /> : null}
    </AbsoluteFill>
  );
};

const ChapterBug: React.FC<{ num?: string; title: string; accent: string }> = ({ num, title, accent }) => (
  <>
    <div
      style={{
        position: "absolute",
        top: 46,
        left: 80,
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontFamily: FONTS.label,
        fontWeight: 500,
        fontSize: 26,
        letterSpacing: 4,
        color: COLORS.text,
        opacity: 0.85,
      }}
    >
      {num ? (
        <div style={{ background: accent, color: "#000", padding: "2px 12px", fontWeight: 700 }}>{num}</div>
      ) : null}
      {title}
    </div>
    <div
      style={{
        position: "absolute",
        top: 46,
        right: 80,
        fontFamily: FONTS.label,
        fontWeight: 500,
        fontSize: 26,
        letterSpacing: 4,
        color: COLORS.dim,
      }}
    >
      AVENGERS: DOOMSDAY · DEC 18
    </div>
  </>
);
