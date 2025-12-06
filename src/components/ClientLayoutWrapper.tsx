"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import React, { useEffect, useState } from "react";
import NotificationCenter from '@/components/NotificationCenter';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isSmachPage = pathname === "/smach";
  const showComponent = !isHomePage && !isSmachPage;

  const [isSmWidth, setIsSmWidth] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsSmWidth(window.innerWidth >= 640);
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return (
    <>
    {showComponent && <div className="absolute top-33 left-7 z-100 pointer-events-none w-[100px] h-[100px]">
      <div className="absolute animate-hand w-full h-full">
        <Image
          src="/dragPointer.svg"
          alt="Drag Pointer"
          width={40} // adjust size as needed
          height={40}
          className="w-10 h-10"
        />
      </div>

      <style jsx>{`
        @keyframes pathMove {
          0% { transform: translate(0px, 0px); }

          6% { transform: translate(30px, 0px); }
          12% { transform: translate(50px, 20px); }
          28% { transform: translate(50px, 80px); }
          40% { transform: translate(70px, 100px); }
          53% { transform: translate(100px, 100px); }
          63% { transform: translate(100px, 70px); }
          75% { transform: translate(80px, 50px); }
          88% { transform: translate(20px, 50px); }
          94% { transform: translate(0px, 30px); }
          100% { transform: translate(0px, 0px); }
        }

        @keyframes fadeout {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }

        .animate-hand {
          animation:
            pathMove 5s linear 3,
            fadeout 1.2s ease-out 10s forwards;
        }
      `}</style>
    </div>}
      <div
        className="flex flex-col"
        style={{
          height:
            showComponent && isSmWidth
              ? "calc(100vh - 4.77rem)"
              : "100vh",
          overflowY: "auto",
          backgroundColor: "#FFF5E6",
        }}
      >
        {children}
      </div>

      {showComponent && <Navbar />}
      {showComponent && <NotificationCenter />}
    </>
  );
}
