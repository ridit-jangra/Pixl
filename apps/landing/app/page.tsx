import Image from "next/image";
import { Menu } from "./_components/Menu";
import { Hero } from "./_components/Hero";
import { WTFISTHIS } from "./_components/Description";
import { Story } from "./_components/Story";
import { MainContent } from "./_components/MainContent";
import { FAQ } from "./_components/FAQ";
import { Footer } from "./_components/Footer";

export default function Home() {
  return (
    <div className="bg-[#F5EED2] min-h-screen text-black font-pixel">
      <Menu />
      <Hero />
      <WTFISTHIS />
      <Story />
      <MainContent />
      <FAQ />
      <Footer />
    </div>
  );
}
