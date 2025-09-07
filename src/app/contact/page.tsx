// src/app/contact/page.tsx
'use client'

import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold">
          📞 Contact <span className="text-green-400">Me</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
          Got a project idea, a question, or just want to say hi?  
          I’d love to hear from you. Feel free to reach out anytime.
        </p>

        <div className="pt-6">
          <a 
            href="mailto:your-email@example.com" 
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium shadow-md transition-all inline-block"
          >
            ✉️ Send me an Email
          </a>
        </div>

        <div className="pt-4">
          <Link 
            href="/" 
            className="text-gray-400 hover:text-white underline transition"
          >
            ⬅️ Back Home
          </Link>
        </div>
      </div>
    </main>
  );
}
