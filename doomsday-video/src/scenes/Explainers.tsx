import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { appear, EASE_IN_OUT, lineStart } from "../anim";
import { Backdrop } from "../components/Backdrop";
import { Emblem } from "../components/Emblem";
import { Orb } from "../components/Orb";
import { Shell } from "../components/Shell";
import { COLORS, FONTS } from "../theme";
import type { SceneProps } from "../types";

const Heading: React.FC<{ text: string; color?: string; p: number; size?: number }> = ({ text, color = COLORS.text, p, size = 110 }) => (
  <div
    style={{
      fontFamily: FONTS.display,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: 4,
      color,
      opacity: p,
      translate: `0px ${interpolate(p, [0, 1], [30, 0])}px`,
    }}
  >
    {text}
  </div>
);

type Event = { date: string; label: string; at: number };

export const TimelineScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const events = scene.events as Event[];
  const starts = events.map((e, i) => lineStart(scene.lines, e.at) + events.filter((g, j) => g.at === e.at && j < i).length * 40);
  const x0 = 320;
  const x1 = 1600;
  const xs = events.map((_, i) => x0 + ((x1 - x0) * i) / (events.length - 1));
  const visible = starts.filter((s) => frame >= s).length;
  const lastX = visible === 0 ? x0 : xs[visible - 1];
  const prevX = visible <= 1 ? x0 : xs[visible - 2];
  const grow = visible === 0 ? 0 : appear(frame, starts[visible - 1], 20);
  const lineX = prevX + (lastX - prevX) * grow;

  return (
    <Shell scene={scene} chapterNum={chapterNum}>
      <Backdrop />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 0.08 }}>
        <Emblem kind="mask" color={COLORS.doom} size={900} strokeWidth={2} />
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 150, left: 120 }}>
        <Heading text={scene.heading} p={appear(frame, 4)} />
      </div>
      <div style={{ position: "absolute", left: x0, width: x1 - x0, top: 638, height: 4, background: `${COLORS.doom}22` }} />
      <div style={{ position: "absolute", left: x0, width: lineX - x0, top: 638, height: 4, background: COLORS.doom, boxShadow: `0 0 18px ${COLORS.doom}` }} />
      {events.map((e, i) => {
        const p = appear(frame, starts[i], 16);
        const last = i === events.length - 1;
        return (
          <div key={i} style={{ position: "absolute", left: xs[i] - 200, width: 400, top: 420, height: 500, opacity: p }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                width: "100%",
                height: 190,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                fontFamily: FONTS.display,
                fontSize: last ? 84 : 72,
                color: last ? COLORS.doom : COLORS.text,
                letterSpacing: 2,
                translate: `0px ${interpolate(p, [0, 1], [24, 0])}px`,
              }}
            >
              {e.date}
            </div>
            <div
              style={{
                position: "absolute",
                top: 204,
                left: 200 - 18,
                width: 36,
                height: 36,
                borderRadius: 18,
                background: last ? COLORS.doom : COLORS.bg,
                border: `4px solid ${COLORS.doom}`,
                boxShadow: `0 0 ${20 + 10 * Math.sin(frame / 8)}px ${COLORS.doom}`,
                scale: interpolate(p, [0, 1], [0, 1]),
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 270,
                width: "100%",
                textAlign: "center",
                fontFamily: FONTS.body,
                fontWeight: 600,
                fontSize: 34,
                lineHeight: 1.25,
                color: COLORS.text,
                translate: `0px ${interpolate(p, [0, 1], [-20, 0])}px`,
              }}
            >
              {e.label}
            </div>
          </div>
        );
      })}
    </Shell>
  );
};

type Chip = { label: string; sub: string; at: number };

