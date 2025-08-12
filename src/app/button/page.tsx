// src/app/stacked-buttons/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';

const colors = ['red', 'green', 'blue', 'yellow'];

// Orbit positions for 4 dots (starting at 9 o’clock going toward 12)
const orbitPositions = [
  { x: -80, y: 0 },   // 9 o’clock
  { x: -70, y: -40 }, // 10
  { x: -40, y: -70 }, // 11
  { x: 0, y: -80 },   // 12 o’clock
];

export default function StackedButtonsPage() {
  const [topIndex, setTopIndex] = useState(0); // which main button is visible
  const [bgColor, setBgColor] = useState('white');

  const scrollAccum = useRef(0);
  const scrollThreshold = 50;
  const containerRef = useRef<HTMLDivElement>(null);

  // For animation: store previous topIndex to animate dots between positions
  const prevTopIndex = useRef(topIndex);

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    scrollAccum.current += e.deltaY;

    if (scrollAccum.current > scrollThreshold) {
      setTopIndex((prev) => {
        prevTopIndex.current = prev;
        return (prev + 1) % colors.length;
      });
      scrollAccum.current = 0;
    } else if (scrollAccum.current < -scrollThreshold) {
      setTopIndex((prev) => {
        prevTopIndex.current = prev;
        return (prev - 1 + colors.length) % colors.length;
      });
      scrollAccum.current = 0;
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const onClickButton = (color: string) => {
    setBgColor(color);
  };

  const onClickDot = (dotIndex: number) => {
    prevTopIndex.current = topIndex;
    setTopIndex(dotIndex);
  };
  
  const getColorOrder = (startIndex: number): number[] =>
    colors.map((_, i) => (startIndex + i) % colors.length);

  const currentOrder = getColorOrder(topIndex);
  const previousOrder = getColorOrder(prevTopIndex.current);

  return (
    <div
      className="h-screen flex flex-col items-center justify-center select-none"
      style={{ backgroundColor: bgColor }}
    >
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Button stack */}
        <div
          ref={containerRef}
          className="relative overflow-hidden w-36 h-36 flex items-center justify-center"
        >
          {colors.map((color, i) => (
            <button
              key={color}
              onClick={() => onClickButton(color)}
              className={`
                absolute
                w-32 h-32
                rounded-full
                font-bold text-white text-lg
                cursor-pointer
                select-none
                transition-all duration-200
                flex items-center justify-center
                ${i === topIndex ? 'z-20 scale-105' : 'z-10 scale-100'}
                ${color === 'red' ? 'bg-red-600' : ''}
                ${color === 'green' ? 'bg-green-600' : ''}
                ${color === 'blue' ? 'bg-blue-600' : ''}
                ${color === 'yellow' ? 'bg-yellow-500' : ''}
              `}
            >
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </button>
          ))}
        </div>

        {/* Orbiting dots */}
        {colors.map((color, i) => {
          // Find this dot's index in previous and current order arrays
          const prevPosIndex = previousOrder.indexOf(i);
          const currPosIndex = currentOrder.indexOf(i);

          // Positions for previous and current
          const prevPos = orbitPositions[prevPosIndex];
          const currPos = orbitPositions[currPosIndex];

          return (
            <button
              key={color}
              onClick={() => onClickDot(i)}
              className={`absolute w-6 h-6 rounded-full border-2 border-black transition-transform duration-500 ease-in-out ${
                i === topIndex ? 'ring-2 ring-black scale-110' : 'scale-100'
              }`}
              style={{
                backgroundColor: color,
                transform: `translate(${currPos.x}px, ${currPos.y}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
