'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import ProfileIcon from '@/components/icons/ProfileIcon';
import { CardShuffle } from '@/components/icons/CardShuffle';
import ScrollIng from '@/components/icons/Scroll';
import MessagesIcon from '@/components/icons/MessageIcon';
import AiIcon from '@/components/icons/AiIcon';

import React from 'react';

type NavItem = {
  name: string;
  icon: React.ReactElement;
  path: string;
};

type Position = {
  x: number;
  y: number;
};

export function Navbar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<Position>({ x: 20, y: 100 });
  const [buttonPosition, setButtonPosition] = useState<Position>({ x: 20, y: 20 });
  const [isDraggingMenu, setIsDraggingMenu] = useState(false);
  const [isDraggingButton, setIsDraggingButton] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's sm breakpoint (640px)
    };

    checkScreenSize(); // Run once after mount
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navItems: NavItem[] = [
    { name: 'Profile', icon: <ProfileIcon />, path: '/profile' },
    { name: 'Glide', icon: <CardShuffle />, path: '/glide' },
    { name: 'Fade', icon: <ScrollIng />, path: '/fade' },
    { name: 'DMs', icon: <MessagesIcon />, path: '/dms' },
    { name: 'Sparkel', icon: <AiIcon />, path: '/sparkel' },
  ];

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Common drag handlers
  const startDragging = (e: React.MouseEvent | React.TouchEvent, type: 'menu' | 'button') => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if (type === 'menu' && menuRef.current) {
      setIsDraggingMenu(true);
      const rect = menuRef.current.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    } else if (type === 'button' && buttonRef.current) {
      setIsDraggingButton(true);
      const rect = buttonRef.current.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    }
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (isDraggingMenu) {
      setMenuPosition({
        x: clientX - dragOffset.x,
        y: clientY - dragOffset.y,
      });
    } else if (isDraggingButton) {
      setButtonPosition({
        x: clientX - dragOffset.x,
        y: clientY - dragOffset.y,
      });
    }
  };

  const stopDragging = () => {
    setIsDraggingMenu(false);
    setIsDraggingButton(false);
  };

  useEffect(() => {
    if (isDraggingMenu || isDraggingButton) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', stopDragging);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', stopDragging);

      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', stopDragging);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', stopDragging);
      };
    }
  }, [isDraggingMenu, isDraggingButton, dragOffset]);

  // Close menu when clicking outside (but not when dragging)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && 
          !isDraggingMenu && 
          !isDraggingButton && 
          !target.closest('.draggable-menu') && 
          !target.closest('.draggable-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, isDraggingMenu, isDraggingButton]);

  return (
    <>
      {/* Mobile Floating Button */}
      {isMobile && !isMenuOpen && (
  <button
    ref={buttonRef}
    className={`draggable-button fixed z-50 flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500 text-black shadow-lg ${
      isDraggingButton ? 'cursor-grabbing scale-110 shadow-2xl' : 'cursor-grab shadow-xl'
    } transition-transform duration-200`}
    style={{
      left: `${buttonPosition.x}px`,
      top: `${buttonPosition.y}px`,
      transform: 'none',
    }}
    onClick={(e) => {
      if (!isDraggingButton) {
        setIsMenuOpen(true); // menu opens
      }
    }}
    onMouseDown={(e) => startDragging(e, 'button')}
    onTouchStart={(e) => startDragging(e, 'button')}
  >
    {/* Always hamburger icon */}
    <div className="flex flex-col space-y-1">
      <span className="block h-0.5 w-6 bg-current" />
      <span className="block h-0.5 w-6 bg-current" />
      <span className="block h-0.5 w-6 bg-current" />
    </div>
  </button>
)}

      {/* Regular Navbar for Desktop/Tablet */}
      {!isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#FCE9CE] border-t-1 border-[#FCE9CE] z-50">
          <div className="flex justify-around items-center py-3 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'text-yellow-500 bg-opacity-10'
                      : 'text-black hover:text-yellow-500'
                  }`}
                >
                  <div className="w-9 h-9">{item.icon}</div>
                  <span className="text-base md:text-lg font-semibold">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm z-40" />
      )}

      {/* Draggable Dropdown Menu for Mobile */}
      {isMobile && isMenuOpen && (
        <div
          ref={menuRef}
          className={`draggable-menu fixed bg-[#FCE9CE] rounded-xl shadow-lg border border-[#F5DCB9] z-50 p-2 min-w-[200px] ${
            isDraggingMenu ? 'cursor-grabbing select-none shadow-2xl' : 'cursor-grab'
          }`}
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            transform: 'none',
          }}
          onMouseDown={(e) => startDragging(e, 'menu')}
          onTouchStart={(e) => startDragging(e, 'menu')}
        >
          {/* Drag handle area */}
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#E6C494]">
            <span className="text-sm font-semibold text-gray-700">Navigation</span>
          </div>

          {/* Menu items */}
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-5 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'text-yellow-500 bg-opacity-10'
                      : 'text-black hover:text-yellow-500 hover:#E6C494]'
                  }`}
                >
                  <div className="w-6 h-6">{item.icon}</div>
                  <span className="text-base font-semibold">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}