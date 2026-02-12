import { MapPin, Car } from "lucide-react";

const SERVICE_AREAS = [
  "Dallas",
  "Fort Worth",
  "Arlington",
  "Plano",
  "Irving",
  "Garland",
  "Grand Prairie",
  "McKinney",
  "Frisco",
  "Denton",
];

export default function ServiceArea() {
  return (
    <section className="py-24 md:py-32 px-6 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Info */}
          <div>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-slate-text">
              Our Service Area
            </h2>
            <div className="w-[60px] h-[2px] bg-primary mb-6" />
            <p className="text-base md:text-lg leading-relaxed text-slate-muted mb-8">
              We proudly serve the Dallas-Fort Worth metroplex and surrounding areas.
              Our team brings authentic southern cuisine directly to your venue,
              whether it&apos;s a backyard gathering or an elegant ballroom.
            </p>
            <div className="flex items-center gap-3 text-slate-muted mb-4">
              <Car className="text-primary" size={24} strokeWidth={1.5} />
              <span className="text-sm">Travel fees may apply for locations outside DFW</span>
            </div>
          </div>

          {/* Right side - Areas list */}
          <div className="bg-sky/50 border border-sky-deep/50 p-8 lg:p-10 rounded-sm">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="text-primary" size={28} strokeWidth={1.5} />
              <h3 className="font-heading text-xl lg:text-2xl font-bold text-slate-text">
                Areas We Serve
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SERVICE_AREAS.map((area) => (
                <div
                  key={area}
                  className="flex items-center gap-2 text-slate-muted"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-muted mt-6 pt-6 border-t border-sky-deep/30">
              Don&apos;t see your area? Contact us — we may still be able to serve you!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
