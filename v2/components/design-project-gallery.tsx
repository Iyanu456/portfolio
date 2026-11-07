"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = { src: string; alt: string };
type ImageShape = "portrait" | "square" | "landscape";

export default function DesignProjectGallery({ images }: { images: GalleryImage[] }) {
  const [shapes, setShapes] = useState<Record<string, ImageShape>>({});
  if (!images.length) return null;

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
      {images.map((image, index) => {
        const shape = shapes[image.src] || "portrait";
        const landscape = shape === "landscape";
        const ratio = shape === "square" ? "1 / 1" : shape === "landscape" ? "16 / 9" : "4 / 5";
        return (
          <div key={`${image.src}-${index}`} className={`relative w-full overflow-hidden bg-[#efeee9] ${landscape ? "sm:col-span-2" : "sm:col-span-1"}`} style={{ aspectRatio: ratio }}>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={landscape ? "(max-width: 640px) 100vw, 100vw" : "(max-width: 640px) 100vw, 50vw"}
              className="object-contain"
              unoptimized
              onLoad={(event) => {
                const { naturalWidth, naturalHeight } = event.currentTarget;
                const nextShape: ImageShape = naturalWidth / naturalHeight > 1.15 ? "landscape" : naturalWidth / naturalHeight < 0.88 ? "portrait" : "square";
                setShapes((current) => current[image.src] === nextShape ? current : { ...current, [image.src]: nextShape });
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
