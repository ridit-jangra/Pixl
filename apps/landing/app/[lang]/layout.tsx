import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SmoothScroll } from "../_components/SmoothScroll";
import { EasterEgg } from "../_components/EasterEgg";
import { LocaleProvider } from "../_components/LocaleProvider";
import { defaultLocale, getDictionary, hasLocale, locales } from "./dictionaries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(hasLocale(lang) ? lang : defaultLocale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  // The layout renders before the page's notFound() check, so fall back to the
  // default dictionary rather than throwing on an unknown locale segment.
  const locale = hasLocale(lang) ? lang : defaultLocale;
  const dict = await getDictionary(locale);
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex flex-col">
        <LocaleProvider dict={dict} lang={locale}>
          <SmoothScroll>{children}</SmoothScroll>
          <EasterEgg />
        </LocaleProvider>
      </body>
    </html>
  );
}
