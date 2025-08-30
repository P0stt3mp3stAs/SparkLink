"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";

interface AudioMessageProps {
  src: string;
}

export default function AudioMessage({ src }: AudioMessageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [duration, setDuration] = useState(0);

  // Static waveform bars
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    // Generate 50 bars with random heights (8px → 40px)
    const waveform = Array.from({ length: 50 }, () =>
      Math.floor(Math.random() * 32 + 8)
    );
    setBars(waveform);
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress(audioRef.current.currentTime / audioRef.current.duration);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time: number) => {
    if (!time) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    // Widened container
    <div className="flex items-center w-full max-w-[700px] bg-green-500 text-white rounded-3xl p-3 space-x-3 shadow-lg">
      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className="bg-white text-green-600 rounded-full p-2 flex-shrink-0"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Waveform */}
      <div className="flex-1 flex items-center h-10 space-x-[2px]">
        {bars.map((height, i) => {
          const barProgress = (i + 1) / bars.length;
          const isPlayed = progress >= barProgress;
          return (
            <div
              key={i}
              className="rounded-sm flex-shrink-0 transition-colors duration-200"
              style={{
                width: `${100 / bars.length}%`,
                height: `${height}px`,
                backgroundColor: isPlayed ? "black" : "white",
                alignSelf: "center",
              }}
            />
          );
        })}
      </div>

      {/* Time */}
      <div className="ml-2 text-xs w-14 text-right font-mono flex-shrink-0">
        {formatTime(progress * duration)} / {formatTime(duration)}
      </div>

      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        hidden
      />
    </div>
  );
}
