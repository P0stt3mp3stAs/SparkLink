// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import OidcProviderWrapper from "@/components/OidcProviderWrapper";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { JetBrains_Mono } from "next/font/google";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Spark Link",
  description: "Spark Link App",

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" }
    ],
    shortcut: "/favicon.ico",
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#FFD700"
      }
    ]
  },

  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${jetBrainsMono.className} h-full flex flex-col`}>
        <OidcProviderWrapper>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </OidcProviderWrapper>
      </body>
    </html>
  );
}
