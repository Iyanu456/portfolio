"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
const links = [{ href: "/", label: "Home" }, { href: "/shelf", label: "The Shelf" }, { href: "/work", label: "Work" }, { href: "/about", label: "About" }];
export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="site-header-shell sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur-xl">
    <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between px-5 sm:h-[76px] sm:px-8">
      <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm font-semibold tracking-[-0.035em] sm:text-base" aria-label="Iyanu Oyerinde home">Iyanu</Link>
      <nav className="hidden items-center gap-7 sm:flex" aria-label="Main navigation">{links.map(link => <Link key={link.href} href={link.href} className="text-sm text-neutral-600 transition-colors hover:text-accent">{link.label}</Link>)}<ThemeToggle /></nav>
      <div className="flex items-center gap-2 sm:hidden">
        <ThemeToggle />
        <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-neutral-700" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X size={19}/> : <Menu size={19}/>}</button>
      </div>
    </div>
    {menuOpen && <nav className="border-t border-line bg-paper px-5 py-3 shadow-lg sm:hidden" aria-label="Mobile navigation">{links.map(link => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-accent">{link.label}</Link>)}</nav>}
  </header>;
}
