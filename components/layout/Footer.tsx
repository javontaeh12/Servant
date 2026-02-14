import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { BUSINESS, NAV_LINKS } from "@/lib/constants";
import { readBusiness } from "@/lib/business-storage";

// TikTok icon
function TikTokIcon({ size = 14, className = "" }: { size?: number; className?: string }) {
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

export default async function Footer() {
  const business = await readBusiness();

  const activeSocials = Object.entries(business.socialLinks).filter(
    ([, url]) => url && url.trim() !== ""
  );

  return (
    <footer className="bg-navy">
      <div className="h-[3px] bg-gradient-to-r from-primary-light via-primary to-primary-light" />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Brand */}
          <div>
            <h3 className="font-heading font-bold text-xl text-white tracking-wide mb-4">
              I&apos;m A Servant First LLC
            </h3>
            <p className="text-white/50 text-sm leading-relaxed">
              {BUSINESS.tagline}. Premium southern catering in{" "}
              {business.address}.
            </p>

            {/* Social Icons */}
            {activeSocials.length > 0 && (
              <div className="flex gap-3 mt-5">
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
                      className="w-11 h-11 border border-white/10 flex items-center justify-center hover:border-primary-light/50 hover:bg-white/5 transition-all rounded-sm"
                    >
                      <Icon
                        className="text-primary-light"
                        size={14}
                      />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold tracking-[0.15em] uppercase mb-5">
              Quick Links
            </h4>
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/50 hover:text-primary-light transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin"
                className="text-white/50 hover:text-primary-light transition-colors text-sm"
              >
                Admin
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-xs font-bold tracking-[0.15em] uppercase mb-5">
              Contact
            </h4>
            <div className="flex flex-col gap-4">
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-3 text-white/50 hover:text-primary-light transition-colors text-sm"
              >
                <Phone size={14} className="text-primary-light flex-shrink-0" />
                {business.phone}
              </a>
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-3 text-white/50 hover:text-primary-light transition-colors text-sm"
              >
                <Mail size={14} className="text-primary-light flex-shrink-0" />
                {business.email}
              </a>
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <MapPin size={14} className="text-primary-light flex-shrink-0" />
                {business.address}
              </div>
              <div className="text-white/30 text-xs mt-1">
                <p>{business.hours.weekdays}</p>
                <p>{business.hours.weekends}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-white/30 text-xs tracking-wide">
            &copy; {new Date().getFullYear()} {BUSINESS.name}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
