// src/components/ClientLayoutWrapper.tsx

"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import React from "react";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isSmachPage = pathname === "/smach";
  const showNavbar = !isHomePage && !isSmachPage;

  return (
    <>
      <div
        className="flex flex-col"
        style={{
          height:
            showNavbar && window.innerWidth >= 640
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