export const IncursionScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const d = scene.durationInFrames;
  const collide = Math.round(d * 0.62);
  const t = interpolate(frame, [0, collide], [0, 1], { extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const hit = frame - collide;
  const flash = interpolate(hit, [0, 2, 12], [0, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = hit >= 0 && hit < 12 ? (random(`is-${frame}`) - 0.5) * 22 * (1 - hit / 12) : 0;
  const crack = appear(frame, collide, 20);
  const defP = appear(frame, lineStart(scene.lines, 1), 16);

  return (
    <Shell scene={scene} chapterNum={chapterNum}>
      <Backdrop />
      <div style={{ position: "absolute", left: 80, top: 160, width: 860, height: 800, translate: `${shake}px ${shake * 0.5}px` }}>
        <Orb color="#4ea8ff" size={360} spin={frame / 50} style={{ position: "absolute", top: 220, left: interpolate(t, [0, 1], [0, 170]) }} />
        <Orb color="#ff9f43" size={360} spin={-frame / 45} style={{ position: "absolute", top: 220, left: interpolate(t, [0, 1], [500, 330]) }} />
        <svg width={860} height={800} style={{ position: "absolute", inset: 0, opacity: crack }}>
          <g stroke={COLORS.doom} strokeWidth={4} fill="none" style={{ filter: `drop-shadow(0 0 12px ${COLORS.doom})` }}>
            <path d="M430 400 L470 330 L455 280 L500 210" />
            <path d="M430 400 L390 470 L410 540 L370 610" />
            <path d="M430 400 L520 420 L580 400" />
            <path d="M430 400 L340 380 L290 410" />
          </g>
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, textAlign: "center", fontFamily: FONTS.label, fontWeight: 500, fontSize: 30, letterSpacing: 6, color: COLORS.dim }}>
          UNIVERSE A &nbsp;×&nbsp; UNIVERSE B
        </div>
      </div>
      <div style={{ position: "absolute", left: 1000, top: 170, width: 820 }}>
        <Heading text={scene.heading} color={COLORS.doom} p={appear(frame, 4)} size={170} />
        <div
          style={{
            marginTop: 18,
            padding: "22px 28px",
            borderLeft: `5px solid ${COLORS.doom}`,
            background: "rgba(0,0,0,0.45)",
            fontFamily: FONTS.body,
            fontWeight: 600,
            fontSize: 40,
            lineHeight: 1.3,
            color: COLORS.text,
            opacity: defP,
          }}
        >
          {scene.definition}
        </div>
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 18 }}>
          {(scene.chips as Chip[]).map((c, i) => {
            const p = appear(frame, lineStart(scene.lines, c.at), 14);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, opacity: p, translate: `${interpolate(p, [0, 1], [40, 0])}px 0px` }}>
                <div style={{ width: 14, height: 14, background: COLORS.doom, rotate: "45deg", flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 56, lineHeight: 1, color: COLORS.text, letterSpacing: 2 }}>{c.label}</div>
                  <div style={{ fontFamily: FONTS.body, fontSize: 28, color: COLORS.dim, marginTop: 4 }}>{c.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
    </Shell>
  );
};

export const QuoteScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const k = appear(frame, 2);
  const q = appear(frame, 10, 24);
  const q2 = appear(frame, lineStart(scene.lines, scene.quote2At), 18);
  const words = String(scene.quote).split(" ");
  return (
    <Shell scene={scene} chapterNum={chapterNum}>
      <Backdrop />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 200px" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: "8px 26px",
              border: `2px solid ${COLORS.doom}`,
              fontFamily: FONTS.label,
              fontWeight: 500,
              fontSize: 30,
              letterSpacing: 10,
              color: COLORS.doom,
              opacity: k,
            }}
          >
            {scene.kicker}
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 200, lineHeight: 0.6, color: COLORS.doom, opacity: q * 0.6, marginTop: 50 }}>“</div>
          <div style={{ fontFamily: FONTS.body, fontWeight: 800, fontSize: 76, lineHeight: 1.15, color: COLORS.text, letterSpacing: -1 }}>
            {words.map((w, i) => {
              const p = appear(frame, 10 + i * 3, 12);
              const hi = i < 2;
              return (
                <span key={i} style={{ opacity: p, color: hi ? COLORS.doom : COLORS.text, display: "inline-block", marginRight: 22, translate: `0px ${interpolate(p, [0, 1], [20, 0])}px` }}>
                  {w}
                </span>
              );
            })}
          </div>
          <div style={{ fontFamily: FONTS.body, fontStyle: "italic", fontSize: 44, lineHeight: 1.35, color: COLORS.dim, marginTop: 44, opacity: q2 }}>{scene.quote2}</div>
          <div style={{ fontFamily: FONTS.label, fontWeight: 500, fontSize: 26, letterSpacing: 6, color: COLORS.dim, marginTop: 40, opacity: q2 }}>— {String(scene.source).toUpperCase()}</div>
        </div>
      </AbsoluteFill>
    </Shell>
  );
};

type OrbDef = { name: string; sub: string; color: string; at: number };

