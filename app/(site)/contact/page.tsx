import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import { readBusiness } from "@/lib/business-storage";

// TikTok icon
function TikTokIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

const SOCIAL_ICONS: Record<string, { icon: React.ElementType; label: string }> = {
  facebook: { icon: Facebook, label: "Facebook" },
  instagram: { icon: Instagram, label: "Instagram" },
  twitter: { icon: Twitter, label: "X (Twitter)" },
  tiktok: { icon: TikTokIcon, label: "TikTok" },
  youtube: { icon: Youtube, label: "YouTube" },
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const business = await readBusiness();

  const activeSocials = Object.entries(business.socialLinks).filter(
    ([, url]) => url && url.trim() !== ""
  );

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
                href={`tel:${business.phone}`}
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
                  <p className="text-primary font-bold group-hover:text-primary-dark transition-colors underline underline-offset-2">
                    {business.phone}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-5 group"
              >
                <div className="w-12 h-12 border border-sky-deep bg-sky flex items-center justify-center group-hover:border-primary/30 transition-colors rounded-sm">
                  <Mail
                    className="text-primary"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-muted text-xs tracking-wide uppercase mb-1">
                    Email
                  </p>
                  <p className="text-primary font-bold group-hover:text-primary-dark transition-colors underline underline-offset-2 break-all text-sm sm:text-base">
                    {business.email}
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
                  <p className="text-slate-text font-bold">{business.address}</p>
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
                    {business.hours.weekdays}
                  </p>
                  <p className="text-slate-muted text-sm">
                    {business.hours.weekends}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {activeSocials.length > 0 && (
              <div className="mt-10 pt-8 border-t border-sky-deep">
                <p className="text-slate-muted text-xs tracking-wide uppercase mb-4">
                  Follow Us
                </p>
                <div className="flex gap-3">
                  {activeSocials.map(([key, url]) => {
                    const social = SOCIAL_ICONS[key];
                    if (!social) return null;
                    const Icon = social.icon;
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={social.label}
                        className="w-11 h-11 border border-sky-deep bg-sky flex items-center justify-center hover:border-primary/30 hover:bg-primary/5 transition-all rounded-sm"
                      >
                        <Icon
                          className="text-primary"
                          size={18}
                          strokeWidth={1.5}
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
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
