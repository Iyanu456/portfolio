"use client";

import { ArrowRight } from "lucide-react";
import { openSupportModal } from "@/components/support-payment-modal";

export default function SubstackSupportActions() {
  return (
    <button
      type="button"
      onClick={() => openSupportModal("substack")}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
    >
      Support my work <ArrowRight size={16} />
    </button>
  );
}
