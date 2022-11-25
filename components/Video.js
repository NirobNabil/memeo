import React, { Component } from 'react';
import { Player } from 'video-react';
import "video-react/dist/video-react.css";


export default class PlayerExample extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      playerSource: this.props.videoURL,
    };

  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.playerSource !== prevState.playerSource) {
      this.player.load();
    }
  }

  

 

  render() {
    return (
        <Player
          ref={player => {
            this.player = player;
          }}
          autoPlay
          muted
          playsInline
        >
          <source src={this.state.playerSource} />
        </Player>
    );
  }
}