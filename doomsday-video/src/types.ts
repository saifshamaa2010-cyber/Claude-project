export type Line = {
  t: string;
  start: number;
  end: number;
  from: number;
  to: number;
  kicker?: string;
};

// Scene data comes straight from script/script.json (plus timings added by
// tools/build_audio.py), so each scene component reads the fields it needs.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Scene = { [key: string]: any } & {
  id: string;
  type: string;
  from: number;
  durationInFrames: number;
  lines: Line[];
  chapter?: string;
};

export type Timeline = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  scenes: Scene[];
};

export type SceneProps = { scene: Scene; chapterNum?: string };
