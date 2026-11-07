"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, X, ArrowUpRight, Shapes, Layers3, Code2 } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/shelf", label: "The Shelf" },
  { href: "/about", label: "About" },
];

const workLinks = [
  { href: "/work", label: "Overview", description: "A collection of work across disciplines.", icon: ArrowUpRight },
  { href: "/design", label: "Design", description: "Visual identities, campaigns, and digital experiences.", icon: Shapes },
  { href: "/work#architecture", label: "Architecture", description: "Spatial thinking, buildings, and place.", icon: Layers3 },
  { href: "/work#technology", label: "Technology & making", description: "Software, products, and experiments.", icon: Code2 },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);

  const closeMenus = () => {
    setMenuOpen(false);
    setWorkOpen(false);
  };

  return (
    <header className="site-header-shell sticky top-0 z-40 border-b border-line/80 bg-paper/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between px-5 sm:h-[76px] sm:px-8">
        <Link href="/" onClick={closeMenus} className="text-sm font-semibold tracking-[-0.035em] sm:text-base" aria-label="Iyanu Oyerinde home">Iyanu</Link>

        <nav className="hidden items-center gap-7 sm:flex" aria-label="Main navigation">
          {links.slice(0, 2).map((link) => <Link key={link.href} href={link.href} className="text-sm text-neutral-600 transition-colors hover:text-accent">{link.label}</Link>)}
          <div className="relative">
            <button type="button" onClick={() => setWorkOpen((open) => !open)} aria-expanded={workOpen} aria-controls="work-mega-menu" className={`inline-flex items-center gap-1.5 text-sm transition-colors hover:text-accent ${workOpen ? "text-accent" : "text-neutral-600"}`}>
              Work <ChevronDown size={14} className={`transition-transform ${workOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          <Link href="/about" className="text-sm text-neutral-600 transition-colors hover:text-accent">About</Link>
          <Link href="/contact" className="text-sm text-neutral-600 transition-colors hover:text-accent">Contact</Link>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-neutral-700" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => { setMenuOpen((open) => !open); setWorkOpen(false); }}>{menuOpen ? <X size={19}/> : <Menu size={19}/>}</button>
        </div>
      </div>

      {workOpen && <div id="work-mega-menu" className="absolute left-0 right-0 top-full hidden border-b border-line bg-paper shadow-xl sm:block">
        <div className="mx-auto max-w-6xl px-8 py-7">
          <div className="mb-6 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">Explore</p>
            <h2 className="mt-2 text-xl font-medium tracking-tight">Work across disciplines</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {workLinks.map(({ href, label, description, icon: Icon }) => (
              <Link key={href} href={href} onClick={closeMenus} className="group rounded-lg p-4 transition-colors hover:bg-neutral-100/80">
                <Icon size={18} strokeWidth={1.6} className="mb-4 text-accent" />
                <h3 className="text-sm font-semibold text-ink transition-colors group-hover:text-accent">{label}</h3>
                <p className="mt-1.5 text-xs leading-5 text-neutral-500">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>}

      {menuOpen && <nav className="border-t border-line bg-paper px-5 py-3 shadow-lg sm:hidden" aria-label="Mobile navigation">
        {links.slice(0, 2).map((link) => <Link key={link.href} href={link.href} onClick={closeMenus} className="block rounded-lg px-3 py-3 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-accent">{link.label}</Link>)}
        <div className="rounded-lg">
          <button type="button" onClick={() => setWorkOpen((open) => !open)} aria-expanded={workOpen} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-accent">
            Work <ChevronDown size={15} className={`transition-transform ${workOpen ? "rotate-180" : ""}`} />
          </button>
          {workOpen && <div className="mb-2 ml-3 border-l border-line pl-3">
            {workLinks.map(({ href, label, description }) => <Link key={href} href={href} onClick={closeMenus} className="block rounded-md px-3 py-2.5 hover:bg-neutral-100">
              <span className="block text-sm font-medium text-ink">{label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-neutral-500">{description}</span>
            </Link>)}
          </div>}
        </div>
        <Link href="/about" onClick={closeMenus} className="block rounded-lg px-3 py-3 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-accent">About</Link>
        <Link href="/contact" onClick={closeMenus} className="block rounded-lg px-3 py-3 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-accent">Contact</Link>
      </nav>}
    </header>
  );
}
