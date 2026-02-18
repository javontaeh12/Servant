import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Building2,
  UtensilsCrossed,
  PartyPopper,
  Church,
  HandHeart,
  Cake,
  Users,
  Gift,
  GraduationCap,
  School,
  Check,
} from "lucide-react";
import { SERVICES } from "@/lib/constants";
import { readSpecialtyImages } from "@/lib/specialty-storage";

const ICON_MAP: Record<string, React.ElementType> = {
  Heart,
  Building2,
  UtensilsCrossed,
  PartyPopper,
  Church,
  HandHeart,
  Cake,
  Users,
  Gift,
  GraduationCap,
  School,
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const specialtyImages = await readSpecialtyImages();
  return (
    <>
      {/* Page Hero */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6 sm:px-8 bg-sky">
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <p className="animate-fade-in text-primary text-xs tracking-[0.35em] uppercase mb-5">
            Our Specialties
          </p>
          <h1 className="animate-fade-up-delay-1 font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-slate-text">
            Our Specialties
          </h1>
          <div className="animate-line-grow h-[2px] bg-primary mx-auto mt-6" style={{ animationDelay: "0.3s" }} />
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 md:py-28 px-6 sm:px-8 bg-white">
        <div className="max-w-6xl mx-auto space-y-20 md:space-y-32">
          {SERVICES.map((service, i) => {
            const Icon = ICON_MAP[service.icon] || Heart;
            const isEven = i % 2 === 1;

            return (
              <div key={service.name}>
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center`}
                >
                  {/* Image */}
                  <div className={isEven ? "md:order-2" : ""}>
                    <div className="aspect-video bg-sky border border-sky-deep relative overflow-hidden rounded-sm">
                      {specialtyImages[service.name] ? (
                        <Image
                          src={specialtyImages[service.name]}
                          alt={service.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon
                            className="text-primary/10"
                            size={64}
                            strokeWidth={1}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={isEven ? "md:order-1" : ""}>
                    <div className="flex items-center gap-3 mb-5">
                      <Icon
                        className="text-primary"
                        size={22}
                        strokeWidth={1.5}
                      />
                      <h3 className="font-heading text-2xl md:text-3xl font-bold text-slate-text">
                        {service.name}
                      </h3>
                    </div>

                    <p className="text-slate-muted text-[15px] leading-[1.8] mb-7">
                      {service.description}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {service.included.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-slate-muted text-sm"
                        >
                          <Check
                            size={14}
                            className="text-primary mt-1 flex-shrink-0"
                            strokeWidth={2}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/quote?service=${encodeURIComponent(service.name)}`}
                      className="inline-block border border-primary/40 text-primary hover:bg-primary hover:text-white font-heading font-bold text-xs tracking-[0.15em] uppercase px-7 py-3 rounded-sm transition-all duration-300"
                    >
                      Request Quote
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Note */}
      <section className="py-20 md:py-28 px-6 sm:px-8 bg-sky/50">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-slate-text mb-5">
            Every Event is Unique
          </h3>
          <div className="w-10 h-[2px] bg-primary mx-auto mb-6" />
          <p className="text-slate-muted text-[15px] leading-[1.8] mb-10">
            We believe every celebration deserves a custom touch. Contact us
            for a personalized quote tailored to your vision, guest count, and
            preferences. No event is too big or too small.
          </p>
          <Link
            href="/quote"
            className="inline-block bg-primary text-white hover:bg-primary-dark font-heading font-bold text-sm tracking-[0.15em] uppercase px-10 py-4 rounded-sm transition-all duration-300"
          >
            Get Your Free Quote
          </Link>
        </div>
      </section>
    </>
  );
}
