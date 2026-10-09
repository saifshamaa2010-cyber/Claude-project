import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { appear, lineStart } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { EmblemKind } from "../components/Emblem";
import { Monitor } from "../components/Media";
import { Shell } from "../components/Shell";
import { COLORS, FONTS } from "../theme";
import type { SceneProps } from "../types";

type Beat = { text: string; at: number };

/** Numbered list of story beats beside a "feed" monitor (drop a still into public/media to fill it). */
export const BeatsScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const accent: string = scene.accent ?? COLORS.doom;
  const beats = scene.beats as Beat[];
  const head = appear(frame, 3, 16);
  const mon = appear(frame, 8, 20);
  const starts = beats.map((b, i) => lineStart(scene.lines, b.at) + beats.filter((g, j) => g.at === b.at && j < i).length * 28);
  const latest = starts.filter((s) => frame >= s).length - 1;

  return (
    <Shell scene={scene} chapterNum={chapterNum} accent={accent}>
      <Backdrop accent={accent} />
      <div style={{ position: "absolute", top: 140, left: 120, fontFamily: FONTS.display, fontSize: 100, letterSpacing: 4, color: COLORS.text, opacity: head, maxWidth: 1700 }}>
        {scene.heading}
      </div>
      <div style={{ position: "absolute", top: 300, left: 120, width: 780, display: "flex", flexDirection: "column", gap: 22 }}>
        {beats.map((b, i) => {
          const p = appear(frame, starts[i], 14);
          const isLatest = i === latest;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 26,
                alignItems: "flex-start",
                opacity: p * (isLatest ? 1 : 0.6),
                translate: `${interpolate(p, [0, 1], [-40, 0])}px 0px`,
              }}
            >
              <div style={{ fontFamily: FONTS.display, fontSize: 58, lineHeight: 1, color: accent, width: 70, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 40, lineHeight: 1.25, color: COLORS.text, paddingTop: 4 }}>{b.text}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 320, left: 960, opacity: mon, translate: `${interpolate(mon, [0, 1], [60, 0])}px 0px` }}>
        <Monitor width={840} accent={accent} emblem={(scene.emblem as EmblemKind) ?? "mask"} mediaKey={scene.media} label={String(scene.heading).split("·")[0].trim()} />
      </div>
    </Shell>
  );
};

type Teaser = { num: string; date: string; title: string; at: number; media?: string; accent: string };

const TEASER_EMBLEMS: EmblemKind[] = ["star", "bolt", "x", "claw"];

/** 2×2 grid of the four theatrical teasers. */
export const TeasersScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const cards = scene.cards as Teaser[];
  return (
    <Shell scene={scene} chapterNum={chapterNum}>
      <Backdrop />
      <div style={{ position: "absolute", top: 100, left: 0, right: 0, textAlign: "center", fontFamily: FONTS.display, fontSize: 90, letterSpacing: 8, color: COLORS.text, opacity: appear(frame, 2) }}>
        {scene.heading}
      </div>
      <div style={{ position: "absolute", top: 222, left: 290, width: 1340, display: "flex", flexWrap: "wrap", gap: "30px 60px" }}>
        {cards.map((c, i) => {
          const p = appear(frame, lineStart(scene.lines, c.at), 14);
          return (
            <div key={i} style={{ position: "relative", opacity: p, scale: interpolate(p, [0, 1], [0.9, 1]) }}>
              <Monitor width={640} accent={c.accent} emblem={TEASER_EMBLEMS[i]} mediaKey={c.media} label={`TEASER ${c.num} · ${c.date}`} />
              <div
                style={{
                  position: "absolute",
                  left: 22,
                  bottom: 18,
                  fontFamily: FONTS.display,
                  fontSize: 64,
                  letterSpacing: 3,
                  color: COLORS.text,
                  textShadow: "0 4px 18px rgba(0,0,0,0.9)",
                }}
              >
                {c.title}
              </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};
