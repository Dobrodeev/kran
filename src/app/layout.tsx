import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import StickyCallButton from "@/components/StickyCallButton";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kranua.com"),
  title: {
    default: "KranUA — Кран-маніпулятор та Евакуатор у Києві",
    template: "%s | KranUA Київ",
  },
  description:
    "Послуги крана-маніпулятора та евакуатора в Києві. Швидко, надійно, цілодобово. Дзвоніть: +38 (050) 123-45-67",
  keywords: [
    "кран маніпулятор Київ",
    "оренда маніпулятора Київ",
    "евакуатор Київ",
    "послуги маніпулятора",
    "kranua",
    "кранUA",
  ],
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: "KranUA",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={inter.variable}>
      <body className="min-h-dvh flex flex-col bg-[#F4F4F4]">
        <Header />
        <main className="flex-1 pb-20">{children}</main>
        <BottomNav />
        <StickyCallButton />
      </body>
    </html>
  );
}
