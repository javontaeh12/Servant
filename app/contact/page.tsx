import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import { BUSINESS } from "@/lib/constants";

export default function ContactPage() {
  return (
    <>
      {/* Page Hero */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 sm:px-8 bg-sky">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="animate-fade-in text-primary text-xs tracking-[0.35em] uppercase mb-5">
            Get In Touch
          </p>
          <h1 className="animate-fade-up-delay-1 font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-slate-text">
            Contact Us
          </h1>
          <div className="animate-line-grow h-[2px] bg-primary mx-auto mt-6" style={{ animationDelay: "0.3s" }} />
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 md:py-28 px-6 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Contact Info */}
          <div>
            <p className="text-primary text-xs tracking-[0.3em] uppercase mb-4">
              Reach Out
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-text mb-6 leading-tight">
              We&apos;d Love to{" "}
              <span className="text-primary italic">Hear From You</span>
            </h2>
            <p className="text-slate-muted text-[15px] leading-[1.8] mb-10">
              Have a question about our services? Planning an event and want to
              explore your options? Reach out and let&apos;s start a
              conversation. We respond within 24 hours.
            </p>

            <div className="space-y-7">
              <a
                href={`tel:${BUSINESS.phone}`}
                className="flex items-center gap-5 group"
              >
                <div className="w-12 h-12 border border-sky-deep bg-sky flex items-center justify-center group-hover:border-primary/30 transition-colors rounded-sm">
                  <Phone
                    className="text-primary"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="text-slate-muted text-xs tracking-wide uppercase mb-1">
                    Phone
                  </p>
                  <p className="text-slate-text font-bold group-hover:text-primary transition-colors">
                    {BUSINESS.phone}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${BUSINESS.email}`}
                className="flex items-center gap-5 group"
              >
                <div className="w-12 h-12 border border-sky-deep bg-sky flex items-center justify-center group-hover:border-primary/30 transition-colors rounded-sm">
                  <Mail
                    className="text-primary"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="text-slate-muted text-xs tracking-wide uppercase mb-1">
                    Email
                  </p>
                  <p className="text-slate-text font-bold group-hover:text-primary transition-colors">
                    {BUSINESS.email}
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-5">
                <div className="w-12 h-12 border border-sky-deep bg-sky flex items-center justify-center rounded-sm">
                  <MapPin
                    className="text-primary"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="text-slate-muted text-xs tracking-wide uppercase mb-1">
                    Location
                  </p>
                  <p className="text-slate-text font-bold">{BUSINESS.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-12 h-12 border border-sky-deep bg-sky flex items-center justify-center rounded-sm">
                  <Clock
                    className="text-primary"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
                <div>
                  <p className="text-slate-muted text-xs tracking-wide uppercase mb-1">
                    Hours
                  </p>
                  <p className="text-slate-text font-bold text-sm">
                    {BUSINESS.hours.weekdays}
                  </p>
                  <p className="text-slate-muted text-sm">
                    {BUSINESS.hours.weekends}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-sky/50 border border-sky-deep/50 p-8 md:p-10 rounded-sm">
            <h3 className="font-heading text-xl font-bold text-slate-text mb-8">
              Send Us a Message
            </h3>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
