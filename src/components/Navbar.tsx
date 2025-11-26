'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
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

type Position = { x: number; y: number };
type DragInput =
  | React.MouseEvent<HTMLElement>
  | React.TouchEvent<HTMLElement>
  | MouseEvent
  | TouchEvent;

export function Navbar() {
  const pathname = usePathname();

  // mobile mode
  const [isMobile, setIsMobile] = useState(false);

  // menu + floating button state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<Position>({ x: 10, y: 50 });
  const [buttonPosition, setButtonPosition] = useState<Position>({ x: 10, y: 50 });

  // dragging state
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isDraggingMenu, setIsDraggingMenu] = useState(false);
  const [isDraggingButton, setIsDraggingButton] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /* ---------------------------------------------------------------------
     SCREEN SIZE CHECK (SSR SAFE)
     --------------------------------------------------------------------- */
  useEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  /* ---------------------------------------------------------------------
     CLOSE MENU WHEN ROUTE CHANGES
     --------------------------------------------------------------------- */
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  /* ---------------------------------------------------------------------
     DRAG START
     --------------------------------------------------------------------- */
  const startDragging = (e: DragInput, type: 'menu' | 'button') => {
    const isTouch = 'touches' in e;
    const point = isTouch ? e.touches[0] : (e as MouseEvent);

    if (type === 'menu' && menuRef.current) {
      setIsDraggingMenu(true);
      const rect = menuRef.current.getBoundingClientRect();
      setDragOffset({ x: point.clientX - rect.left, y: point.clientY - rect.top });
    }

    if (type === 'button' && buttonRef.current) {
      setIsDraggingButton(true);
      const rect = buttonRef.current.getBoundingClientRect();
      setDragOffset({ x: point.clientX - rect.left, y: point.clientY - rect.top });
    }
  };

  /* ---------------------------------------------------------------------
     DRAG MOVE
     --------------------------------------------------------------------- */
  const handleMove = useCallback(
    (e: DragInput) => {
      const isTouch = 'touches' in e;
      const point = isTouch ? e.touches[0] : (e as MouseEvent);

      if (isDraggingMenu) {
        setMenuPosition({
          x: point.clientX - dragOffset.x,
          y: point.clientY - dragOffset.y,
        });
      }

      if (isDraggingButton) {
        setButtonPosition({
          x: point.clientX - dragOffset.x,
          y: point.clientY - dragOffset.y,
        });
      }
    },
    [isDraggingMenu, isDraggingButton, dragOffset.x, dragOffset.y]
  );

  /* ---------------------------------------------------------------------
     DRAG STOP
     --------------------------------------------------------------------- */
  const stopDragging = () => {
    setIsDraggingMenu(false);
    setIsDraggingButton(false);
  };

  /* ---------------------------------------------------------------------
     ADD GLOBAL LISTENERS DURING DRAG
     --------------------------------------------------------------------- */
  useEffect(() => {
    if (!isDraggingMenu && !isDraggingButton) return;

    document.addEventListener('mousemove', handleMove as EventListener);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchmove', handleMove as EventListener, { passive: false });
    document.addEventListener('touchend', stopDragging);

    return () => {
      document.removeEventListener('mousemove', handleMove as EventListener);
      document.removeEventListener('mouseup', stopDragging);
      document.removeEventListener('touchmove', handleMove as EventListener);
      document.removeEventListener('touchend', stopDragging);
    };
  }, [isDraggingMenu, isDraggingButton, handleMove]);

  /* ---------------------------------------------------------------------
     CLOSE MENU IF CLICK OUTSIDE
     --------------------------------------------------------------------- */
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.draggable-menu') &&
        !target.closest('.draggable-button')
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  /* ---------------------------------------------------------------------
     NAV ITEMS
     --------------------------------------------------------------------- */
  const navItems: NavItem[] = [
    { name: 'Profile', icon: <ProfileIcon />, path: '/profile' },
    { name: 'Glide', icon: <CardShuffle />, path: '/glide' },
    { name: 'Fade', icon: <ScrollIng />, path: '/fade' },
    { name: 'DMs', icon: <MessagesIcon />, path: '/dms' },
    { name: 'Sparkel', icon: <AiIcon />, path: '/sparkel' },
  ];

  /* ---------------------------------------------------------------------
     RENDER
     --------------------------------------------------------------------- */
  return (
    <>
      {/* ---------------- MOBILE FLOATING BUTTON ---------------- */}
      {isMobile && !isMenuOpen && (
        <button
          ref={buttonRef}
          className={`draggable-button fixed z-50 w-14 h-14 flex items-center justify-center rounded-full bg-yellow-500 text-black shadow-lg ${
            isDraggingButton ? 'cursor-grabbing scale-110 shadow-2xl' : 'cursor-grab shadow-xl'
          } transition-transform`}
          style={{ left: buttonPosition.x, top: buttonPosition.y }}
          onClick={() => !isDraggingButton && setIsMenuOpen(true)}
          onMouseDown={(e) => startDragging(e, 'button')}
          onTouchStart={(e) => startDragging(e, 'button')}
        >
          <div className="flex flex-col space-y-1">
            <span className="block h-0.5 w-6 bg-current" />
            <span className="block h-0.5 w-6 bg-current" />
            <span className="block h-0.5 w-6 bg-current" />
          </div>
        </button>
      )}

      {/* ---------------- DESKTOP NAVBAR ---------------- */}
      {!isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#FCE9CE] border-t border-[#F5DCB9] z-50">
          <div className="flex justify-around items-center py-3 px-4">
            {navItems.map((item) => {
              const active = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    active ? 'text-yellow-500' : 'text-black hover:text-yellow-500'
                  }`}
                >
                  <div className="w-9 h-9">{item.icon}</div>
                  <span className="text-lg font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* ---------------- MOBILE OVERLAY ---------------- */}
      {isMobile && isMenuOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40" />
      )}

      {/* ---------------- MOBILE DRAGGABLE MENU ---------------- */}
      {isMobile && isMenuOpen && (
        <div
          ref={menuRef}
          className={`draggable-menu fixed bg-[#FCE9CE] rounded-3xl shadow-xl border border-[#E6C494] z-50 p-2 min-w-[200px] ${
            isDraggingMenu ? 'cursor-grabbing select-none shadow-2xl' : 'cursor-grab'
          }`}
          style={{ left: menuPosition.x, top: menuPosition.y }}
          onMouseDown={(e) => startDragging(e, 'menu')}
          onTouchStart={(e) => startDragging(e, 'menu')}
        >
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-[#E6C494]">
            <span className="text-sm font-semibold text-gray-700">Navigation</span>
          </div>

          <div className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-5 px-4 py-3 rounded-lg transition-all ${
                    active ? 'text-yellow-500' : 'text-black hover:text-yellow-500'
                  }`}
                >
                  <div className="w-6 h-6">{item.icon}</div>
                  <span className="text-base font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
