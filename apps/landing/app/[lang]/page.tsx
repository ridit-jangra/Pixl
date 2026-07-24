import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";
import { LocaleProvider } from "../_components/LocaleProvider";
import { Menu } from "../_components/Menu";
import { Hero } from "../_components/Hero";
import { WTFISTHIS } from "../_components/Description";
import { Story } from "../_components/Story";
import { MainContent } from "../_components/MainContent";
import { FAQ } from "../_components/FAQ";
import { Footer } from "../_components/Footer";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <LocaleProvider dict={dict} lang={lang}>
      <div className="bg-[#F5EED2] min-h-screen text-black font-pixel">
        <Menu />
        <Hero />
        <WTFISTHIS />
        <Story />
        <MainContent />
        <FAQ />
        <Footer />
      </div>
    </LocaleProvider>
  );
}
