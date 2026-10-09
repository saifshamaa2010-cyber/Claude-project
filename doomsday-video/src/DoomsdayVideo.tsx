import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame } from "remotion";
import { activeLine } from "./anim";
import { Grain } from "./components/Backdrop";
import timelineJson from "./data/timeline.json";
import { Dossier } from "./scenes/Dossier";
import { BattleworldScene, BigStatScene, IncursionScene, QuoteScene, TimelineScene, UniversesScene } from "./scenes/Explainers";
import { ChapterCard, ColdOpen, TitleCard } from "./scenes/Intro";
import { OutroScene, WatchlistScene } from "./scenes/Outro";
import { DisclaimerScene, RumorScene } from "./scenes/Rumors";
import { RosterScene, TrioScene } from "./scenes/Teams";
import { BeatsScene, TeasersScene } from "./scenes/Trailer";
import { COLORS, FONTS } from "./theme";
import type { Scene, SceneProps, Timeline } from "./types";

export const TIMELINE = timelineJson as unknown as Timeline;

const SCENES: Record<string, React.FC<SceneProps>> = {
  coldOpen: ColdOpen,
  title: TitleCard,
  chapter: ChapterCard,
  dossier: Dossier,
  timeline: TimelineScene,
  incursion: IncursionScene,
  quote: QuoteScene,
  universes: UniversesScene,
  battleworld: BattleworldScene,
  bigStat: BigStatScene,
  trio: TrioScene,
  roster: RosterScene,
  beats: BeatsScene,
  teasers: TeasersScene,
  disclaimer: DisclaimerScene,
  rumor: RumorScene,
  watchlist: WatchlistScene,
  outro: OutroScene,
};

const chapterNumFor = (scenes: Scene[], index: number) => {
  for (let i = index; i >= 0; i--) {
    if (scenes[i].type === "chapter") return scenes[i].num as string;
  }
  return undefined;
};

export type VideoProps = { showCaptions: boolean };

export const DoomsdayVideo: React.FC<VideoProps> = ({ showCaptions }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {TIMELINE.scenes.map((scene, i) => {
        const Comp = SCENES[scene.type];
        return (
          <Sequence key={scene.id} name={scene.id} from={scene.from} durationInFrames={scene.durationInFrames}>
            <Comp scene={scene} chapterNum={chapterNumFor(TIMELINE.scenes, i)} />
            {showCaptions && scene.lines.length > 0 && scene.type !== "coldOpen" ? <Captions scene={scene} /> : null}
          </Sequence>
        );
      })}
      <Grain />
      <Audio src={staticFile("audio/soundtrack.wav")} />
    </AbsoluteFill>
  );
};

/** Optional burned-in captions (YouTube upload uses youtube/captions.srt instead). */
const Captions: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const line = scene.lines[activeLine(scene.lines, frame)];
  if (frame < line.from || frame > line.to + 6) return null;
  const words = line.t.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 9) chunks.push(words.slice(i, i + 9).join(" "));
  const idx = Math.min(chunks.length - 1, Math.floor(((frame - line.from) / Math.max(1, line.to - line.from)) * chunks.length));
  return (
    <div style={{ position: "absolute", bottom: 60, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "rgba(0,0,0,0.72)", padding: "10px 26px", fontFamily: FONTS.body, fontWeight: 600, fontSize: 40, color: COLORS.text, borderRadius: 8 }}>{chunks[idx]}</div>
    </div>
  );
};
