'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function ScrollTracker() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [info, setInfo] = useState({
    scrollY: 0,
    screenHeight: 0,
    pageHeight: 0,
  });

  // --- Typewriter state ---
  const paragraph = "To help you text your crush or just chat when you're bored";
  const [displayedText, setDisplayedText] = useState('');
  const [typingStarted, setTypingStarted] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const el = scrollRef.current || document.documentElement;

    const handleScroll = () => {
      setInfo({
        scrollY: el.scrollTop,
        screenHeight: el.clientHeight,
        pageHeight: el.scrollHeight,
      });
    };

    el.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    handleScroll(); // initial read

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // --- Typewriter effect ---
  useEffect(() => {
    // Start typing when scroll position reaches 1600 and hasn't started yet
    if (info.scrollY >= 1500 && !typingStarted && !typingComplete) {
      setTypingStarted(true);
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        if (indexRef.current < paragraph.length) {
          indexRef.current += 1;
          setDisplayedText(paragraph.slice(0, indexRef.current));
        } else {
          setTypingComplete(true);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      }, 50);
    }
  }, [info.scrollY, typingStarted, typingComplete, paragraph]);

  return (
    <div
      ref={scrollRef}
      className={`h-screen overflow-y-scroll transition-all duration-[2000ms] ease-in-out ${
      info.scrollY >= 2000
        ? 'bg-green-500'
      : info.scrollY >= 1500
        ? 'bg-white'
        : info.scrollY >= 900
        ? 'bg-[radial-gradient(circle_at_center,_#000000_0%,_#0b0040_100%)]' // black inside, dark blue outside
        : 'bg-[radial-gradient(circle_at_center,_#0b0040_0%,_#000000_100%)]' // dark blue inside, black outside
    }`}
    >
      {/* Long content to allow scrolling */}
      <div className="h-[400vh] flex flex-col">
        {/* Hero section (centered in screen) */}
        <div className="h-screen flex flex-col justify-center items-center">
          {/* Spark-Link title */}
          <h1
            className={`text-white font-bold text-center transition-all duration-700
              ${info.scrollY >= 50
                ? 'translate-y-[300px] scale-75'
                : 'translate-y-0 scale-100'}
              text-[clamp(2rem,8vw,6rem)]
              pb-10 sm:pb-16 md:pb-20
            `}
          >
            Spark-Link
          </h1>

          {/* Two overlapping logos */}
          <div className="relative flex justify-center items-center my-10 w-full">
            {/* Left logo */}
            <Image
              src="/sprklelogo.svg"
              alt="Sparkle Logo Left"
              width={200}
              height={200}
              className={`absolute w-[clamp(100px,20vw,200px)] h-auto transition-all duration-700 ${
                info.scrollY >= 50
                  ? 'translate-y-[300px] -translate-x-20 sm:-translate-x-40 md:-translate-x-80 -rotate-30 scale-75'
                  : 'translate-y-0 translate-x-0 rotate-0 scale-100'
              }`}
            />

            {/* Right logo */}
            <Image
              src="/sprklelogo.svg"
              alt="Sparkle Logo Right"
              width={200}
              height={200}
              className={`absolute w-[clamp(100px,20vw,200px)] h-auto transition-all duration-700 ${
                info.scrollY >= 50
                  ? 'translate-y-[300px] translate-x-20 sm:translate-x-40 md:translate-x-80 rotate-30 scale-75'
                  : 'translate-y-0 translate-x-0 rotate-0 scale-100'
              }`}
            />
          </div>

          {/* Fading text */}
          <h2
            className={`text-white font-bold pt-20 transition-opacity duration-700 text-center mx-auto leading-relaxed max-w-[600px] text-[clamp(0.8rem,2.5vw,1.2rem)] ${
              info.scrollY >= 50 ? 'opacity-0' : 'opacity-100'
            }`}
          >
            the place where you can kill time and meet new people
          </h2>
        </div>

        <div
          className={`mx-auto mt-10 w-2/3 text-white text-lg text-center transition-opacity duration-700
            ${info.scrollY >= 300 && info.scrollY < 900 ? 'opacity-100' : 'opacity-0'}
          `}
        >
          Imagine an app where you can share videos with the world but choose exactly how long they last—an hour, a day, or forever. It is their loss if they miss it. You would see raw, real moments from
        </div>

        <div
          className={`mx-auto mt-10 w-2/3 transition-opacity duration-700
            ${info.scrollY >= 400 && info.scrollY < 900 ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <Image
            src="/everywhere.svg"
            alt="Everywhere"
            width={800}
            height={600}
            className="w-full h-auto"
          />
        </div>

        <div
          className={`mx-auto mt-50 w-1/3 transition-opacity duration-700
            ${info.scrollY >= 900 && info.scrollY < 1400 ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <Image
            src="/cards.svg"
            alt="cards"
            width={800}   // base size, but Tailwind width controls actual size
            height={600}
            className="w-full h-auto"
          />
        </div>

        <div
          className={`mx-auto mt-10 w-2/3 text-white text-lg text-center transition-opacity duration-700
            ${info.scrollY >= 950 && info.scrollY < 1400 ? 'opacity-100' : 'opacity-0'}
          `}
        >
        Your secret spot to vibe with new people for dating or friends, totally up to u to find ur type of people
        </div>

        <div
        className={`mx-auto mt-50 w-2/3 transition-opacity duration-700
          ${info.scrollY >= 1500 && info.scrollY < 1800 ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <Image
          src="/ai.svg"
          alt="ai"
          width={800}   // base size, but Tailwind width controls actual size
          height={600}
          className="w-full h-auto"
        />
      </div>

      {/* Typewriter paragraph */}
        <div className="mx-auto mt-10 w-2/3 text-black text-center">
          <p className="text-lg md:text-xl font-medium min-h-[100px]">
            {displayedText}
            {typingStarted && !typingComplete && <span className="inline-block animate-blink">|</span>}
          </p>
        </div>

        {/* Extra filler so you can scroll */}
        <div className="flex-1"></div>
      </div>

      {/* Debug overlay */}
      <div className="fixed top-5 left-5 bg-black bg-opacity-70 text-white p-3 rounded-md font-mono text-sm z-50">
        <div>ScrollY: {info.scrollY}</div>
        <div>ScreenHeight: {info.screenHeight}</div>
        <div>PageHeight: {info.pageHeight}</div>
      </div>

      <style jsx>{`
        .animate-blink {
          animation: blink 1s step-start infinite;
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}