export const UniversesScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const orbs = scene.orbs as OrbDef[];
  const pos = [
    { x: 420, y: 360 },
    { x: 1500, y: 360 },
    { x: 960, y: 720 },
  ];
  const cStart = lineStart(scene.lines, scene.collideAt);
  const c = interpolate(frame, [cStart, cStart + 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const doom = appear(frame, cStart + 40, 30);

  return (
    <Shell scene={scene} chapterNum={chapterNum}>
      <Backdrop />
      <svg width={1920} height={1080} style={{ position: "absolute", opacity: 0.4 * (1 - c) }}>
        <g stroke={COLORS.doom} strokeWidth={2} strokeDasharray="10 14">
          <line x1={pos[0].x} y1={pos[0].y} x2={pos[1].x} y2={pos[1].y} />
          <line x1={pos[1].x} y1={pos[1].y} x2={pos[2].x} y2={pos[2].y} />
          <line x1={pos[2].x} y1={pos[2].y} x2={pos[0].x} y2={pos[0].y} />
        </g>
      </svg>
      {orbs.map((o, i) => {
        const p = appear(frame, lineStart(scene.lines, o.at), 18);
        const size = 300;
        const x = interpolate(c, [0, 1], [pos[i].x, 960 + (pos[i].x - 960) * 0.12]);
        const y = interpolate(c, [0, 1], [pos[i].y, 540 + (pos[i].y - 540) * 0.12]);
        return (
          <div key={i} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, opacity: p * interpolate(c, [0, 1], [1, 0.45]), scale: interpolate(p, [0, 1], [0.6, 1]) * interpolate(c, [0, 1], [1, 0.55]) }}>
            <Orb color={o.color} size={size} spin={frame / 40 + i} />
            <div style={{ position: "absolute", top: size + 18, left: -150, right: -150, textAlign: "center", opacity: 1 - c }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 62, color: o.color, letterSpacing: 3, lineHeight: 1 }}>{o.name}</div>
              <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 30, color: COLORS.text, marginTop: 6 }}>{o.sub}</div>
            </div>
          </div>
        );
      })}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: doom }}>
        <div style={{ filter: `drop-shadow(0 0 40px ${COLORS.doom})`, scale: interpolate(doom, [0, 1], [0.7, 1]) }}>
          <Emblem kind="mask" color={COLORS.doom} size={360} strokeWidth={5} />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 110, left: 0, right: 0, textAlign: "center", fontFamily: FONTS.display, fontSize: 84, letterSpacing: 8, color: COLORS.text, opacity: doom }}>
        ONE MAN TO RULE THEM ALL
      </div>
    </Shell>
  );
};

const PATCH_COLORS = ["#2a6f97", "#a44a3f", "#6a994e", "#bc6c25", "#5e548e", "#1f7a56", "#8d6a9f", "#c9a227", "#3d5a80"];

