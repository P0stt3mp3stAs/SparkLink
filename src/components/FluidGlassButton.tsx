// src/components/FluidGlassButton.tsx
"use client";

import React, { useEffect, useRef, useState, useId } from 'react';

export interface GlassSurfaceProps {
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  borderWidth?: number;
  brightness?: number;
  opacity?: number;
  blur?: number;
  displace?: number;
  backgroundOpacity?: number;
  saturation?: number;
  distortionScale?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseUp?: (e: React.MouseEvent) => void;
}

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDark;
};

const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  width = 200,
  height = 80,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0,
  backgroundOpacity = 0,
  saturation = 1,
  distortionScale = -180,
  className = '',
  style = {},
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
}) => {
  const uniqueId = useId().replace(/:/g, '-');
  const filterId = `glass-filter-${uniqueId}`;
  const gradId = `glass-grad-${uniqueId}`;

  const containerRef = useRef<HTMLDivElement>(null);
  const feImageRef = useRef<SVGFEImageElement>(null);
  const displacementMapRef = useRef<SVGFEDisplacementMapElement>(null);
  const gaussianBlurRef = useRef<SVGFEGaussianBlurElement>(null);

  const isDarkMode = useDarkMode();

  const generateDisplacementMap = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    const actualWidth = rect?.width || 400;
    const actualHeight = rect?.height || 200;
    const edgeSize = Math.min(actualWidth, actualHeight) * (borderWidth * 0.5);

    const svgContent = `
      <svg viewBox="0 0 ${actualWidth} ${actualHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#000000"/>
            <stop offset="50%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#000000"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${actualWidth}" height="${actualHeight}" fill="url(#${gradId})" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${actualWidth - edgeSize * 2}" height="${actualHeight - edgeSize * 2}" rx="${borderRadius}" fill="rgba(255,255,255,${opacity})" style="filter:blur(${blur}px)" />
      </svg>
    `;

    return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
  };

  const updateDisplacementMap = () => {
    if (feImageRef.current) {
      feImageRef.current.setAttribute('href', generateDisplacementMap());
    }
  };

  useEffect(() => {
    updateDisplacementMap();
    
    if (displacementMapRef.current) {
      displacementMapRef.current.setAttribute('scale', distortionScale.toString());
    }

    if (gaussianBlurRef.current) {
      gaussianBlurRef.current.setAttribute('stdDeviation', displace.toString());
    }
  }, [
    width, height, borderRadius, borderWidth, brightness, opacity, blur, displace,
    distortionScale
  ]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(updateDisplacementMap, 0);
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const supportsSVGFilters = () => {
    if (typeof window === 'undefined') return false;
    const isWebkit = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    return !(isWebkit || isFirefox);
  };

  const getContainerStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      ...style,
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius: `${borderRadius}px`,
    };

    const svgSupported = supportsSVGFilters();

    if (svgSupported) {
      return {
        ...baseStyles,
        background: isDarkMode ? `hsl(0 0% 0% / ${backgroundOpacity})` : `hsl(0 0% 100% / ${backgroundOpacity})`,
        backdropFilter: `url(#${filterId}) saturate(${saturation})`,
        boxShadow: `
          0 0 2px 1px rgba(255, 255, 255, 0.3) inset,
          0 0 10px 4px rgba(255, 255, 255, 0.1) inset,
          0 8px 32px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(255, 255, 255, 0.1)
        `
      };
    } else {
      return {
        ...baseStyles,
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: `blur(${blur}px) saturate(${saturation})`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation})`,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.3),
          inset 0 -1px 0 rgba(255, 255, 255, 0.1)
        `
      };
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden transition-all duration-300 ease-out ${className}`}
      style={getContainerStyles()}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id={filterId} colorInterpolationFilters="sRGB" x="0%" y="0%" width="100%" height="100%">
            <feImage 
              ref={feImageRef} 
              x="0" y="0" width="100%" height="100%" 
              preserveAspectRatio="none" 
              result="map" 
            />
            <feDisplacementMap 
              ref={displacementMapRef} 
              in="SourceGraphic" 
              in2="map" 
              scale={distortionScale}
              result="displaced"
            />
            <feGaussianBlur ref={gaussianBlurRef} in="displaced" stdDeviation={displace} result="final" />
          </filter>
        </defs>
      </svg>

      <div className="w-full h-full flex items-center justify-center p-4 rounded-[inherit] relative z-10">
        {children}
      </div>
    </div>
  );
};

// FluidGlassButton Component
interface FluidGlassButtonProps extends Omit<GlassSurfaceProps, 'children'> {
  label?: string;
  onClick?: () => void;
  hoverEffects?: boolean;
  disabled?: boolean;
}

const FluidGlassButton: React.FC<FluidGlassButtonProps> = ({
  label = "Click Me",
  onClick,
  hoverEffects = true,
  disabled = false,
  width = 200,
  height = 80,
  borderRadius = 20,
  borderWidth = 0.07,
  brightness = 50,
  opacity = 0.93,
  blur = 11,
  displace = 0,
  backgroundOpacity = 0.1,
  saturation = 1.2,
  distortionScale = -180,
  className = "",
  style = {},
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled && onClick) {
      onClick();
    }
  };

  const enhancedProps: GlassSurfaceProps = {
    width,
    height,
    borderRadius: Math.max(16, Number(borderRadius) + (isHovered ? 6 : 0)),
    borderWidth: isHovered ? borderWidth * 1.8 : borderWidth,
    brightness: isPressed ? brightness * 0.8 : (isHovered ? brightness * 1.3 : brightness),
    opacity: isPressed ? opacity * 0.7 : (isHovered ? opacity * 1.2 : opacity),
    blur: isHovered ? blur * 1.4 : blur,
    displace: isHovered ? displace + 8 : displace,
    backgroundOpacity: isPressed ? backgroundOpacity * 1.5 : backgroundOpacity,
    saturation: isHovered ? saturation * 1.4 : saturation,
    distortionScale: isHovered ? distortionScale - 40 : distortionScale,
    className: `${className} transition-all duration-500 ease-out ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    }`,
    style: {
      ...style,
      transform: `scale(${isPressed ? 0.95 : isHovered ? 1.08 : 1})`,
      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
    onClick: handleClick,
    onMouseEnter: () => !disabled && hoverEffects && setIsHovered(true),
    onMouseLeave: () => {
      setIsHovered(false);
      setIsPressed(false);
    },
    onMouseDown: () => !disabled && setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    ...props
  };

  return (
    <div className="inline-block">
      <GlassSurface {...enhancedProps}>
        <div className={`flex flex-col items-center justify-center w-full h-full ${
          disabled ? 'text-gray-400' : 'text-white'
        }`}>
          <span className={`font-semibold text-lg tracking-wide text-center ${
            isHovered && !disabled ? 'drop-shadow-2xl' : 'drop-shadow-lg'
          }`} style={{
            textShadow: isHovered && !disabled ? '0 0 30px rgba(255,255,255,0.8)' : '0 0 15px rgba(255,255,255,0.5)',
            transition: 'all 0.4s ease'
          }}>
            {label}
          </span>
          {isHovered && !disabled && (
            <span className="text-xs mt-1 opacity-90 transition-opacity duration-300">
              ✨ Glass Effect
            </span>
          )}
        </div>
      </GlassSurface>
    </div>
  );
};

export default FluidGlassButton;