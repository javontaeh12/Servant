"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { GalleryImage } from "@/lib/types";
import GalleryLightbox from "./GalleryLightbox";

interface GalleryGridProps {
  images: GalleryImage[];
}

export default function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = useCallback((id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => setSelectedIndex(index)}
            aria-label={image.caption ? `View ${image.caption}` : `View gallery image ${index + 1}`}
            className="group relative overflow-hidden rounded-sm aspect-[4/3] cursor-pointer"
          >
            {!loadedImages.has(image.id) && (
              <div className="absolute inset-0 bg-sky animate-pulse" />
            )}
            <Image
              src={image.src}
              alt={image.caption || "Gallery image"}
              fill
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                loadedImages.has(image.id) ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onLoad={() => handleImageLoad(image.id)}
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
