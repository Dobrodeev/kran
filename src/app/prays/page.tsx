import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ціни на послуги крана-маніпулятора та евакуатора — KranUA",
  description:
    "Актуальні ціни на оренду крана-маніпулятора та евакуатора в Києві. Кран від 600 грн/год, евакуатор від 800 грн. Без прихованих доплат.",
  alternates: { canonical: "https://kranua.com/prays" },
};

const kranPrices = [
  { name: "Маніпулятор 3 тонни", price: "600", unit: "год", note: "Мін. 2 год" },
  { name: "Маніпулятор 5–7 тонн", price: "800", unit: "год", note: "Мін. 2 год" },
  { name: "Маніпулятор 10–12 тонн", price: "1 100", unit: "год", note: "Мін. 2 год" },
  { name: "Маніпулятор 15–20 тонн", price: "1 400", unit: "год", note: "Мін. 2 год" },
  { name: "Маніпулятор 25 тонн", price: "1 800", unit: "год", note: "Мін. 4 год" },
];

const evakPrices = [
  { name: "Легкове авто (до 2 т)", price: "800", unit: "виїзд", note: "По Києву" },
  { name: "Кросовер / SUV (до 3,5 т)", price: "1 000", unit: "виїзд", note: "По Києву" },
  { name: "Мікроавтобус (до 5 т)", price: "1 300", unit: "виїзд", note: "По Києву" },
  { name: "Виїзд за місто", price: "від 25", unit: "км", note: "Від меж міста" },
  { name: "Нічний тариф (22:00–07:00)", price: "+20%", unit: "", note: "До основного тарифу" },
];

const included = [
  "Виїзд оператора зі спецтехнікою",
  "Страхування вантажу/авто",
  "Офіційний договір та чек",
  "GPS-відстеження маршруту",
  "Консультація перед замовленням",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "PriceSpecification",
  name: "Ціни KranUA",
  priceCurrency: "UAH",
  description: "Ціни на послуги крана-маніпулятора та евакуатора у Києві",
};

export default function PraysPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="px-4 pt-4 pb-0" aria-label="Хлібні крихти">
        <ol className="flex items-center gap-1.5 text-sm text-[#6B7280]" role="list">
          <li><Link href="/" className="hover:text-[#FF6B00] transition-colors">Головна</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-[#1A1A2E] font-medium">Ціни</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="bg-[#1A1A2E] text-white px-4 pt-6 pb-10 mt-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
            Ціни на послуги
          </h1>
          <p className="text-white/70 text-base leading-relaxed">
            Прозора тарифікація без прихованих доплат. Ціна фіксується при замовленні.
          </p>
        </div>
      </section>

      {/* Crane prices */}
      <section className="px-4 py-8" aria-labelledby="kran-prices-heading">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#FFF3EA] rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 20h20"/><path d="M6 20V8l6-4 6 4v12"/><rect x="9" y="12" width="6" height="8"/>
              </svg>
            </div>
            <h2 id="kran-prices-heading" className="text-xl font-bold text-[#1A1A2E]">
              Кран-маніпулятор
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            {kranPrices.map((p, i) => (
              <div
                key={p.name}
                className={`flex items-center justify-between px-5 py-4 ${i < kranPrices.length - 1 ? "border-b border-[#F4F4F4]" : ""}`}
              >
                <div>
                  <div className="font-semibold text-[#1A1A2E] text-sm">{p.name}</div>
                  {p.note && <div className="text-[#6B7280] text-xs mt-0.5">{p.note}</div>}
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#FF6B00] text-lg leading-none">
                    {p.price} грн
                  </div>
                  {p.unit && <div className="text-[#6B7280] text-xs mt-0.5">/{p.unit}</div>}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/kran-manipulyator"
            className="mt-3 flex items-center justify-center gap-2 w-full bg-[#1A1A2E] text-white font-semibold px-6 py-4 rounded-xl transition-colors min-h-[52px] text-sm active:opacity-80"
          >
            Детальніше про маніпулятор
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Tow truck prices */}
      <section className="px-4 py-2 pb-8" aria-labelledby="evak-prices-heading">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#FFF3EA] rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/>
                <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
              </svg>
            </div>
            <h2 id="evak-prices-heading" className="text-xl font-bold text-[#1A1A2E]">
              Евакуатор
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
            {evakPrices.map((p, i) => (
              <div
                key={p.name}
                className={`flex items-center justify-between px-5 py-4 ${i < evakPrices.length - 1 ? "border-b border-[#F4F4F4]" : ""}`}
              >
                <div>
                  <div className="font-semibold text-[#1A1A2E] text-sm">{p.name}</div>
                  {p.note && <div className="text-[#6B7280] text-xs mt-0.5">{p.note}</div>}
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#FF6B00] text-lg leading-none">
                    {p.price} {p.unit ? "грн" : ""}
                  </div>
                  {p.unit && <div className="text-[#6B7280] text-xs mt-0.5">/{p.unit}</div>}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/evakuator"
            className="mt-3 flex items-center justify-center gap-2 w-full bg-[#1A1A2E] text-white font-semibold px-6 py-4 rounded-xl transition-colors min-h-[52px] text-sm active:opacity-80"
          >
            Детальніше про евакуатор
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* What's included */}
      <section className="px-4 pb-8" aria-labelledby="included-heading">
        <div className="mx-auto max-w-2xl bg-[#1A1A2E] rounded-2xl p-5">
          <h2 id="included-heading" className="font-bold text-white text-base mb-4">
            Що входить у вартість
          </h2>
          <div className="grid gap-2">
            {included.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="shrink-0 w-5 h-5 rounded-full bg-[#FF6B00] flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-10">
        <div className="mx-auto max-w-2xl">
          <a
            href="tel:+380501234567"
            className="flex items-center justify-center gap-2 w-full bg-[#FF6B00] text-white font-bold text-lg py-5 rounded-2xl active:bg-[#E55A00] transition-colors min-h-[60px] shadow-lg"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Замовити зі знижкою — дзвінок безкоштовний
          </a>
          <p className="text-center text-[#6B7280] text-xs mt-3">
            * Ціни орієнтовні. Точна вартість узгоджується при замовленні.
          </p>
        </div>
      </section>
    </>
  );
}
