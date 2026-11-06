"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { usePathname } from "next/navigation";

const THEME_STORAGE_KEY = "iyanu-theme";

function getStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export default function ThemeToggle() {
  const pathname = usePathname();
  const isArticlePage = /^\/shelf\/[^/]+\/?$/.test(pathname ?? "");
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => {
      if (!isArticlePage) {
        applyTheme(false);
        setIsDark(false);
        setMounted(true);
        return;
      }

      const savedTheme = getStoredTheme();
      const nextIsDark = savedTheme ? savedTheme === "dark" : media.matches;
      applyTheme(nextIsDark);
      setIsDark(nextIsDark);
      setMounted(true);
    };
    const handleSystemThemeChange = () => {
      if (isArticlePage && getStoredTheme() === null) syncTheme();
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);
    media.addEventListener("change", handleSystemThemeChange);
    return () => {
      window.removeEventListener("storage", syncTheme);
      media.removeEventListener("change", handleSystemThemeChange);
    };
  }, [isArticlePage]);

  function toggleTheme() {
    if (!isArticlePage) return;
    const nextIsDark = !document.documentElement.classList.contains("dark");
    applyTheme(nextIsDark);
    setIsDark(nextIsDark);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? "dark" : "light");
    } catch {
      // The selected theme remains active for this page when storage is unavailable.
    }
  }

  if (!isArticlePage) return null;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-ink"
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle color theme"}
      title={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle color theme"}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