export const BattleworldScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const story = appear(frame, lineStart(scene.lines, scene.storyAt) + 4, 18);
  const pStart = lineStart(scene.lines, scene.planetAt);
  const fuse = interpolate(frame, [pStart, pStart + 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT });
  const planet = appear(frame, pStart + 60, 30);
  const emperor = appear(frame, pStart + 110, 14);
  const dates = appear(frame, lineStart(scene.lines, scene.datesAt), 18);
  const R = 250;
  const cx = 600;
  const cy = 560;

  const cells: Array<{ pts: string; fill: string }> = [];
  const N = 7;
  const jitter = (i: number, j: number, axis: string) => (random(`bw-${i}-${j}-${axis}`) - 0.5) * 50;
  const vx = (i: number, j: number) => -R * 1.3 + (i * 2.6 * R) / N + jitter(i, j, "x");
  const vy = (i: number, j: number) => -R * 1.3 + (j * 2.6 * R) / N + jitter(i, j, "y");
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      cells.push({
        pts: `${vx(i, j)},${vy(i, j)} ${vx(i + 1, j)},${vy(i + 1, j)} ${vx(i + 1, j + 1)},${vy(i + 1, j + 1)} ${vx(i, j + 1)},${vy(i, j + 1)}`,
        fill: PATCH_COLORS[Math.floor(random(`bwc-${i}-${j}`) * PATCH_COLORS.length)],
      });
    }
  }
  const drift = ((frame * 0.5) % 80) - 40;

  return (
    <Shell scene={scene} chapterNum={chapterNum}>
      <Backdrop />
      {/* converging universes */}
      {new Array(8).fill(0).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        const dist = interpolate(fuse, [0, 1], [430, 0]);
        return (
          <div key={i} style={{ position: "absolute", left: cx + Math.cos(a) * dist - 50, top: cy + Math.sin(a) * dist * 0.8 - 50, opacity: (1 - planet) * story }}>
            <Orb color={PATCH_COLORS[i]} size={100} spin={frame / 30 + i} />
          </div>
        );
      })}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: planet }}>
        <defs>
          <clipPath id="bw-clip">
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>
          <radialGradient id="bw-shade" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.18} />
            <stop offset="60%" stopColor="#000000" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#000000" stopOpacity={0.85} />
          </radialGradient>
        </defs>
        <g clipPath="url(#bw-clip)">
          <g transform={`translate(${cx + drift} ${cy})`}>
            {cells.map((c, i) => (
              <polygon key={i} points={c.pts} fill={c.fill} fillOpacity={0.8} stroke="#050505" strokeWidth={4} />
            ))}
          </g>
          <circle cx={cx} cy={cy} r={R} fill="url(#bw-shade)" />
        </g>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={COLORS.doom} strokeWidth={3} style={{ filter: `drop-shadow(0 0 18px ${COLORS.doom})` }} />
      </svg>
      <div style={{ position: "absolute", left: cx - 300, width: 600, top: cy + R + 30, textAlign: "center", fontFamily: FONTS.display, fontSize: 90, letterSpacing: 10, color: COLORS.text, opacity: planet }}>
        BATTLEWORLD
      </div>

      <div style={{ position: "absolute", left: 1060, top: 200, width: 760 }}>
        <div style={{ fontFamily: FONTS.label, fontWeight: 500, fontSize: 32, letterSpacing: 10, color: COLORS.doom, opacity: story }}>THE COMIC BLUEPRINT</div>
        <Heading text="SECRET WARS" p={story} size={170} />
        <div style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: 36, color: COLORS.dim, opacity: story }}>Marvel Comics · 2015</div>
        <div
          style={{
            marginTop: 50,
            display: "inline-block",
            padding: "14px 26px",
            border: `3px solid ${COLORS.doom}`,
            fontFamily: FONTS.display,
            fontSize: 64,
            letterSpacing: 6,
            color: COLORS.doom,
            rotate: "-2deg",
            opacity: emperor,
            scale: interpolate(emperor, [0, 1], [1.4, 1]),
          }}
        >
          GOD EMPEROR DOOM
        </div>
        <div style={{ marginTop: 60, display: "flex", gap: 24, opacity: dates, translate: `0px ${interpolate(dates, [0, 1], [30, 0])}px` }}>
          {[
            ["DOOMSDAY", "DEC 2026"],
            ["SECRET WARS", "DEC 2027"],
          ].map(([a, b]) => (
            <div key={a} style={{ padding: "16px 24px", background: "rgba(0,0,0,0.5)", borderTop: `4px solid ${COLORS.doom}` }}>
              <div style={{ fontFamily: FONTS.display, fontSize: 56, color: COLORS.text, letterSpacing: 3, lineHeight: 1 }}>{a}</div>
              <div style={{ fontFamily: FONTS.label, fontWeight: 500, fontSize: 26, letterSpacing: 5, color: COLORS.doom, marginTop: 6 }}>{b}</div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

export const BigStatScene: React.FC<SceneProps> = ({ scene, chapterNum }) => {
  const frame = useCurrentFrame();
  const target = Number(scene.stat);
  const count = Math.round(interpolate(frame, [8, 50], [0, target], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_IN_OUT }));
  const lab = appear(frame, 20);
  const sub = appear(frame, lineStart(scene.lines, scene.subAt) + 10, 16);
  return (
    <Shell scene={scene} chapterNum={chapterNum}>
      <Backdrop />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", marginTop: -40 }}>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 440,
              lineHeight: 0.85,
              backgroundImage: `linear-gradient(180deg, #eafff2 0%, ${COLORS.doom} 60%, #0d4a2b 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {count}
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", margin: "26px 0 34px" }}>
            {new Array(target).fill(0).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 26,
                  height: 40,
                  borderRadius: 4,
                  border: `2px solid ${COLORS.doom}`,
                  background: i < count ? COLORS.doom : "transparent",
                  boxShadow: i < count ? `0 0 12px ${COLORS.doom}` : "none",
                }}
              />
            ))}
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 84, letterSpacing: 8, color: COLORS.text, opacity: lab }}>{scene.label}</div>
          <div style={{ fontFamily: FONTS.body, fontStyle: "italic", fontWeight: 600, fontSize: 48, color: COLORS.doom, marginTop: 14, opacity: sub }}>{scene.sub}</div>
        </div>
      </AbsoluteFill>
    </Shell>
  );
};
