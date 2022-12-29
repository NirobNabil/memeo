import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Player } from 'video-react';
import "video-react/dist/video-react.css";


export default function PlayerExample(props) {
  const [videoURL, setVideoURL] = useState(props.videoURL);
  const [muted, setMuted] =  useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  const playerRef = useRef(null);
  const divRef = useRef(null);

  useEffect(() => {
    if(props.videoURL){
      setVideoURL(props.videoURL);
    }
  }, [props.videoURL]);

  useEffect(() => {
    if(divRef.current){
      // if video is disapper then set muted true autoPlay false if appear set muted false autoplay true
      const observer = new IntersectionObserver((entries) => {
        if(entries[0].isIntersecting){
          setMuted(false);
          setAutoPlay(true);
        }else{
          setMuted(true);
          setAutoPlay(false);
        }
      });
      observer.observe(divRef.current);
    }
  }, [divRef]);
      
  useEffect(() => {
    if(playerRef.current){
      if(autoPlay){
        playerRef.current.play();
      }else{
        playerRef.current.pause();
      }
    }
  }, [autoPlay]);

  useEffect(() => {
    if(playerRef.current){
      if(muted){
        playerRef.current.muted = true;
      }else{
        playerRef.current.muted = false;
      }
    }
  }, [muted]);

    

 
  

 

    return (
      <div ref={divRef}>
        <Player
          ref={playerRef}
          autoPlay={autoPlay}
          muted={muted}
        >
          <source src={videoURL} />
        </Player>
      </div>
    );
}