'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export default function AudioRecorder({ onRecordingComplete, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // -------------------------
  // START RECORDING
  // -------------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      chunksRef.current = [];

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // -------------------------
      // Timer with FORCE STOP at 60s
      // -------------------------
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const next = prev + 1;

          if (next >= 60) {
            stopRecording(); // ⛔ stops exactly at 60s
            return 60;
          }

          return next;
        });
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      onCancel();
    }
  };

  // -------------------------
  // STOP RECORDING (bulletproof)
  // -------------------------
  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      recorder.stream.getTracks().forEach(t => t.stop());
    }

    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // -------------------------
  // SEND RECORDING
  // -------------------------
  const sendRecording = () => {
    if (recordedBlob) {
      onRecordingComplete(recordedBlob);
      setRecordedBlob(null);
    }
  };

  // -------------------------
  // CANCEL RECORDING
  // -------------------------
  const cancelRecording = () => {
    stopRecording();
    setRecordedBlob(null);
    onCancel();
  };

  // -------------------------
  // CLEANUP
  // -------------------------
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // -------------------------
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // -------------------------
  // UI (unchanged)
  // -------------------------
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 z-50">
      <div className="w-full max-w-sm bg-[#111]/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-lg font-semibold">
            {isRecording ? 'Recording...' : recordedBlob ? "Review & Send" : 'Ready to record'}
          </h2>
          <span className={`text-sm font-medium ${isRecording ? 'text-red-400' : 'text-gray-300'}`}>
            {formatTime(recordingTime)}
          </span>
        </div>

        {/* Waveform / Placeholder */}
        <div className="mb-6 rounded-xl bg-black/30 h-24 flex items-center justify-center relative overflow-hidden">
          {isRecording ? (
            <div className="flex gap-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 50}px`,
                    animationDelay: `${i * 0.05}s`
                  }}
                />
              ))}
            </div>
          ) : recordedBlob ? (
            <p className="text-green-400">Recording saved. Press send →</p>
          ) : (
            <p className="text-gray-300">Press the middle button to start</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-6">

          {/* CANCEL */}
          <button
            onClick={cancelRecording}
            className="p-4 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition active:scale-90"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* START / STOP */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-6 rounded-full text-white transition active:scale-90 shadow-lg
              ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-500 hover:bg-green-600'}
            `}
          >
            {isRecording ? (
              <div className="w-7 h-7 bg-white rounded-md"></div>
            ) : (
              <div className="w-7 h-7 bg-white rounded-full"></div>
            )}
          </button>

          {/* SEND */}
          <button
            onClick={sendRecording}
            disabled={!recordedBlob}
            className={`p-4 rounded-full text-white transition active:scale-90 
              ${recordedBlob ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-300 cursor-not-allowed'}
            `}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>

        </div>

        {recordingTime >= 55 && isRecording && (
          <p className="text-center text-yellow-400 mt-4 text-sm">
            Maximum recording time: 60 seconds
          </p>
        )}
      </div>
    </div>
  );
}
