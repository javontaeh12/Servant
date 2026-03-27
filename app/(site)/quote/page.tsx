import type { Metadata } from "next";
import QuoteForm from "@/components/quote/QuoteForm";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Request a free, personalized catering quote for your next event. Tell us about your occasion and we'll craft a custom menu just for you.",
};

export default function QuotePage() {
  return (
    <section className="min-h-screen pt-24 md:pt-28 pb-8 px-6 sm:px-8 bg-white">
      <QuoteForm />
    </section>
  );
}
