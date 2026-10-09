import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { activeLine, appear } from "./anim";
import { Backdrop, Grain } from "./components/Backdrop";
import { TIMELINE } from "./DoomsdayVideo";
import { ColdOpen } from "./scenes/Intro";
import { COLORS, FONTS } from "./theme";

const COLD_OPEN = TIMELINE.scenes.find((s) => s.type === "coldOpen")!;
const END_CARD = 120;
export const SHORT_DURATION = COLD_OPEN.durationInFrames + END_CARD;

/** 1080×1920 YouTube Short: the cold open with big captions, then a pointer to the full video. */
export const ShortVideo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Sequence durationInFrames={COLD_OPEN.durationInFrames}>
        <ColdOpen scene={COLD_OPEN} />
        <ShortCaptions />
      </Sequence>
      <Sequence from={COLD_OPEN.durationInFrames} durationInFrames={END_CARD}>
        <EndCard />
      </Sequence>
      <Grain />
      <Audio
        src={staticFile("audio/soundtrack.wav")}
        trimAfter={SHORT_DURATION}
        volume={interpolate(frame, [SHORT_DURATION - 30, SHORT_DURATION], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </AbsoluteFill>
  );
};

const ShortCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const line = COLD_OPEN.lines[activeLine(COLD_OPEN.lines, frame)];
  if (frame < line.from || frame > line.to + 4) return null;
  const words = line.t.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 4) chunks.push(words.slice(i, i + 4).join(" "));
  const idx = Math.min(chunks.length - 1, Math.floor(((frame - line.from) / Math.max(1, line.to - line.from)) * chunks.length));
  return (
    <div style={{ position: "absolute", top: 1330, left: 70, right: 70, textAlign: "center" }}>
      <span
        style={{
          fontFamily: FONTS.body,
          fontWeight: 800,
          fontSize: 62,
          lineHeight: 1.2,
          color: COLORS.text,
          textShadow: "0 0 6px #000, 0 4px 18px rgba(0,0,0,0.95)",
        }}
      >
        {chunks[idx]}
      </span>
    </div>
  );
};

const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const a = appear(frame, 0, 10);
  const b = appear(frame, 8, 14);
  return (
    <AbsoluteFill>
      <Backdrop intensity={1.5} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", paddingBottom: 200 }}>
        <div style={{ fontFamily: FONTS.label, fontWeight: 500, fontSize: 46, letterSpacing: 12, color: COLORS.text, opacity: a }}>THE FULL BREAKDOWN</div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 230,
            lineHeight: 0.9,
            marginTop: 20,
            backgroundImage: `linear-gradient(180deg, #eafff2 0%, ${COLORS.doom} 55%, #0d4a2b 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            opacity: b,
            scale: interpolate(b, [0, 1], [1.2, 1]),
          }}
        >
          AVENGERS
          <br />
          DOOMSDAY
        </div>
        <div style={{ fontFamily: FONTS.body, fontWeight: 800, fontSize: 54, color: COLORS.text, marginTop: 50, opacity: b }}>is linked below</div>
        <div style={{ fontFamily: FONTS.display, fontSize: 150, color: COLORS.doom, translate: `0px ${Math.sin(frame / 5) * 14}px`, opacity: b }}>↓</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(frame, [0, 6], [0.6, 0], { extrapolateRight: "clamp" }) }} />
    </AbsoluteFill>
  );
};
