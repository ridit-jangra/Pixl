"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "./LocaleProvider";

const LANGS: [string, string][] = [
  ["en", "English"],
  ["fr", "Français"],
  ["es", "Español"],
  ["pt", "Português"],
];

export function LanguageSwitcher() {
  const { dict, lang } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: string) {
    if (next === lang) return;
    // pathname looks like "/fr" or "/fr/whatever" , swap the leading locale.
    const rest = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
    router.push(`/${next}${rest || ""}`);
  }

  return (
    <select
      value={lang}
      onChange={(e) => switchTo(e.target.value)}
      aria-label={dict.menu.language}
      className="cursor-pointer border-2 border-black bg-white px-2 py-1 text-sm font-bold text-black transition-colors hover:bg-[#f4f1ea] sm:text-base"
    >
      {LANGS.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
