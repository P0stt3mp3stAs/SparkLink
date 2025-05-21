// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProfileIcon from '@/components/icons/ProfileIcon';
import { CardShuffle } from '@/components/icons/CardShuffle';
import ScrollIng from '@/components/icons/Scroll';
import MessagesIcon from '@/components/icons/MessageIcon';
import AiIcon from '@/components/icons/AiIcon';

export function Navbar() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's md breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navItems = [
    { name: 'Profile', icon: <ProfileIcon />, path: '/profile' },
    { name: 'Glide', icon: <CardShuffle />, path: '/glide' },
    { name: 'Fade', icon: <ScrollIng />, path: '/fade' },
    { name: 'DMs', icon: <MessagesIcon />, path: '/dms' },
    { name: 'Sparke', icon: <AiIcon />, path: '/sparke' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-80 backdrop-blur-sm border-t border-gray-800 z-50">
      <div className="flex justify-around items-center py-3 px-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
              pathname === item.path
                ? 'text-yellow-500  bg-opacity-10'
                : 'text-gray-400 hover:text-yellow-500'
            }`}
          >
            <div className="w-9 h-9">{item.icon}</div>
            {!isMobile && (
              <span className="text-base md:text-lg font-semibold">
                {item.name}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
