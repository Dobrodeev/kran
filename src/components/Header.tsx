"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#1A1A2E] shadow-md">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 h-14">
        <Link href="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded">
          <span className="text-[#FF6B00] font-bold text-xl tracking-tight">Kran</span>
          <span className="text-white font-bold text-xl tracking-tight">UA</span>
        </Link>

        <a
          href="tel:+380501234567"
          className="flex items-center gap-1.5 bg-[#FF6B00] text-white text-sm font-semibold px-3 py-2 rounded-lg active:bg-[#E55A00] transition-colors min-h-[44px]"
          aria-label="Зателефонувати"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          <span className="hidden sm:inline">+38 (050) 123-45-67</span>
          <span className="sm:hidden">Дзвінок</span>
        </a>
      </div>

      <nav className="hidden md:block bg-[#12122A] border-t border-white/10">
        <ul className="mx-auto max-w-5xl flex px-4 text-sm" role="list">
          {[
            { href: "/", label: "Головна" },
            { href: "/kran-manipulyator", label: "Кран-маніпулятор" },
            { href: "/evakuator", label: "Евакуатор" },
            { href: "/prays", label: "Ціни" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-3 text-white/80 hover:text-[#FF6B00] hover:bg-white/5 transition-colors font-medium"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
