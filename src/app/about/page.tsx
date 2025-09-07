// src/app/about/page.tsx
'use client'

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12">
      <div className="w-full max-w-3xl text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold">
          About <span className="text-blue-400">El Ghali Wali Alami</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-300">
          Hi 👋, I am <span className="font-semibold text-white">El Ghali Wali Alami</span>,  
          a passionate <span className="text-blue-400">web development student</span> from Morocco.  
          I love building creative, user-friendly, and modern applications with  
          <span className="text-purple-400"> Next.js</span>, <span className="text-green-400">React</span>, and cloud technologies.
        </p>

        <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-300">
          I am always curious about how things work on the web — from smooth  
          animations to scalable backend systems. My goal is to become a  
          well-rounded developer who can craft not just functional apps, but  
          <span className="font-semibold text-white"> experiences people enjoy using</span>.
        </p>

        <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-300">
          Outside of coding, I value <span className="text-yellow-400">creativity, independence,  
          and problem-solving</span>. I believe that learning by building is the best  
          way to grow, and that is exactly what I strive for in every project I take on.
        </p>

        <div className="pt-6">
          <Link 
            href="/" 
            className="px-6 py-3 text-base sm:text-lg md:text-xl bg-purple-600 hover:bg-purple-700 rounded-xl font-medium shadow-md transition-all"
          >
            ⬅️ Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}
