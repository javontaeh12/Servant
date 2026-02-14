import Link from "next/link";
import { Heart, Building2, UtensilsCrossed, ArrowRight } from "lucide-react";

const PREVIEW_SERVICES = [
  {
    name: "Weddings",
    description:
      "Unforgettable menus crafted to match your love story. Elegant plated dinners, lavish buffets, and everything in between.",
    icon: Heart,
  },
  {
    name: "Corporate Events",
    description:
      "Impress clients and celebrate your team with refined southern cuisine that leaves a lasting impression.",
    icon: Building2,
  },
  {
    name: "Private Dining",
    description:
      "Transform any space into a fine dining experience. Chef-quality meals served directly to your table.",
    icon: UtensilsCrossed,
  },
];

export default function ServicesPreview() {
  return (
    <section className="py-24 md:py-32 px-6 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-slate-text">
            Our Specialties
          </h2>
          <div className="w-[60px] h-[2px] bg-primary mx-auto mb-5" />
          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-slate-muted">
            From intimate dinners to grand celebrations, every occasion deserves the elegance of southern hospitality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {PREVIEW_SERVICES.map((service) => (
            <div key={service.name} className="group relative bg-sky/50 border border-sky-deep/50 p-8 lg:p-10 h-full hover:border-primary/30 hover:shadow-lg transition-all duration-500 rounded-sm">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <service.icon className="text-primary mb-6" size={32} strokeWidth={1.5} />
              <h3 className="font-heading text-xl lg:text-2xl font-bold text-slate-text mb-3">
                {service.name}
              </h3>
              <p className="text-slate-muted text-sm leading-relaxed mb-6">
                {service.description}
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-primary text-sm font-bold tracking-wide uppercase group-hover:gap-3 transition-all duration-300"
              >
                Learn More
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/services"
            className="inline-block border border-primary/40 text-primary hover:bg-primary hover:text-white font-heading font-bold text-sm tracking-[0.15em] uppercase px-8 py-3.5 rounded-sm transition-all duration-300"
          >
            View More Specialties
          </Link>
        </div>
      </div>
    </section>
  );
}
