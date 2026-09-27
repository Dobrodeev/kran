"use client";
import { useEffect, useState } from "react";

export default function StickyCallButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="tel:+380501234567"
      aria-label="Зателефонувати нам"
      className={`md:hidden fixed right-4 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#FF6B00] text-white shadow-lg active:bg-[#E55A00] transition-all duration-200 ${
        visible ? "bottom-[calc(56px+env(safe-area-inset-bottom)+1rem)] opacity-100 scale-100" : "bottom-[calc(56px+env(safe-area-inset-bottom)+1rem)] opacity-0 scale-90 pointer-events-none"
      }`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    </a>
  );
}
