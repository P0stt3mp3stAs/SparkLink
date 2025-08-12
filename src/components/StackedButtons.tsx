// src/components/StackedButtons.tsx
'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';

type ButtonData = {
  bgClass: string;  // Tailwind CSS class for background color (e.g. 'bg-red-500')
  content: ReactNode;
  onClick?: () => void; 
};

type StackedButtonsProps = {
  buttons: ButtonData[];
  size?: number; // container size in px, default 192
};

const orbitPositions = [
  { x: -25, y: 0 },   // 9 o’clock
  { x: -25, y: -14 }, // 10
  { x: -14, y: -25 }, // 11
  { x: 0, y: -28 },   // 12 o’clock
];

export default function StackedButtons({
  buttons,
  size = 192,
}: StackedButtonsProps) {
  const [topIndex, setTopIndex] = useState(0);
  const prevTopIndex = useRef(topIndex);
  const scrollAccum = useRef(0);
  const scrollThreshold = 50;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) return;

      e.preventDefault();
      e.stopPropagation();

      scrollAccum.current += e.deltaY;

      if (scrollAccum.current > scrollThreshold) {
        setTopIndex((prev) => {
          prevTopIndex.current = prev;
          return (prev + 1) % buttons.length;
        });
        scrollAccum.current = 0;
      } else if (scrollAccum.current < -scrollThreshold) {
        setTopIndex((prev) => {
          prevTopIndex.current = prev;
          return (prev - 1 + buttons.length) % buttons.length;
        });
        scrollAccum.current = 0;
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, [buttons.length]);

  const getOrder = (start: number) =>
    buttons.map((_, i) => (start + i) % buttons.length);

  const currentOrder = getOrder(topIndex);
  const previousOrder = getOrder(prevTopIndex.current);

  // Scale positions based on size (original design base: 48 units)
  const scalePos = (pos: { x: number; y: number }) => ({
    x: (pos.x * size) / 48,
    y: (pos.y * size) / 48,
  });

  // Button & dot sizes scaled from base 32 and 6 px
  const buttonSize = (32 * size) / 48;
  const dotSize = (6 * size) / 48;

  const onClickDot = (i: number) => {
    prevTopIndex.current = topIndex;
    setTopIndex(i);
  };

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{
        width: size,
        height: size,
        touchAction: 'none', // prevent default scroll on touchpads in container
      }}
    >
      {/* Buttons stack */}
      {buttons.map(({ bgClass, content, onClick }, i) => (
        <button
          key={i}
          onClick={onClick ?? (() => {})}
          className={`absolute rounded-full flex items-center justify-center cursor-default
            transition-all duration-200 select-none
            ${i === topIndex ? 'z-20 scale-105' : 'z-10 scale-100'} ${bgClass}`}
          style={{
            width: buttonSize,
            height: buttonSize,
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) ${
              i === topIndex ? 'scale(1.05)' : 'scale(1)'
            }`,
          }}
          aria-label={`Button ${i}`}
          type="button"
        >
          {content}
        </button>
      ))}

      {/* Orbiting dots */}
      {buttons.map(({ bgClass }, i) => {
        const prevPosIndex = previousOrder.indexOf(i);
        const currPosIndex = currentOrder.indexOf(i);

        const prevPos = scalePos(orbitPositions[prevPosIndex]);
        const currPos = scalePos(orbitPositions[currPosIndex]);

        return (
          <button
            key={i}
            onClick={() => onClickDot(i)}
            className={`absolute rounded-full border-2 border-black
              transition-transform duration-500 ease-in-out
              ${i === topIndex ? 'ring-2 ring-black scale-110' : 'scale-100'} ${bgClass}`}
            style={{
              width: dotSize,
              height: dotSize,
              top: size / 2,
              left: size / 2,
              transform: `translate(${currPos.x}px, ${currPos.y}px)`,
              boxShadow: `0 0 5px currentColor`, // subtle glow, currentColor from bgClass
            }}
            aria-label={`Dot ${i}`}
            type="button"
          />
        );
      })}
    </div>
  );
}
