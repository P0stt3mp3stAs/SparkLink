'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export function Navbar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
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

  return (
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
              {!isMobile && (
                <span className="text-base md:text-lg font-semibold">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
