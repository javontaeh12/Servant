import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { BUSINESS, NAV_LINKS } from "@/lib/constants";

export default function Footer() {
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
              {BUSINESS.address}.
            </p>
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
                href={`tel:${BUSINESS.phone}`}
                className="flex items-center gap-3 text-white/50 hover:text-primary-light transition-colors text-sm"
              >
                <Phone size={14} className="text-primary-light flex-shrink-0" />
                {BUSINESS.phone}
              </a>
              <a
                href={`mailto:${BUSINESS.email}`}
                className="flex items-center gap-3 text-white/50 hover:text-primary-light transition-colors text-sm"
              >
                <Mail size={14} className="text-primary-light flex-shrink-0" />
                {BUSINESS.email}
              </a>
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <MapPin size={14} className="text-primary-light flex-shrink-0" />
                {BUSINESS.address}
              </div>
              <div className="text-white/30 text-xs mt-1">
                <p>{BUSINESS.hours.weekdays}</p>
                <p>{BUSINESS.hours.weekends}</p>
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
