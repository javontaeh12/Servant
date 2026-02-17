import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative flex items-start justify-center overflow-hidden bg-white pt-28 md:pt-28 pb-20 md:pb-28">
      {/* Content */}
      <div className="relative z-10 text-center px-6 sm:px-8 max-w-5xl mx-auto">
        <div className="animate-fade-in-delay-1 mb-20">
          <Image
            src="/logo.png"
            alt="I'm A Servant First LLC - Catering Services"
            width={700}
            height={350}
            className="mx-auto h-48 sm:h-64 md:h-80 w-auto"
            priority
          />
        </div>

        <p className="animate-fade-in-delay-4 text-slate-muted text-base sm:text-lg md:text-xl font-body font-light max-w-2xl mx-auto mb-12 leading-relaxed">
          Upscale southern cuisine, crafted with heart and served with
          excellence. From intimate dinners to grand celebrations.
        </p>

      </div>

    </section>
  );
}
