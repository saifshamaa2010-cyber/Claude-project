import React from "react";
import { AbsoluteFill } from "remotion";
import { Emblem } from "./components/Emblem";
import { hasMedia, MediaImage } from "./components/Media";
import { Orb } from "./components/Orb";
import { COLORS, FONTS } from "./theme";

/** 1280×720 YouTube thumbnail. Drop public/media/thumbnail.jpg in to put a still behind it. */
export const Thumbnail: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#020403", overflow: "hidden" }}>
      {hasMedia("thumbnail") ? (
        <AbsoluteFill style={{ left: 420 }}>
          <MediaImage mediaKey="thumbnail" accent={COLORS.doom} />
        </AbsoluteFill>
      ) : (
        <>
          <AbsoluteFill style={{ background: `radial-gradient(circle at 74% 50%, ${COLORS.doom}66 0%, ${COLORS.doom}14 32%, transparent 60%)` }} />
          <div style={{ position: "absolute", left: 640, top: 400, opacity: 0.95 }}>
            <Orb color="#4ea8ff" size={220} spin={0.4} />
          </div>
          <div style={{ position: "absolute", left: 1080, top: 420, opacity: 0.95 }}>
            <Orb color="#ffd23f" size={200} spin={1.2} />
          </div>
          <div style={{ position: "absolute", left: 1010, top: -40, opacity: 0.95 }}>
            <Orb color="#ff9f43" size={210} spin={2.1} />
          </div>
          <div style={{ position: "absolute", left: 720, top: 70, filter: `drop-shadow(0 0 30px ${COLORS.doom}) drop-shadow(0 0 70px ${COLORS.doom}88)` }}>
            <Emblem kind="mask" color="#d9ffe9" size={520} strokeWidth={7} />
          </div>
        </>
      )}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 42%, transparent 62%)" }} />
      <div style={{ position: "absolute", left: 56, top: 60 }}>
        <div style={{ display: "inline-block", background: COLORS.danger, color: "#fff", fontFamily: FONTS.label, fontWeight: 700, fontSize: 38, letterSpacing: 4, padding: "4px 18px", rotate: "-2deg" }}>
          BEFORE DEC 18
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 210, lineHeight: 0.86, color: "#fff", marginTop: 26, textShadow: "0 8px 30px rgba(0,0,0,0.9)" }}>
          WATCH
          <br />
          THIS
        </div>
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 172,
            lineHeight: 0.9,
            backgroundImage: `linear-gradient(180deg, #eafff2 0%, ${COLORS.doom} 55%, #0f6b3b 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 22px ${COLORS.doom}88)`,
          }}
        >
          FIRST
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 14, background: COLORS.doom }} />
    </AbsoluteFill>
  );
};
