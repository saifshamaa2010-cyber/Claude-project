import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import media from "../data/media.json";
import { COLORS, FONTS } from "../theme";
import { Emblem, EmblemKind } from "./Emblem";

const MEDIA = media as Record<string, string>;

export const hasMedia = (key?: string) => Boolean(key && MEDIA[key]);

/**
 * Shows public/media/<key>.(jpg|png|webp) when the creator has added one
 * (run `npm run media` after adding files), with a slow Ken Burns push and a
 * colour grade so stills sit inside the look of the video.
 */
export const MediaImage: React.FC<{ mediaKey: string; accent: string }> = ({ mediaKey, accent }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`media/${MEDIA[mediaKey]}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          scale: interpolate(frame, [0, durationInFrames], [1.04, 1.14]),
          translate: interpolate(frame, [0, durationInFrames], ["0px 0px", "-18px -10px"]),
        }}
      />
      <AbsoluteFill style={{ background: accent, mixBlendMode: "color", opacity: 0.18 }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.75) 100%)" }} />
    </AbsoluteFill>
  );
};

/** A 16:9 "feed" frame: shows a still if provided, otherwise an animated placeholder monitor. */
export const Monitor: React.FC<{
  width: number;
  accent: string;
  emblem?: EmblemKind;
  mediaKey?: string;
  label?: string;
  style?: React.CSSProperties;
}> = ({ width, accent, emblem = "mask", mediaKey, label, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const height = (width * 9) / 16;
  const secs = Math.floor(frame / fps);
  const tc = `00:${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}:${String(frame % fps).padStart(2, "0")}`;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        border: `2px solid ${accent}88`,
        background: "#05090a",
        boxShadow: `0 0 60px ${accent}22, inset 0 0 80px rgba(0,0,0,0.9)`,
        overflow: "hidden",
        ...style,
      }}
    >
      {hasMedia(mediaKey) ? (
        <MediaImage mediaKey={mediaKey!} accent={accent} />
      ) : (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <AbsoluteFill
            style={{
              background: `radial-gradient(circle at 50% 50%, ${accent}26 0%, transparent 60%)`,
            }}
          />
          <div style={{ opacity: 0.85 }}>
            <Emblem kind={emblem} color={accent} size={height * 0.5} strokeWidth={4} />
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 18,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: FONTS.label,
          fontWeight: 500,
          fontSize: Math.max(16, width * 0.022),
          letterSpacing: 3,
          color: COLORS.text,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            background: COLORS.danger,
            opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0.25,
          }}
        />
        {label ?? "FEED"}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 12,
          right: 16,
          fontFamily: FONTS.label,
          fontSize: Math.max(14, width * 0.018),
          letterSpacing: 2,
          color: `${COLORS.text}aa`,
        }}
      >
        {tc}
      </div>
      <Corners color={accent} />
    </div>
  );
};

export const Corners: React.FC<{ color: string; len?: number; inset?: number }> = ({ color, len = 34, inset = 8 }) => {
  const s = { position: "absolute" as const, width: len, height: len, borderColor: color, borderStyle: "solid", borderWidth: 0 };
  return (
    <>
      <div style={{ ...s, top: inset, left: inset, borderTopWidth: 3, borderLeftWidth: 3 }} />
      <div style={{ ...s, top: inset, right: inset, borderTopWidth: 3, borderRightWidth: 3 }} />
      <div style={{ ...s, bottom: inset, left: inset, borderBottomWidth: 3, borderLeftWidth: 3 }} />
      <div style={{ ...s, bottom: inset, right: inset, borderBottomWidth: 3, borderRightWidth: 3 }} />
    </>
  );
};
