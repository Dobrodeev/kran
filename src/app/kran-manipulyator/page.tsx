import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Кран-маніпулятор у Києві — оренда та послуги",
  description:
    "Послуги крана-маніпулятора в Києві: підйом і переміщення вантажів від 3 до 25 тонн. Виїзд 24/7. Ціни від 600 грн/год.",
  alternates: { canonical: "https://kranua.com/kran-manipulyator" },
};

const features = [
  "Вантажопідйомність від 3 до 25 тонн",
  "Виліт стріли до 21 метра",
  "Робота в обмеженому просторі",
  "Досвідчені оператори з допуском",
  "Виїзд протягом 30–60 хвилин",
  "Робота цілодобово без вихідних",
];

const applications = [
  { title: "Будівництво", desc: "Підйом бетонних конструкцій, цегли, металу, балок" },
  { title: "Завантаження / Розвантаження", desc: "Вантажно-розвантажувальні роботи на складах та об'єктах" },
  { title: "Монтаж обладнання", desc: "Встановлення промислового та технологічного обладнання" },
  { title: "Деревообробка", desc: "Переміщення колод, пиломатеріалів, великогабаритних вантажів" },
  { title: "Логістика", desc: "Часткове та повне завантаження транспортних засобів" },
  { title: "Аварійні ситуації", desc: "Швидкий виїзд при надзвичайних ситуаціях 24/7" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Послуги крана-маніпулятора у Києві",
  provider: {
    "@type": "LocalBusiness",
    name: "KranUA",
    telephone: "+380501234567",
    address: { "@type": "PostalAddress", addressLocality: "Київ", addressCountry: "UA" },
  },
  areaServed: { "@type": "City", name: "Київ" },
  description: "Оренда та послуги крана-маніпулятора в Києві. Вантажопідйомність 3–25 тонн, виліт стріли до 21 м.",
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Головна", item: "https://kranua.com" },
    { "@type": "ListItem", position: 2, name: "Кран-маніпулятор", item: "https://kranua.com/kran-manipulyator" },
  ],
};

export default function KranManipulyatorPage() {
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
          <li className="text-[#1A1A2E] font-medium">Кран-маніпулятор</li>
        </ol>
      </nav>

      {/* Hero */}
      <section className="bg-[#1A1A2E] text-white px-4 pt-6 pb-10 mt-4">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
            Кран-маніпулятор<br />у Києві
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-6">
            Послуги крана-маніпулятора для будівництва, монтажу та вантажних робіт. Цілодобово по Києву та Київській області.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+380501234567"
              className="flex items-center justify-center gap-2 bg-[#FF6B00] text-white font-bold px-6 py-4 rounded-xl active:bg-[#E55A00] transition-colors min-h-[52px]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Замовити маніпулятор
            </a>
            <Link
              href="/prays"
              className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-6 py-4 rounded-xl transition-colors min-h-[52px] border border-white/20"
            >
              Дізнатись ціни
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-8" aria-labelledby="features-heading">
        <div className="mx-auto max-w-2xl">
          <h2 id="features-heading" className="text-xl font-bold text-[#1A1A2E] mb-4">
            Технічні характеристики
          </h2>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-[#F4F4F4]">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <div className="shrink-0 w-6 h-6 rounded-full bg-[#FFF3EA] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span className="text-[#1A1A2E] text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Applications */}
      <section className="px-4 py-6" aria-labelledby="applications-heading">
        <div className="mx-auto max-w-2xl">
          <h2 id="applications-heading" className="text-xl font-bold text-[#1A1A2E] mb-4">
            Сфери застосування
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {applications.map((a) => (
              <div key={a.title} className="bg-white rounded-2xl p-4 border border-[#E5E7EB]">
                <h3 className="font-bold text-[#1A1A2E] text-sm mb-1">{a.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO text */}
      <section className="px-4 py-6">
        <div className="mx-auto max-w-2xl bg-white rounded-2xl p-5 border border-[#E5E7EB]">
          <h2 className="font-bold text-[#1A1A2E] text-base mb-3">
            Оренда крана-маніпулятора в Києві
          </h2>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-3">
            Кран-маніпулятор — універсальна спецтехніка для підйому та переміщення вантажів у важкодоступних місцях. Наш парк включає техніку вантажопідйомністю від 3 до 25 тонн з вильотом стріли до 21 метра.
          </p>
          <p className="text-[#6B7280] text-sm leading-relaxed">
            Ми працюємо по всьому Києву та Київській області. Оператор із допуском, страховка, офіційний договір. Мінімальне замовлення — 2 години. Дзвоніть цілодобово.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <a
            href="tel:+380501234567"
            className="flex items-center justify-center gap-2 w-full bg-[#FF6B00] text-white font-bold text-lg py-5 rounded-2xl active:bg-[#E55A00] transition-colors min-h-[60px] shadow-lg"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Замовити кран-маніпулятор
          </a>
        </div>
      </section>
    </>
  );
}
