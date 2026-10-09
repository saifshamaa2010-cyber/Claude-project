import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { appear, lineStart } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Emblem } from "../components/Emblem";
import { Shell } from "../components/Shell";
import { COLORS, FONTS } from "../theme";
import type { SceneProps } from "../types";

type Tier = { name: string; color: string; at: number; items: string[] };

export const WatchlistScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const tiers = scene.tiers as Tier[];
  const head = appear(frame, 3, 16);
  const stat = appear(frame, 30, 16);

  return (
    <Shell scene={scene} chapterNum={chapterNum}>
      <Backdrop />
      <div style={{ position: "absolute", top: 120, left: 120, right: 120, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 104, letterSpacing: 4, color: COLORS.text, opacity: head, lineHeight: 1 }}>THE DOOMSDAY WATCH LIST</div>
        <div style={{ textAlign: "right", opacity: stat }}>
          <div style={{ fontFamily: FONTS.label, fontWeight: 500, fontSize: 24, letterSpacing: 5, color: COLORS.dim }}>MARVEL'S FULL GUIDE</div>
          <div style={{ fontFamily: FONTS.display, fontSize: 52, color: COLORS.doom, letterSpacing: 2 }}>14 FILMS + LOKI ≈ 2 DAYS</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 290, left: 120, right: 120, display: "flex", gap: 40 }}>
        {tiers.map((t, ti) => {
          const start = lineStart(scene.lines, t.at);
          const p = appear(frame, start, 14);
          const line = scene.lines[Math.min(t.at, scene.lines.length - 1)];
          const span = Math.max(1, line.to - line.from - 20);
          return (
            <div key={ti} style={{ flex: 1, opacity: interpolate(p, [0, 1], [0.25, 1]) }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", background: t.color, color: "#000" }}>
                <div style={{ fontFamily: FONTS.label, fontWeight: 700, fontSize: 32, letterSpacing: 6 }}>{t.name}</div>
                <div style={{ fontFamily: FONTS.display, fontSize: 40 }}>{t.items.length}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
                {t.items.map((item, i) => {
                  const ip = appear(frame, start + (i * span) / t.items.length, 12);
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 18,
                        padding: "16px 10px",
                        borderBottom: "1px solid #ffffff14",
                        opacity: ip,
                        translate: `${interpolate(ip, [0, 1], [30, 0])}px 0px`,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          flexShrink: 0,
                          border: `3px solid ${t.color}`,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: t.color,
                          fontFamily: FONTS.body,
                          fontWeight: 800,
                          fontSize: 24,
                        }}
                      >
                        {ip > 0.6 ? "✓" : ""}
                      </div>
                      <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 31, lineHeight: 1.2, color: COLORS.text }}>{item}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

type DateCard = { title: string; date: string; at: number };

export const OutroScene: React.FC<SceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const dates = scene.dates as DateCard[];
  const end = appear(frame, lineStart(scene.lines, 1), 16);
  const subStart = lineStart(scene.lines, scene.subscribeAt);
  const sub = appear(frame, subStart, 12);
  const click = frame - (subStart + 30);
  const clicked = click >= 0;
  const cursor = interpolate(frame, [subStart + 4, subStart + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const q = appear(frame, lineStart(scene.lines, scene.questionAt), 16);
  const fadeOut = interpolate(frame, [scene.durationInFrames - 50, scene.durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showDates = q < 0.5;

  return (
    <AbsoluteFill style={{ opacity: fadeOut * appear(frame, 0, 8) }}>
      <Backdrop intensity={1.3} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 0.06 }}>
        <Emblem kind="mask" color={COLORS.doom} size={1000} strokeWidth={2} />
      </AbsoluteFill>
      {showDates ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - q * 2 }}>
          <div style={{ display: "flex", gap: 60, marginTop: -120 }}>
            {dates.map((d, i) => {
              const p = appear(frame, lineStart(scene.lines, d.at) + i * 24, 16);
              const color = i === 0 ? COLORS.doom : "#b388ff";
              return (
                <div key={i} style={{ width: 720, padding: "40px 46px", background: "rgba(0,0,0,0.55)", borderTop: `6px solid ${color}`, opacity: p, translate: `0px ${interpolate(p, [0, 1], [50, 0])}px` }}>
                  <div style={{ fontFamily: FONTS.label, fontWeight: 500, fontSize: 30, letterSpacing: 8, color }}>IN THEATERS</div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 96, lineHeight: 1, letterSpacing: 3, color: COLORS.text, marginTop: 10 }}>{d.title}</div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 70, color, letterSpacing: 4, marginTop: 10 }}>{d.date}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 76, letterSpacing: 10, color: COLORS.text, marginTop: 60, opacity: end }}>THE BEGINNING OF THE END</div>
          {/* subscribe button */}
          <div style={{ position: "absolute", bottom: 120, display: "flex", alignItems: "center", gap: 30, opacity: sub, scale: interpolate(sub, [0, 1], [0.7, 1]) }}>
            <div
              style={{
                padding: "22px 54px",
                borderRadius: 50,
                background: clicked ? "#3a3a3a" : "#e62117",
                color: "#fff",
                fontFamily: FONTS.body,
                fontWeight: 800,
                fontSize: 44,
                letterSpacing: 2,
                scale: clicked && click < 8 ? interpolate(click, [0, 4, 8], [1, 0.92, 1]) : 1,
              }}
            >
              {clicked ? "SUBSCRIBED ✓" : "SUBSCRIBE"}
            </div>
            <div style={{ fontSize: 60, opacity: clicked ? 1 : 0.4, rotate: clicked ? `${Math.sin(click / 2) * 18 * Math.max(0, 1 - click / 30)}deg` : "0deg" }}>🔔</div>
            <svg
              width={60}
              height={70}
              style={{ position: "absolute", left: interpolate(cursor, [0, 1], [520, 210]), top: interpolate(cursor, [0, 1], [140, 50]), opacity: cursor > 0 && click < 40 ? 1 : 0 }}
            >
              <path d="M5 5 L5 55 L18 43 L28 65 L37 61 L27 39 L45 39 Z" fill="#fff" stroke="#000" strokeWidth={3} />
            </svg>
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: (q - 0.5) * 2 }}>
          <div style={{ fontFamily: FONTS.label, fontWeight: 500, fontSize: 40, letterSpacing: 14, color: COLORS.doom }}>TELL ME IN THE COMMENTS</div>
          <div style={{ fontFamily: FONTS.display, fontSize: 150, lineHeight: 1, letterSpacing: 6, color: COLORS.text, textAlign: "center", maxWidth: 1600, marginTop: 30 }}>{scene.question}</div>
          <div style={{ fontFamily: FONTS.display, fontSize: 120, color: COLORS.doom, marginTop: 30, translate: `0px ${Math.sin(frame / 6) * 10}px` }}>↓</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
