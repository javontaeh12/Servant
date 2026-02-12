import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative flex items-start justify-center overflow-hidden bg-white pt-36 md:pt-40 pb-20 md:pb-28">
      {/* Content */}
      <div className="relative z-10 text-center px-6 sm:px-8 max-w-5xl mx-auto">
        <div className="animate-fade-in-delay-1 mb-8">
          <Image
            src="/logo.png"
            alt="I'm A Servant First LLC - Catering Services"
            width={500}
            height={250}
            className="mx-auto h-32 sm:h-44 md:h-56 w-auto"
            priority
          />
        </div>

        <p className="animate-fade-in-delay-4 text-slate-muted text-base sm:text-lg md:text-xl font-body font-light max-w-2xl mx-auto mb-12 leading-relaxed">
          Upscale southern cuisine, crafted with heart and served with
          excellence. From intimate dinners to grand celebrations.
        </p>

        <div className="animate-fade-up-delay-5 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/quote"
            className="bg-primary hover:bg-primary-dark text-white font-heading font-bold text-sm tracking-[0.15em] uppercase px-10 py-4 rounded-sm transition-all duration-300"
          >
            Request a Quote
          </Link>
          <Link
            href="/services"
            className="border border-primary/30 hover:border-primary text-primary font-heading font-bold text-sm tracking-[0.15em] uppercase px-10 py-4 rounded-sm transition-all duration-300"
          >
            Our Services
          </Link>
        </div>
      </div>

    </section>
  );
}
