import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { detectLocale, getDict } from "../lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const hdrs = await headers();
  const locale = detectLocale(hdrs.get("accept-language"));
  const t = getDict(locale);
  return {
    title: t.siteTitle,
    description: t.siteDescription,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hdrs = await headers();
  const locale = detectLocale(hdrs.get("accept-language"));

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body data-locale={locale}>{children}</body>
    </html>
  );
}
