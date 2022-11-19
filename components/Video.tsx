import * as React from "react";
import { render } from "react-dom";
import videojs from "video.js";

export interface IClosedCaptionState {
  videoPlayerReference: videojs.Player;
  activeCueText: string;
}

export default class ClosedCaption extends React.Component<
  any,
  IClosedCaptionState
> {
  public constructor(props) {
    super(props);
    this.state = {
      videoPlayerReference: null,
      activeCueText: ""
    };
    this.videoPlayerRef = React.createRef();
  }

  public componentDidMount() {
    this.setState(
      { videoPlayerReference: videojs(this.videoPlayerRef.current) },
      () => {
        const player = this.state.videoPlayerReference;
        player.ready(() => {
          const track = player.textTracks()[0];
          track.addEventListener("cuechange", () => {
            if (track.activeCues != null) {
              const cue = track.activeCues[0];
              if (cue !== undefined) {
                this.setState({ activeCueText: track.activeCues[0].text });
              }
            }
          });
        });
      }
    );
  }

  public render(): React.ReactElement<any> {
    return (
      <div>
        <video
          className="video-js"
          controls
          preload="auto"
          id="video"
          ref={this.videoPlayerRef}
          muted
          autoPlay
          width='auto'
          height='auto'
          style={{ width: "550px", height: "340px" }}
        >
          <source
            src={this.props.videoURL}
            type="video/mp4"
          />
          <track
            kind="captions"
            src="https://videojs.github.io/videojs-contrib-hls/opensubtitles.vtt"
            srcLang="en"
            label="English"
            default
          />
        </video>
        <p style={{ fontWeight: "bold" }}>{this.state.activeCueText}</p>
      </div>
    );
  }
}

