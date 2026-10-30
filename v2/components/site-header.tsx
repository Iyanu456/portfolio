import Link from "next/link";
const links = [
  { href: "/", label: "Home" },
  { href: "/shelf", label: "The_Shelf" },
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" }
];

export function SiteHeader() {
  return (
    <header className="site-header-shell sticky top-0 z-40 border-b border-line/80 bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" aria-label="Iyanu Oyerinde home">
          {/*<span className="site-header-mark flex h-9 w-9 items-center justify-center rounded-full bg-ink text-xs font-bold tracking-[-0.08em] text-white">
            IO
          </span>*/}
          <span className="text-sm font-semibold tracking-[-0.035em] sm:text-base">Iyanu</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-7" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs text-neutral-600 transition-colors hover:text-accent sm:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
