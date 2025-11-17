// src/app/test/page.tsx
"use client";

import { useState } from "react";
import FluidGlassButton from "@/components/FluidGlassButton";

export default function TestPage() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-10 p-10"
         style={{
           backgroundImage: 'url(/bgtexttest.png)',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed',
         }}>
      
      <div className="relative z-10 text-center">
        <h1 className="text-white mb-12 text-4xl md:text-5xl font-light tracking-wide drop-shadow-2xl">
          PURE GLASS BUTTONS
        </h1>
        
        <div className="flex flex-col gap-8 items-center">
          
          {/* Strong Distortion */}
          <div>
            <h3 className="text-white/90 mb-5 text-xl font-medium">
              Strong Glass Distortion
            </h3>
            <FluidGlassButton 
              label={`Clicks: ${clickCount}`}
              onClick={() => setClickCount(prev => prev + 1)}
              width={300}
              height={100}
              borderRadius={25}
              opacity={0.4}
              blur={2}
              distortionScale={-200}
              displace={5}
            />
          </div>

          {/* Crystal Clear */}
          <div>
            <h3 className="text-white/90 mb-5 text-xl font-medium">
              Crystal Clear Glass
            </h3>
            <FluidGlassButton 
              label="Crystal Glass"
              onClick={() => console.log("Crystal glass clicked")}
              width={280}
              height={90}
              borderRadius={30}
              opacity={0.25}
              blur={1}
              distortionScale={-150}
            />
          </div>

          {/* Subtle Effect */}
          <div>
            <h3 className="text-white/90 mb-5 text-xl font-medium">
              Subtle Glass
            </h3>
            <FluidGlassButton 
              label="Subtle Glass"
              onClick={() => console.log("Subtle glass clicked")}
              width={260}
              height={85}
              borderRadius={20}
              opacity={0.2}
              blur={4}
              distortionScale={-100}
            />
          </div>

          {/* Disabled */}
          <div>
            <h3 className="text-white/90 mb-5 text-xl font-medium">
              Frosted Glass
            </h3>
            <FluidGlassButton 
              label="Frosted Glass"
              onClick={() => console.log("This shouldn't trigger")}
              disabled={true}
              width={240}
              height={80}
              borderRadius={18}
              opacity={0.15}
              blur={6}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
          <p className="text-white text-lg m-0">
            🔍 <strong>Hover over the buttons</strong> to see the pure glass effect
          </p>
          <p className="text-white/80 text-sm mt-2 m-0">
            Clean white glass distortion without RGB colors
          </p>
        </div>
      </div>
    </div>
  );
}