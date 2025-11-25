"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import React, { useEffect, useState } from "react";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isSmachPage = pathname === "/smach";
  const showNavbar = !isHomePage && !isSmachPage;

  const [isSmWidth, setIsSmWidth] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsSmWidth(window.innerWidth >= 640);
    };

    checkWidth(); // run on mount
    window.addEventListener("resize", checkWidth);

    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return (
    <>
      <div
        className="flex flex-col"
        style={{
          height:
            showNavbar && isSmWidth
              ? "calc(100vh - 4.77rem)"
              : "100vh",
          overflowY: "auto",
          backgroundColor: "#FFF5E6",
        }}
      >
        {children}
      </div>

      {showNavbar && <Navbar />}
    </>
  );
}
