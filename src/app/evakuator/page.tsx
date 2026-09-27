import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Евакуатор у Києві — термінова евакуація авто 24/7",
  description:
    "Евакуатор у Києві цілодобово. Евакуація легкових авто, мікроавтобусів, позашляховиків. Виїзд 30 хвилин. Ціни від 800 грн.",
  alternates: { canonical: "https://kranua.com/evakuator" },
};

const features = [
  "Виїзд протягом 30 хвилин",
  "Робота цілодобово 24/7",
  "Евакуація легкових авто та мікроавтобусів",
  "Перевезення позашляховиків та мінівенів",
  "Акуратне транспортування без пошкоджень",
  "GPS-контроль маршруту",
  "Офіційний договір та чек",
  "Досвід роботи понад 5 років",
];

const types = [
  {
    title: "Легкові автомобілі",
    desc: "Евакуація авто після ДТП, поломки або без дозволу на парковці. Будь-яка марка та модель.",
  },
  {
    title: "Позашляховики та SUV",
    desc: "Перевезення важких позашляховиків вантажопідйомністю до 3,5 тонн.",
  },
  {
    title: "Мікроавтобуси",
    desc: "Евакуація мікроавтобусів та мінівенів до 5 тонн по Києву та області.",
  },
  {
    title: "Мотоцикли та квадроцикли",
    desc: "Бережне транспортування двоколісного транспорту та квадроциклів.",
  },
];

const areas = [
  "Оболонь", "Подол", "Дарниця", "Деснянський р-н",
  "Голосіїв", "Солом'янка", "Шевченківський р-н", "Печерськ",
  "Дніпровський р-н", "Святошин", "Борщагівка", "Позняки",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Послуги евакуатора у Києві",
  provider: {
    "@type": "LocalBusiness",
    name: "KranUA",
    telephone: "+380501234567",
    address: { "@type": "PostalAddress", addressLocality: "Київ", addressCountry: "UA" },
  },
  areaServed: { "@type": "City", name: "Київ" },
  description: "Евакуатор у Києві цілодобово. Швидкий виїзд, офіційний договір.",
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Головна", item: "https://kranua.com" },
    { "@type": "ListItem", position: 2, name: "Евакуатор", item: "https://kranua.com/evakuator" },
  ],
};

export default function EvakuatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumb */}
      <nav className="px-4 pt-4 pb-0" aria-label="Хлібні крихти">
        <ol className="flex items-center gap-1.5 text-sm text-[#6B7280]" role="list">
          <li><Link href="/" className="hover:text-[#FF6B00] transition-colors">Головна</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-[#1A1A2E] font-medium">Евакуатор</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="bg-[#1A1A2E] text-white px-4 pt-6 pb-10 mt-4">
        <div className="mx-auto max-w-2xl">
          <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-2">
            Цілодобово — Виїзд 30 хв
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
            Евакуатор<br />у Києві
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-6">
            Термінова евакуація авто після ДТП, поломки або з блокованого місця. Швидко, акуратно, без пошкоджень.
          </p>
          <a
            href="tel:+380501234567"
            className="flex items-center justify-center gap-2 w-full sm:w-auto sm:inline-flex bg-[#FF6B00] text-white font-bold px-8 py-4 rounded-xl active:bg-[#E55A00] transition-colors min-h-[52px] text-base"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Викликати евакуатор
          </a>
        </div>
      </section>

      {/* Types */}
      <section className="px-4 py-8" aria-labelledby="types-heading">
        <div className="mx-auto max-w-2xl">
          <h2 id="types-heading" className="text-xl font-bold text-[#1A1A2E] mb-4">
            Які авто евакуюємо
          </h2>
          <div className="grid gap-3">
            {types.map((t) => (
              <div key={t.title} className="flex gap-4 bg-white rounded-2xl p-4 border border-[#E5E7EB]">
                <div className="shrink-0 w-10 h-10 bg-[#FFF3EA] rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/>
                    <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A2E] text-sm mb-1">{t.title}</h3>
                  <p className="text-[#6B7280] text-sm leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-6 bg-[#1A1A2E]" aria-labelledby="evak-features-heading">
        <div className="mx-auto max-w-2xl">
          <h2 id="evak-features-heading" className="text-xl font-bold text-white mb-4">
            Наші переваги
          </h2>
          <div className="grid grid-cols-1 gap-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="shrink-0 w-5 h-5 rounded-full bg-[#FF6B00] flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Area */}
      <section className="px-4 py-8" aria-labelledby="area-heading">
        <div className="mx-auto max-w-2xl">
          <h2 id="area-heading" className="text-xl font-bold text-[#1A1A2E] mb-4">
            Райони роботи в Києві
          </h2>
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => (
              <span
                key={a}
                className="bg-white text-[#1A1A2E] text-sm font-medium px-3 py-2 rounded-xl border border-[#E5E7EB]"
              >
                {a}
              </span>
            ))}
          </div>
          <p className="text-[#6B7280] text-sm mt-4">
            Також виїжджаємо за Київ: Бровари, Бориспіль, Ірпінь, Буча, Вишневе та інші міста Київської області.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-8">
        <div className="mx-auto max-w-2xl bg-[#FF6B00] rounded-3xl p-6 text-center">
          <h2 className="text-white font-bold text-xl mb-2">Авто зламалось?</h2>
          <p className="text-white/90 text-sm mb-4">
            Дзвоніть — евакуатор виїде протягом 30 хвилин
          </p>
          <a
            href="tel:+380501234567"
            className="inline-flex items-center justify-center gap-2 bg-[#1A1A2E] text-white font-bold px-8 py-4 rounded-xl min-h-[52px] active:opacity-80 transition-opacity text-base"
          >
            +38 (050) 123-45-67
          </a>
        </div>
      </section>
    </>
  );
}
