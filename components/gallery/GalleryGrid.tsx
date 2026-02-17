"use client";

import { useState } from "react";
import Image from "next/image";
import { GalleryImage } from "@/lib/types";
import GalleryLightbox from "./GalleryLightbox";

interface GalleryGridProps {
  images: GalleryImage[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            className="group relative overflow-hidden rounded-sm aspect-[4/3] cursor-pointer"
          >
            <Image
              src={image.src}
              alt={image.caption || "Gallery image"}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {image.caption && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white text-sm font-medium p-4 font-body">
                  {image.caption}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      <GalleryLightbox
        images={images}
        selectedIndex={selectedIndex}
        onClose={() => setSelectedIndex(null)}
        onNavigate={setSelectedIndex}
      />
    </>
  );
}
