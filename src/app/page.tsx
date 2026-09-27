import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Кран-маніпулятор та Евакуатор у Києві — KranUA",
  description:
    "Послуги крана-маніпулятора та евакуатора в Києві. Цілодобово, швидко, надійно. Вантажоперевезення по Києву та Київській області.",
  alternates: { canonical: "https://kranua.com" },
};

const services = [
  {
    href: "/kran-manipulyator",
    title: "Кран-маніпулятор",
    description: "Підйом і переміщення вантажів будь-якої складності. Вантажопідйомність від 3 до 25 тонн.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 20h20"/><path d="M6 20V8l6-4 6 4v12"/><rect x="9" y="12" width="6" height="8"/>
      </svg>
    ),
  },
  {
    href: "/evakuator",
    title: "Евакуатор",
    description: "Евакуація авто будь-якої категорії в Києві та Київській області. Швидкий виїзд 24/7.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/>
        <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
      </svg>
    ),
  },
  {
    href: "/prays",
    title: "Вантажоперевезення",
    description: "Перевезення вантажів по Києву та Україні. Часткове та повне завантаження.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
];

const benefits = [
  { label: "Цілодобово", text: "Виїзд 24/7 — вдень і вночі, у будні та вихідні" },
  { label: "Швидко", text: "Бригада на місці протягом 30–60 хвилин після дзвінка" },
  { label: "Надійно", text: "Досвідчені оператори, застрахована спецтехніка" },
  { label: "Прозоро", text: "Фіксована ціна без прихованих доплат" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "KranUA",
  description: "Послуги крана-маніпулятора та евакуатора в Києві",
  url: "https://kranua.com",
  telephone: "+380501234567",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Київ",
    addressCountry: "UA",
  },
  areaServed: { "@type": "City", name: "Київ" },
  openingHours: "Mo-Su 00:00-24:00",
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-[#1A1A2E] text-white px-4 pt-10 pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-3">
            Київ та область — 24/7
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Кран-маніпулятор<br />та Евакуатор у Києві
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-8 max-w-md mx-auto">
            Підйом вантажів, переміщення спецтехніки та евакуація авто. Швидкий виїзд, фіксована ціна.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+380501234567"
              className="flex items-center justify-center gap-2 bg-[#FF6B00] text-white font-bold text-base px-6 py-4 rounded-xl active:bg-[#E55A00] transition-colors min-h-[52px] shadow-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Зателефонувати
            </a>
            <Link
              href="/prays"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-6 py-4 rounded-xl transition-colors min-h-[52px] border border-white/20"
            >
              Переглянути ціни
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="px-4 py-10" aria-labelledby="services-heading">
        <div className="mx-auto max-w-2xl">
          <h2 id="services-heading" className="text-2xl font-bold text-[#1A1A2E] mb-6 text-center">
            Наші послуги
          </h2>
          <div className="grid gap-4">
            {services.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm active:shadow-md transition-shadow border border-[#E5E7EB] group"
              >
                <div className="shrink-0 w-14 h-14 bg-[#FFF3EA] rounded-xl flex items-center justify-center">
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#1A1A2E] text-base mb-1 group-hover:text-[#FF6B00] transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{s.description}</p>
                </div>
                <svg className="shrink-0 mt-1 text-[#FF6B00]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-4 py-8 bg-[#1A1A2E]" aria-labelledby="benefits-heading">
        <div className="mx-auto max-w-2xl">
          <h2 id="benefits-heading" className="text-2xl font-bold text-white mb-6 text-center">
            Чому обирають нас
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((b) => (
              <div key={b.label} className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <div className="text-[#FF6B00] font-bold text-base mb-1">{b.label}</div>
                <p className="text-white/70 text-sm leading-relaxed">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-2xl bg-[#FF6B00] rounded-3xl p-6 text-center">
          <h2 className="text-white font-bold text-xl mb-2">
            Потрібен кран або евакуатор?
          </h2>
          <p className="text-white/90 text-sm mb-5">
            Залишіть дзвінок — відповімо протягом 2 хвилин
          </p>
          <a
            href="tel:+380501234567"
            className="inline-flex items-center gap-2 bg-[#1A1A2E] text-white font-bold px-8 py-4 rounded-xl active:opacity-80 transition-opacity min-h-[52px] text-base"
          >
            +38 (050) 123-45-67
          </a>
        </div>
      </section>
    </>
  );
}
