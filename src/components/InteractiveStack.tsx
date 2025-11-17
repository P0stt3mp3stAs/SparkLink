'use client';

import { useState, useEffect, useRef } from 'react';
import StackedButtons from './StackedButtons';

export default function InteractiveStack() {
  const [activeCard, setActiveCard] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const buttonsData = [
    { label: 'A', color: '#2A5073', text: 'About', svg: '/about.svg', buttonClass: 'bg-[#2A5073]' },
    { label: 'B', color: '#FFD700', text: 'The Creator', svg: '/creator.svg', buttonClass: 'bg-[#FFD700]' },
    { label: 'C', color: '#58D67E', text: 'Contact', svg: '/text.svg', buttonClass: 'bg-[#58D67E]' },
    { label: 'D', color: '#7937D6', text: 'Smach', svg: '/play.svg', buttonClass: 'bg-[#7937D6]' },
  ];

  // Auto-detect top button
  useEffect(() => {
    const interval = setInterval(() => {
      if (!containerRef.current) return;
      const buttons = Array.from(containerRef.current.querySelectorAll('button'));
      const topButtonIndex = buttons.findIndex((btn) => btn.classList.contains('z-20'));
      if (topButtonIndex !== -1 && topButtonIndex !== activeCard) {
        setActiveCard(topButtonIndex);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [activeCard]);

  return (
    <div className="h-screen w-screen flex flex-col sm:flex-row items-center justify-center p-4 gap-8">
      
      {/* Cards Container - Only show active card */}
      <div className="flex items-center justify-center flex-1 w-full">
        <div
          className="rounded-3xl flex flex-col items-center justify-center text-lg font-semibold transition-all duration-500 bg-gradient-to-b from-[#FCE9CE] to-[#FFF5E6]"
          style={{
            aspectRatio: '16/9',
            width: '100%',
            maxWidth: '700px',
          }}
        >
          {/* about */}
          {activeCard === 0 && (
            <div className="flex flex-col items-center justify-center space-y-6 p-6">
              <p className="text-[length:clamp(0.5rem,1.5cqi,1rem)] leading-relaxed text-gray-800 text-center font-medium">
                Here, you can meet people you&rsquo;re actually interested in, watch real videos made by real humans instead of slop, and get guidance from a free AI relationship advisor — all in one place.
              </p>
            </div>
          )}
          {/* the creator */}
          {activeCard === 1 && (
            <div className="flex flex-col items-center justify-center p-4 w-full h-full">
              <p className="leading-relaxed text-black text-justify px-4"
                style={{
                  fontSize: 'clamp(0.5rem, 1.8vh, 1rem)'
                }}>
                Hi 👋, I am <span className="font-semibold text-white">El Ghali Wali Alami</span>,  
                a passionate <span className="text-yellow-400">web development student</span> from Morocco.  
                I love building creative, user-friendly, and modern web applications with  
                <span className="text-purple-400"> Next.js</span>, <span className="text-blue-400">React</span>, and cloud technologies.
              </p>
            </div>
          )}
          {/* contact me */}
          {activeCard === 2 && (
            <div className="flex flex-col items-center justify-center space-y-6">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800">📞 Contact <span className="text-[#58D67E]">Me</span></h2>
              <a
                href="mailto:ghaliwali@gmail.com"
                className="bg-[#F5DCB9] hover:bg-[#E6C494] text-white font-semibold py-3 px-4 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                role="button"
              >
                <span className="text-xl">✉️</span>
                <span className="text-lg">Send me an Email</span>
              </a>
            </div>
          )}
          {/* smach */}
          {activeCard === 3 && (
            <div className="flex flex-col items-center justify-center space-y-6">
              <h2 className="text-[length:clamp(1rem,3cqi,2rem)] font-bold text-gray-800 text-center">
                Bored? You can play a quick little game here.
              </h2>
              <a
                href="/smach"
                className="bg-[#F5DCB9] hover:bg-[#E6C494] text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
                role="button"
              >
                <span className="text-xl">🎮</span>
                <span className="text-lg">Play Smach</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Buttons Container */}
      <div
        ref={containerRef}
        className="flex items-center justify-center flex-1"
      >
        <StackedButtons
          size={180}
          buttons={buttonsData.map((b) => ({
            bgClass: b.buttonClass,
            content: (
              <div className="flex flex-col items-center justify-center text-white font-bold">
                <img src={b.svg} alt={b.text} className="w-8 h-8 md:w-10 md:h-10 mb-1" />
                <span className="text-xs md:text-sm">{b.text}</span>
              </div>
            ),
          }))}
        />
      </div>

    </div>
  );
}