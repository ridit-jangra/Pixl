"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("pixl_theme");
    setDark(t !== "light");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const cls = "dark";
    if (next) {
      document.documentElement.classList.add(cls);
      localStorage.setItem("pixl_theme", "dark");
    } else {
      document.documentElement.classList.remove(cls);
      localStorage.setItem("pixl_theme", "light");
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="size-8">
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
