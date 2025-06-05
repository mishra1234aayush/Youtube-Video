import React, { useRef, useState, useEffect } from "react";
import './Css/VideoPlayer.css'; 

const formatTime = (s) => `${Math.floor(s / 60)}:${("0" + Math.floor(s % 60)).slice(-2)}`;

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [state, setState] = useState({
    isPlaying: false,
    volume: 1,
    quality: "320",
    currentTime: 0,
    duration: 0,
    isMuted: false,
    lastVolume: 1,
    prevQuality: "320",
    isTransitioning: false,
  });

  const updateState = (updates) => setState((prev) => ({ ...prev, ...updates }));

  const togglePlay = () => {
    const v = videoRef.current;
    v.paused ? v.play() : v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    const mute = v.muted || state.volume === 0;
    updateState({
      isMuted: !mute,
      volume: mute ? state.lastVolume : 0,
      lastVolume: mute ? state.lastVolume : state.volume,
    });
    v.volume = mute ? state.lastVolume : 0;
    v.muted = !v.muted;
  };

  const handleQualityChange = async (e) => {
    const v = videoRef.current;
    const newQ = e.target.value, wasPaused = v.paused, time = v.currentTime;
    updateState({ isTransitioning: true, prevQuality: newQ, quality: newQ, isPlaying: false });
    v.src = `/videos/SampleVideo-${newQ}p.mp4`;
    v.load();
    v.currentTime = time;
    try { if (!wasPaused) await v.play(); updateState({ isPlaying: true }); } catch {}
    setTimeout(() => updateState({ isTransitioning: false }), 1000);
  };

  useEffect(() => {
    const v = videoRef.current;
    const setTime = () => updateState({ currentTime: v.currentTime });
    const setMeta = () => updateState({ duration: v.duration, currentTime: v.currentTime });
    const onPlay = () => updateState({ isPlaying: true });
    const onPause = () => updateState({ isPlaying: false });
    v.addEventListener("loadedmetadata", setMeta);
    v.addEventListener("timeupdate", setTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("loadedmetadata", setMeta);
      v.removeEventListener("timeupdate", setTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => {
    const seek = document.querySelector(".seek-bar-container input");
    seek?.style.setProperty("--seek-before-width", `${(state.currentTime / state.duration) * 100}%`);
  }, [state.currentTime, state.duration]);

  useEffect(() => {
    const volSlider = document.querySelector(".volume-slider");
    volSlider.style.background = `linear-gradient(to right, #2196F3 ${state.volume * 100}%, #ccc ${state.volume * 100}%)`;
  }, [state.volume]);

  return (
    <div className="yt-player-container">
      <h1 className="yt-heading">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg" alt="YouTube Logo" className="yt-logo" />
      </h1>
      <video
        ref={videoRef}
        className={`yt-video ${state.isTransitioning ? "blurred" : ""}`}
        src={`/videos/SampleVideo-${state.quality}p.mp4`}
        onClick={togglePlay}
      />

      <div className="yt-controls">
        <div className="seek-bar-container">
          <input type="range" min="0" max={state.duration} step="0.1" value={state.currentTime} onChange={(e) => {
            const time = parseFloat(e.target.value);
            videoRef.current.currentTime = time;
            updateState({ currentTime: time });
          }} />
        </div>

        <div className="control-row">
          <button onClick={togglePlay}>{state.isPlaying ? "❚❚" : "▶"}</button>
          <span className="time-display">{formatTime(state.currentTime)} / {formatTime(state.duration)}</span>
          <button onClick={toggleMute}>{state.isMuted ? "🔇" : "🔊"}</button>
          <input type="range" className="volume-slider" min="0" max="1" step="0.01" value={state.volume} onChange={(e) => {
            const vol = parseFloat(e.target.value);
            updateState({ volume: vol, isMuted: vol === 0 });
            videoRef.current.volume = vol;
          }} />
          <select value={state.quality} onChange={handleQualityChange}>
            <option value="320">320p</option>
            <option value="480">480p</option>
            <option value="720">720p</option>
            <option value="1080">1080p</option>
          </select>
          <button onClick={() => videoRef.current.requestFullscreen?.()}>⛶</button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
