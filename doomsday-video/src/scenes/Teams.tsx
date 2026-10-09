import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { activeLine, appear, lineStart } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Emblem, EmblemKind } from "../components/Emblem";
import { Corners, hasMedia, MediaImage } from "../components/Media";
import { Shell } from "../components/Shell";
import { COLORS, FONTS } from "../theme";
import type { SceneProps } from "../types";

type Card = { title: string; actor: string; emblem: EmblemKind; note: string; accent: string; at: number; media?: string };

/** Three side-by-side character cards; the one being discussed is lit up. */
export const TrioScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const cards = scene.cards as Card[];
  const now = activeLine(scene.lines, frame);
  const focus = cards.reduce((best, c, i) => (c.at <= now ? i : best), 0);
  const hasFocus = now >= 1;

  return (
    <Shell scene={scene} chapterNum={chapterNum}>
      <Backdrop accent={cards[focus].accent} />
      <div style={{ position: "absolute", top: 120, left: 0, right: 0, textAlign: "center", fontFamily: FONTS.display, fontSize: 110, letterSpacing: 10, color: COLORS.text, opacity: appear(frame, 2) }}>
        {scene.heading}
      </div>
      <div style={{ position: "absolute", top: 290, left: 120, right: 120, display: "flex", justifyContent: "space-between" }}>
        {cards.map((c, i) => {
          const p = appear(frame, i === 0 ? 6 : lineStart(scene.lines, c.at), 16);
          const lit = !hasFocus || i === focus;
          return (
            <div
              key={i}
              style={{
                position: "relative",
                width: 520,
                height: 660,
                border: `2px solid ${lit ? c.accent : "#ffffff22"}`,
                background: `linear-gradient(180deg, ${c.accent}${lit ? "26" : "0d"} 0%, rgba(0,0,0,0.7) 80%)`,
                opacity: p * (lit ? 1 : 0.45),
                translate: `0px ${interpolate(p, [0, 1], [80, 0])}px`,
                scale: lit && hasFocus ? 1.03 : 1,
                boxShadow: lit && hasFocus ? `0 0 60px ${c.accent}44` : "none",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 400 }}>
                {hasMedia(c.media) ? (
                  <MediaImage mediaKey={c.media!} accent={c.accent} />
                ) : (
                  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
                    <div style={{ filter: `drop-shadow(0 0 20px ${c.accent}aa)` }}>
                      <Emblem kind={c.emblem} color={c.accent} size={250} strokeWidth={5} spin={c.emblem === "rings" ? frame * 0.3 : 0} />
                    </div>
                  </AbsoluteFill>
                )}
              </div>
              <div style={{ position: "absolute", top: 420, left: 36, right: 36 }}>
                <div style={{ fontFamily: FONTS.display, fontSize: 96, lineHeight: 1, color: COLORS.text, letterSpacing: 3 }}>{c.title}</div>
                <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 30, color: COLORS.dim, marginTop: 6 }}>{c.actor}</div>
                <div style={{ fontFamily: FONTS.label, fontWeight: 500, fontSize: 30, letterSpacing: 3, color: c.accent, marginTop: 18 }}>{c.note.toUpperCase()}</div>
              </div>
              <Corners color={c.accent} len={26} />
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

type Member = { name: string; actor: string; at: number };

/** Team roster grid (used for the X-Men). */
export const RosterScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const accent: string = scene.accent;
  const members = scene.members as Member[];
  const head = appear(frame, 4, 18);
  const rows = [members.slice(0, 4), members.slice(4)];
  const startOf = (m: Member) => {
    const idx = members.indexOf(m);
    const before = members.filter((g, j) => g.at === m.at && j < idx).length;
    // the first narration line names five actors back to back, so spread them across it
    const line = scene.lines[Math.min(m.at, scene.lines.length - 1)];
    const span = line.to - line.from;
    const group = members.filter((g) => g.at === m.at).length;
    return lineStart(scene.lines, m.at) + (group > 1 ? (before * span) / group : 0);
  };

  return (
    <Shell scene={scene} chapterNum={chapterNum} accent={accent}>
      <Backdrop accent={accent} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 0.07 }}>
        <Emblem kind="x" color={accent} size={980} strokeWidth={3} />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 130, left: 120, display: "flex", alignItems: "center", gap: 36, opacity: head }}>
        <div style={{ filter: `drop-shadow(0 0 18px ${accent})` }}>
          <Emblem kind="x" color={accent} size={130} strokeWidth={7} />
        </div>
        <div>
          <div style={{ fontFamily: FONTS.label, fontWeight: 500, fontSize: 30, letterSpacing: 10, color: accent }}>FOX'S X-MEN · SINCE 2000</div>
          <div style={{ fontFamily: FONTS.display, fontSize: 130, lineHeight: 0.95, letterSpacing: 4, color: COLORS.text }}>{scene.heading}</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 420, left: 120, right: 120, display: "flex", flexDirection: "column", gap: 40 }}>
        {rows.map((row, r) => (
          <div key={r} style={{ display: "flex", gap: 34, justifyContent: r === 1 ? "center" : "flex-start" }}>
            {row.map((m) => {
              const p = appear(frame, startOf(m), 14);
              const special = m.at > 1;
              return (
                <div
                  key={m.name}
                  style={{
                    width: 395,
                    padding: "34px 30px",
                    background: special ? `${accent}1f` : "rgba(0,0,0,0.5)",
                    borderTop: `5px solid ${accent}`,
                    opacity: p,
                    translate: `0px ${interpolate(p, [0, 1], [40, 0])}px`,
                    boxShadow: special ? `0 0 40px ${accent}33` : "none",
                  }}
                >
                  <div style={{ fontFamily: FONTS.display, fontSize: 76, lineHeight: 1, letterSpacing: 2, color: COLORS.text }}>{m.name}</div>
                  <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 30, color: COLORS.dim, marginTop: 8 }}>{m.actor}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Shell>
  );
};
