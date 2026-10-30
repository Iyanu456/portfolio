"use client";

import { useState } from "react";

type PostCoverProps = {
  src?: string;
  alt: string;
  fallbackLabel: string;
  className?: string;
};

function AbstractCover({ label }: { label: string }) {
  return (
    <div
      aria-hidden="true"
      className="relative isolate h-full min-h-[104px] w-full overflow-hidden rounded-lg sm:min-h-[124px]"
      style={{
        background:
          "radial-gradient(circle at 18% 22%, rgba(247,126,76,.9), transparent 31%), radial-gradient(circle at 78% 72%, rgba(120,132,112,.78), transparent 35%), linear-gradient(135deg, #f1e7d7 0%, #e6d6c5 48%, #c8c8b6 100%)",
      }}
    >
      <span className="absolute -right-5 -top-8 h-28 w-28 rounded-full border border-white/70 bg-white/20 sm:h-36 sm:w-36" />
      <span className="absolute -bottom-8 left-[22%] h-24 w-24 rotate-[-24deg] rounded-[42%] border-[12px] border-[#373c34]/75 sm:h-32 sm:w-32" />
      <span className="absolute left-[43%] top-[16%] h-12 w-12 rounded-full bg-[#f9f5ed]/80 mix-blend-soft-light sm:h-16 sm:w-16" />
      <span className="absolute bottom-3 right-3 max-w-[70%] truncate text-[8px] font-medium uppercase tracking-[0.22em] text-neutral-900/60 sm:text-[9px]">
        {label}
      </span>
    </div>
  );
}

export function PostCover({ src, alt, fallbackLabel, className = "" }: PostCoverProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <AbstractCover label={fallbackLabel} />;
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`post-cover-media absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
