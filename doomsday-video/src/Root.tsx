import "./theme";
import React from "react";
import { Composition, Still } from "remotion";
import { DoomsdayVideo, TIMELINE } from "./DoomsdayVideo";
import { SHORT_DURATION, ShortVideo } from "./ShortVideo";
import { Thumbnail } from "./Thumbnail";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Doomsday"
        component={DoomsdayVideo}
        durationInFrames={TIMELINE.durationInFrames}
        fps={TIMELINE.fps}
        width={TIMELINE.width}
        height={TIMELINE.height}
        defaultProps={{ showCaptions: false }}
      />
      <Composition id="Short" component={ShortVideo} durationInFrames={SHORT_DURATION} fps={TIMELINE.fps} width={1080} height={1920} />
      <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
    </>
  );
};
