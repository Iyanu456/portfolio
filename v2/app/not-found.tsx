import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-5 py-20 sm:px-8">
      <p className="text-xs uppercase tracking-[0.15em] text-accent">404 · Not found</p>
      <h1 className="mt-4 text-5xl font-medium tracking-editorial sm:text-7xl">This page wandered off.</h1>
      <p className="mt-5 max-w-md text-neutral-600">The page may have moved, or the link might be out of date.</p>
      <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm font-medium hover:text-accent"><ArrowLeft size={14} /> Back home</Link>
    </section>
  );
}
