"use client";

import { createContext, useContext } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dict = Record<string, any>;

const LocaleContext = createContext<Dict>({});

export function LocaleProvider({
  dict,
  lang,
  children,
}: {
  dict: Dict;
  lang: string;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ dict, lang }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) return { dict: {} as Dict, lang: "en" };
  return ctx as { dict: Dict; lang: string };
}
