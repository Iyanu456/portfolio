import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "oyerindei13@gmail.com";
const substackUrl = "https://substack.com/@byiyanu";

export function SiteFooter() {
  return (
    <footer className="site-footer-shell border-t border-line relative z-[-10]">
      <div className="mx-auto z-20 flex max-w-6xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="z-20">
          <p className="text-sm font-semibold tracking-tight ">Iyanu Oyerinde</p>
           <p className="mt-1 text-sm text-neutral-500">{contactEmail}</p>
        </div>
        <div className="flex items-center gap-5 text-xs text-neutral-500">
          <Link href="/shelf" className="hover:text-ink">Shelf</Link>
          <Link href="/about" className="hover:text-ink">About</Link>
          <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-1 hover:text-ink">
            Email <ArrowUpRight size={12} />
          </a>
          {/*<a href={substackUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-ink">
            Substack <ArrowUpRight size={12} />
          </a>*/}
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
