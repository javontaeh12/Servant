import QuoteForm from "@/components/quote/QuoteForm";
import QuoteFAQ from "@/components/quote/QuoteFAQ";

export default function QuotePage() {
  return (
    <>
      {/* Page Hero */}
      <section className="relative pt-36 pb-12 md:pt-44 md:pb-16 px-6 sm:px-8 bg-sky">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="animate-fade-in text-primary text-xs tracking-[0.35em] uppercase mb-5">
            Let&apos;s Plan Together
          </p>
          <h1 className="animate-fade-up-delay-1 font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-slate-text">
            Request a Quote
          </h1>
          <div className="animate-line-grow h-[2px] bg-primary mx-auto mt-6 mb-5" style={{ animationDelay: "0.3s" }} />
          <p className="animate-fade-in-delay-3 text-slate-muted max-w-lg mx-auto text-[15px]">
            Tell us about your event and we&apos;ll create a personalized
            catering experience just for you.
          </p>
        </div>
      </section>

      {/* Quote Form */}
      <section className="py-12 pb-28 md:py-16 md:pb-36 px-6 sm:px-8 bg-white">
        <QuoteForm />
      </section>

      {/* FAQ */}
      <QuoteFAQ />
    </>
  );
}
