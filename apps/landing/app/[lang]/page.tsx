import { notFound } from "next/navigation";
import { hasLocale } from "./dictionaries";
import { Menu } from "../_components/Menu";
import { Hero } from "../_components/Hero";
import { WTFISTHIS } from "../_components/Description";
import { Story } from "../_components/Story";
import { MapPreview } from "../_components/MapPreview";
import { MainContent } from "../_components/MainContent";
import { FAQ } from "../_components/FAQ";
import { Footer } from "../_components/Footer";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  // The dictionary is provided by the layout's LocaleProvider.
  return (
    <div className="bg-[#F5EED2] min-h-screen text-black font-pixel">
      <Menu />
      <Hero />
      <WTFISTHIS />
      <Story />
      <MapPreview />
      <MainContent />
      <FAQ />
      <Footer />
    </div>
  );
}
