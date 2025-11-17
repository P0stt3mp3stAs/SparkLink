import { useState } from 'react';

export default function CardStack() {
  const [front, setFront] = useState<0 | 1>(0);

  const handleClick = (index: 0 | 1) => {
    if (index !== front) setFront(index);
  };

  return (
    <div className="relative w-full max-w-5xl h-4/5 flex flex-col sm:flex-row items-center justify-center sm:justify-center gap-4 sm:gap-6 sm:space-x-6">

      {/* Card 0 */}
      <div
        onClick={() => handleClick(1)}
        className={`
          w-64 sm:w-72 md:w-80 h-96 sm:h-[28rem] md:h-[30rem]
          bg-gradient-to-b from-[#FCE9CE] to-[#FFF5E6]
          rounded-3xl shadow-xl sm:shadow-none cursor-pointer
          transition-all duration-300
          flex flex-col items-center justify-between
          p-4 absolute sm:relative
          ${front === 1 
            ? 'z-20' 
            : 'z-10 -translate-x-6 -translate-y-4 sm:translate-x-0 sm:translate-y-0'}
        `}
      >
        {/* Title */}
        <h2 className="text-center text-sm sm:text-base md:text-lg font-bold text-[#2A5073] z-10">
          Glide through the crowd and spot your one.
        </h2>

        {/* Image — same size, same visual position */}
        <img 
          src="/gildelp.svg" 
          alt="Glide LP" 
          className="w-3/4 h-3/4 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/5"
        />

        {/* Paragraph */}
        <p className="text-center text-[10px] sm:text-[11px] text-[#2A5073] z-10 -translate-y-10">
          Swipe through profiles with ease.<br />
          Clean, simple, human — exactly how matching should feel.
        </p>

        {/* Click Hand SVG */}
        {front === 0 && (
          <img
            src="/click.svg"
            alt="Click to reveal"
            className="absolute top-2 left-2 w-6 h-6 sm:hidden animate-bounce pointer-events-none z-20"
          />
        )}
      </div>

      
      {/* Card 1 */}
      <div
        onClick={() => handleClick(0)}
        className={`
          w-64 sm:w-72 md:w-80 h-96 sm:h-[28rem] md:h-[30rem]
          bg-gradient-to-b from-[#FCE9CE] to-[#FFF5E6]
          rounded-3xl shadow-xl sm:shadow-none cursor-pointer
          transition-all duration-300
          flex flex-col items-center justify-between
          p-4 absolute sm:relative
          ${front === 0 
            ? 'z-20' 
            : 'z-10 -translate-x-6 -translate-y-4 sm:translate-x-0 sm:translate-y-0'}
        `}
      >
        {/* Title at the top */}
        <h2 className="text-center text-sm sm:text-base md:text-lg font-bold text-[#2A5073] z-10">
          Fade through A 4U Page Designed for EVERYONE.
        </h2>

        {/* Image stays exactly as before, but absolute in center */}
        <img 
          src="/fadelp.svg" 
          alt="Fade LP" 
          className="w-3/4 h-3/4 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/5"
        />

        {/* Paragraph at the bottom */}
        <p className="text-center text-[9px] sm:text-[10px] text-[#2A5073] z-10 -translate-y-8">
          Endless videos. Zero pressure.<br />
          Share what you love, watch what you want,<br />
          and explore a world full of creativity.<br />
          Watch humans instead of slop.
        </p>

        {/* Click Hand SVG */}
        {front === 1 && (
          <img
            src="/click.svg"
            alt="Click to reveal"
            className="absolute top-2 left-2 w-6 h-6 sm:hidden animate-bounce pointer-events-none z-20"
          />
        )}
      </div>
    </div>
  );
}


