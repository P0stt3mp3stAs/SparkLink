'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from "framer-motion";

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
  const [screenWidth, setScreenWidth] = useState(0);

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

  useEffect(() => {
    // Set on mount
    setScreenWidth(window.innerWidth);

    // Update on resize
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- thresholds for each breakpoint ---
  let appearAt = 0;
  let translateAt = 0;

  if (screenWidth >= 2536) {
    appearAt = 5200;
    translateAt = 6000;
  } else if (screenWidth >= 1536) {
    appearAt = 4500;
    translateAt = 5500;
  } else if (screenWidth >= 1280) {
    appearAt = 4300;
    translateAt = 5200;
  } else if (screenWidth >= 1024) {
    appearAt = 3700;
    translateAt = 4800;
  } else if (screenWidth >= 768) {
    appearAt = 3300;
    translateAt = 3800;
  } else {
    appearAt = 3800;
    translateAt = 4200;
  }

  useEffect(() => {
    setScreenWidth(window.innerWidth);
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- thresholds for bg-black ---
  let blackAt = 0;
  if (screenWidth >= 2500) {
    blackAt = 5500; 
  } else if (screenWidth >= 1280) {
    blackAt = 4800; 
  } else if (screenWidth >= 1024) {
    blackAt = 4200; 
  } else if (screenWidth >= 640) {
    blackAt = 3800; 
  } else {
    blackAt = 4200;
  }

  return (
    <div
      ref={scrollRef}
      className={`h-screen overflow-y-scroll transition-all duration-[2000ms] ease-in-out ${
      info.scrollY >= blackAt
        ? "bg-black"
      :info.scrollY >= 1800
        ? 'bg-green-500'
      : info.scrollY >= 1500
        ? 'bg-white'
        : info.scrollY >= 900
        ? 'bg-[radial-gradient(circle_at_center,_#000000_0%,_#0b0040_100%)]' // black inside, dark blue outside
        : 'bg-[radial-gradient(circle_at_center,_#0b0040_0%,_#000000_100%)]' // dark blue inside, black outside
    }`}
    >
      {/* Long content to allow scrolling */}
      <div className="h-[720vh] flex flex-col">
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

    <div className="relative pt-60 w-full h-[100vh]">
      {/* Horizontal line in the middle */}
      <div
        className={`absolute top-1/2 left-0 w-full h-[clamp(16px,4vw,60px)] bg-white transition-opacity duration-500 ${
          info.scrollY >= 1800 ? "opacity-100" : "opacity-0"
        }`}
      />

    {/* Left curved line (SVG instead of div) */}
    <svg
      className={`absolute top-0 left-0 h-[300vh] w-full transition-all duration-500 z-[0] ${
        info.scrollY >= 4000 
          ? "translate-y-[-1000px]"
          : info.scrollY >= 1800 
          ? "opacity-100" : "opacity-0"
      }`}
      viewBox="0 0 100 300"
      preserveAspectRatio="none"
    >
      <path
        d="
          M 25 0
          L 25 100
          C 25 120, 40 130, 50 150
          C 60 170, 50 180, 50 200
          L 50 300
        "
        stroke="white"
        strokeWidth="4"
        fill="none"
      />
    </svg>

      {/* Right vertical line (only top half) */}
      <div
        className={`absolute top-0 right-1/4 h-1/2 w-[clamp(16px,4vw,48px)] bg-white transition-opacity duration-500 ${
          info.scrollY >= 1800 ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Icon above the lines */}
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-full">
        <Image
          src="/loc.svg"
          alt="Location"
          width={0}
          height={0}
          sizes="100vw"
          className={`w-[clamp(60px,12vw,160px)] h-auto transition-opacity duration-500 ${
            info.scrollY >= 1800 ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <p
        className={`hidden sm:block absolute bottom-50 right-10 text-white text-[clamp(14px,2vw,28px)] font-semibold transition-opacity duration-500 ${
          info.scrollY >= 1800 ? "opacity-100" : "opacity-0"
        }`}
      >
        Share location to meet your new friends
      </p>

      <p
        className={`sm:hidden absolute top-[70%] left-1/2 -translate-x-1/3 mt-4 text-white text-[clamp(8px,4vw,22px)] font-semibold text-center transition-opacity duration-500 ${
          info.scrollY >= 1800 ? "opacity-100" : "opacity-0"
        }`}
      >
        Share location to meet your new friends
      </p>
    </div>


    <div
      className={`mx-auto mt-[180vh] w-2/3 transition-opacity duration-700 z-[10]
        ${info.scrollY >= 2800 ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <Image
        src="/au.svg"
        alt="AU Feature"
        width={800}
        height={600}
        className="w-full h-auto"
      />
    </div>
    <div
      className={`mx-auto w-2/3 transition-all duration-700 z-[10]
        -mt-10 sm:-mt-20 md:-mt-30 lg:-mt-40 xl:-mt-50
        ${
          info.scrollY >= translateAt
            ? "translate-y-[300px] scale-75 opacity-100"
            : info.scrollY >= appearAt
            ? "opacity-100"
            : "opacity-0"
        }`}
    >
      <Image
        src="/audio2.svg"
        alt="audio"
        width={800}
        height={600}
        className="w-full h-auto"
      />
    </div>


    <div className="w-full h-[100vh] flex items-center justify-center mt-50 sm:mt-60 md:mt-70 lg:mt-80 xl:mt-90 relative">
      {/* Background repeated text */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center text-white font-bold leading-tight transition-opacity duration-1700 z-[0] space-y-4
        ${info.scrollY >= 4700 ? "opacity-100" : "opacity-0"}`}>
        <p className="w-full text-center text-[6vw] whitespace-nowrap">
          spam friends with repeat texts
        </p>
        <p className="w-full text-center text-[6vw] whitespace-nowrap">
          spam friends with repeat texts
        </p>
        <p className="w-full text-center text-[6vw] whitespace-nowrap">
          spam friends with repeat texts
        </p>
        <p className="w-full text-center text-[6vw] whitespace-nowrap">
          spam friends with repeat texts
        </p>
        <p className="w-full text-center text-[6vw] whitespace-nowrap">
          spam friends with repeat texts
      </p>
      </div>

        {/* Foreground animations */}
        <div
          className={`relative transition-opacity duration-700 z-[10]
            ${info.scrollY >= 3000 ? "opacity-100" : "opacity-0"}
          `}
        >
        {/* Boom Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={
            info.scrollY >= 4700
              ? { scale: [0, 2.5, 1], opacity: 1 }
              : { scale: 0, opacity: 1 }
          }
          transition={{
            duration: 1.2,
            ease: "easeOut",
            times: [0, 0.6, 1],
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                    w-[70vw] h-auto opacity-30"
        >
          <Image src="/boom.svg" alt="boom" width={800} height={600} />
        </motion.div>

        {/* Bomb Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={
            info.scrollY >= 4700
              ? { scale: 1, opacity: 1 }
              : { scale: 0, opacity: 0 }
          }
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="relative mx-auto w-[40vw] h-auto"
        >
          <Image src="/bomb.svg" alt="bomb" width={600} height={600} />
        </motion.div>
      </div>
    </div>

        <div className="flex-1"></div>
      </div>

      {/* Debug overlay */}
      <div className="fixed top-5 left-5 bg-opacity-70 text-white p-3 rounded-md font-mono text-sm z-50">
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