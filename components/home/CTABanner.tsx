import Link from "next/link";

export default function CTABanner() {
  return (
    <section className="relative py-24 md:py-28 px-6 sm:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-primary" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
          Ready to Elevate Your Event?
        </h2>
        <p className="text-white/75 text-lg mb-10 font-body max-w-xl mx-auto">
          Let us bring the taste of upscale southern cuisine to your next
          gathering. Every event deserves to be unforgettable.
        </p>
        <Link
          href="/quote"
          className="inline-block bg-white text-primary hover:bg-sky font-heading font-bold text-sm tracking-[0.15em] uppercase px-10 py-4 rounded-sm transition-all duration-300"
        >
          Get Your Free Quote
        </Link>
      </div>
    </section>
  );
}
