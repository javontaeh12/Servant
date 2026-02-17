import Image from "next/image";
import { readGallery } from "@/lib/gallery-storage";

export default async function GallerySection() {
  const { images } = await readGallery();

  if (images.length === 0) return null;

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <section className="py-24 md:py-32 px-6 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-slate-text">
            Our Gallery
          </h2>
          <div className="w-[60px] h-[2px] bg-primary mx-auto mb-5" />
          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-slate-muted">
            A glimpse into our events, signature dishes, and catering setups.
          </p>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {sorted.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-sm aspect-[4/3]"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
