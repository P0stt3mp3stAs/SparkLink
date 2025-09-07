// src/components/AudioMessage.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface AudioMessageProps {
  src: string;
}

export default function AudioMessage({ src }: AudioMessageProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 -> 1
  const [duration, setDuration] = useState(0);

  // Static waveform bars (percent heights)
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // create percent-based heights so they never overflow container
    const waveform = Array.from({ length: 50 }, () =>
      Math.floor(Math.random() * 75 + 20) // 20% -> 95%
    );
    setBars(waveform);
  }, [src]);

  // Robust event wiring to ensure we get duration and time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // ensure browser tries to load metadata
    audio.preload = "metadata";

    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    // Some sources update duration via 'durationchange'
    const onDurationChange = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      const d = audio.duration;
      if (d && Number.isFinite(d) && d > 0) {
        setProgress(audio.currentTime / d);
        setDuration(d); // keep duration in sync if available
      } else {
        setProgress(0);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPauseOrEnd = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPauseOrEnd);
    audio.addEventListener("ended", onPauseOrEnd);

    // If already have metadata (readyState), read it now
    if (audio.readyState >= 1 && Number.isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPauseOrEnd);
      audio.removeEventListener("ended", onPauseOrEnd);
    };
  }, [src]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
      // play/pause events update isPlaying, but optimistically toggle to avoid small race
      setIsPlaying(prev => !prev);
    } catch (err) {
      // autoplay / play() rejection handling
      console.warn("Audio play failed:", err);
      setIsPlaying(false);
    }
  };

  const formatTime = (time: number) => {
    if (!Number.isFinite(time) || time <= 0) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Prefer the real currentTime when available for displayed current time
  const displayedCurrent = (() => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.currentTime)) return audio.currentTime;
    return progress * duration;
  })();

  return (
    <div className="flex items-center w-full max-w-[700px] bg-green-500 text-white rounded-3xl p-3 space-x-3 shadow-lg">
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="bg-white text-green-600 rounded-full p-2 flex-shrink-0"
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Waveform: percent heights, centered vertically, clipped */}
      <div className="flex-1 flex items-center h-10 space-x-[2px] overflow-hidden">
        {bars.map((heightPct, i) => {
          const barProgress = (i + 1) / bars.length;
          const isPlayed = progress >= barProgress;
          return (
            <div
              key={i}
              className="rounded-sm flex-shrink-0 transition-colors duration-200 self-center"
              style={{
                width: `${100 / bars.length}%`,
                height: `${heightPct}%`, // percent of container height - will not overflow
                backgroundColor: isPlayed ? "black" : "white",
              }}
            />
          );
        })}
      </div>

      {/* Time */}
      <div className="ml-2 text-xs w-16 text-right font-mono flex-shrink-0">
        {formatTime(displayedCurrent)} / {formatTime(duration)}
      </div>

      <audio
        ref={audioRef}
        src={src}
        hidden
        preload="metadata"
      />
    </div>
  );
}
