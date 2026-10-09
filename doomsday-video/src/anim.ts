import { Easing, interpolate } from "remotion";
import type { Line } from "./types";

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 → 1 progress starting at `start`, lasting `dur` frames. */
export const appear = (frame: number, start: number, dur = 14) =>
  interpolate(frame, [start, start + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

/** Fade the whole scene in and out so hard cuts feel intentional. */
export const sceneFade = (frame: number, duration: number, inF = 8, outF = 8) =>
  interpolate(frame, [0, inF, duration - outF, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Frame (scene-relative) at which narration line `at` starts. */
export const lineStart = (lines: Line[], at: number | undefined) => {
  if (at === undefined || lines.length === 0) return 0;
  const line = lines[Math.min(at, lines.length - 1)];
  return Math.max(0, line.from - 4);
};

/** Index of the narration line currently being spoken. */
export const activeLine = (lines: Line[], frame: number) => {
  let idx = 0;
  lines.forEach((l, i) => {
    if (frame >= l.from - 4) idx = i;
  });
  return idx;
};
