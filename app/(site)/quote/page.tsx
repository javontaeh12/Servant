import type { Metadata } from "next";
import { readSiteSettings } from "@/lib/site-settings-storage";
import QuoteForm from "@/components/quote/QuoteForm";
import SimpleQuoteForm from "@/components/quote/SimpleQuoteForm";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Request a free, personalized catering quote for your next event. Tell us about your occasion and we'll craft a custom menu just for you.",
};

export const dynamic = "force-dynamic";

export default async function QuotePage() {
  const settings = await readSiteSettings();
  const useSimple = settings.quoteFormMode === "simple";

  return (
    <section className="min-h-screen pt-24 md:pt-28 pb-8 px-6 sm:px-8 bg-white">
      {useSimple ? <SimpleQuoteForm /> : <QuoteForm />}
    </section>
  );
}
