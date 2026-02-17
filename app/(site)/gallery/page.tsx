import { GalleryConfig } from "@/lib/types";
import { readGallery } from "@/lib/gallery-storage";
import GalleryGrid from "@/components/gallery/GalleryGrid";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const { images } = await readGallery();
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {/* Page Hero */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 sm:px-8 bg-sky">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="animate-fade-in text-primary text-xs tracking-[0.35em] uppercase mb-5">
            Our Work
          </p>
          <h1 className="animate-fade-up-delay-1 font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-slate-text">
            Gallery
          </h1>
          <div
            className="animate-line-grow h-[2px] bg-primary mx-auto mt-6"
            style={{ animationDelay: "0.3s" }}
          />
          <p className="mt-6 text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-slate-muted">
            A glimpse into our events, signature dishes, and catering setups.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-24 md:py-32 px-6 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          {sorted.length > 0 ? (
            <GalleryGrid images={sorted} />
          ) : (
            <p className="text-center text-slate-muted text-lg">
              Gallery coming soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
