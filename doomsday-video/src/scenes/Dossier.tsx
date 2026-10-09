import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { appear, lineStart } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Emblem, EmblemKind } from "../components/Emblem";
import { Corners, hasMedia, MediaImage } from "../components/Media";
import { Shell } from "../components/Shell";
import { COLORS, FONTS } from "../theme";
import type { SceneProps } from "../types";

type Field = { label: string; value: string; at: number };

/** Character "case file": portrait panel on the left, facts appearing line by line on the right. */
export const Dossier: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const accent: string = scene.accent ?? COLORS.doom;
  const panel = appear(frame, 2, 18);
  const head = appear(frame, 8, 18);
  const tagStart = lineStart(scene.lines, scene.tag?.at);
  const tag = scene.tag ? appear(frame, tagStart, 8) : 0;

  return (
    <Shell scene={scene} chapterNum={chapterNum} accent={accent}>
      <Backdrop accent={accent} />
      {/* portrait panel */}
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 150,
          width: 640,
          height: 800,
          opacity: panel,
          translate: `${interpolate(panel, [0, 1], [-60, 0])}px 0px`,
          border: `1px solid ${accent}55`,
          background: `linear-gradient(160deg, ${accent}14 0%, rgba(0,0,0,0.6) 70%)`,
          overflow: "hidden",
        }}
      >
        {hasMedia(scene.media) ? (
          <MediaImage mediaKey={scene.media} accent={accent} />
        ) : (
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <svg width={560} height={560} style={{ position: "absolute", opacity: 0.5 }}>
              <circle cx={280} cy={280} r={250} fill="none" stroke={accent} strokeWidth={1.5} strokeDasharray="4 14" transform={`rotate(${frame * 0.4} 280 280)`} />
              <circle cx={280} cy={280} r={212} fill="none" stroke={accent} strokeWidth={1} opacity={0.5} transform={`rotate(${-frame * 0.25} 280 280)`} strokeDasharray="120 40" />
            </svg>
            <div style={{ filter: `drop-shadow(0 0 28px ${accent}aa)` }}>
              <Emblem kind={scene.emblem as EmblemKind} color={accent} size={340} strokeWidth={5} />
            </div>
          </AbsoluteFill>
        )}
        <Corners color={accent} />
        <div
          style={{
            position: "absolute",
            top: 26,
            left: 30,
            fontFamily: FONTS.label,
            fontWeight: 500,
            fontSize: 24,
            letterSpacing: 5,
            color: accent,
          }}
        >
          CASE FILE // {String(scene.id).toUpperCase()}
        </div>
        {scene.tag ? (
          <div
            style={{
              position: "absolute",
              left: 34,
              right: 34,
              bottom: 40,
              padding: "14px 18px",
              border: `3px solid ${accent}`,
              background: "rgba(0,0,0,0.72)",
              fontFamily: FONTS.display,
              fontSize: 46,
              lineHeight: 1.05,
              letterSpacing: 3,
              color: accent,
              textAlign: "center",
              rotate: "-2deg",
              opacity: tag,
              scale: interpolate(tag, [0, 1], [1.4, 1]),
            }}
          >
            {scene.tag.text}
          </div>
        ) : null}
      </div>

      {/* facts column */}
      <div style={{ position: "absolute", left: 830, top: 150, width: 980, height: 800, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ opacity: head, translate: `0px ${interpolate(head, [0, 1], [30, 0])}px` }}>
          <div style={{ fontFamily: FONTS.label, fontWeight: 500, fontSize: 34, letterSpacing: 10, color: accent }}>{scene.alias}</div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: String(scene.name).length > 15 ? 124 : 150,
              lineHeight: 0.95,
              color: COLORS.text,
              letterSpacing: 3,
              marginTop: 6,
            }}
          >
            {scene.name}
          </div>
          <div style={{ fontFamily: FONTS.body, fontSize: 32, color: COLORS.dim, marginTop: 10 }}>
            <span style={{ fontFamily: FONTS.label, letterSpacing: 4, fontSize: 24, color: COLORS.dim, marginRight: 14 }}>PLAYED BY</span>
            <span style={{ color: COLORS.text, fontWeight: 600 }}>{scene.actor}</span>
          </div>
        </div>
        <div style={{ marginTop: 34 }}>
          {(scene.fields as Field[]).map((f, i) => {
            const sameAt = (scene.fields as Field[]).filter((g, j) => g.at === f.at && j < i).length;
            const p = appear(frame, lineStart(scene.lines, f.at) + sameAt * 10, 14);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 26,
                  padding: "16px 0",
                  borderTop: `1px solid ${accent}33`,
                  opacity: p,
                  translate: `${interpolate(p, [0, 1], [50, 0])}px 0px`,
                }}
              >
                <div style={{ width: 230, flexShrink: 0, fontFamily: FONTS.label, fontWeight: 500, fontSize: 26, letterSpacing: 4, color: accent }}>{f.label}</div>
                <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 38, lineHeight: 1.2, color: COLORS.text }}>{f.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
};
