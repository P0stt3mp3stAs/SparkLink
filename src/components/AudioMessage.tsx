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
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    const waveform = Array.from({ length: 25 }, () =>
      Math.floor(Math.random() * 70 + 30)
    );
    setBars(waveform);
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.preload = "metadata";

    const onLoadedMetadata = () => {
      if (audio.duration > 0) setDuration(audio.duration);
    };

    const onTimeUpdate = () => {
      if (audio.duration > 0) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [src]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) audio.pause();
      else await audio.play();

      setIsPlaying(!isPlaying);
    } catch (e) {
      console.warn("Play failed", e);
    }
  };

  const formatTime = (t: number) => {
    if (!t) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex items-center w-full max-w-[700px] text-white rounded-3xl p-2 space-x-3">

      {/* LEFT FIXED WIDTH: Play/Pause */}
      <div className="w-12 flex justify-center">
        <button
          onClick={togglePlay}
          className="bg-white text-[#2A5073] rounded-full p-2"
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>

      {/* MIDDLE FIXED WIDTH: WAVEFORM */}
      <div className="w-[70] h-10 flex items-center overflow-visible space-x-[2px]">
        {bars.map((h, i) => {
          const played = progress >= (i + 1) / bars.length;

          return (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: `${70 / 25 - 2}px`, // EXACT BAR WIDTH (fixed)
                height: `${h}%`,
                backgroundColor: played ? "black" : "white",
              }}
            />
          );
        })}
      </div>

      {/* RIGHT FIXED WIDTH: Time */}
      <div className="w-20 text-right text-xs font-mono">
        {formatTime(duration * progress)} / {formatTime(duration)}
      </div>

      <audio ref={audioRef} src={src} hidden preload="metadata" />
    </div>
  );
}
