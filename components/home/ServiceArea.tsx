import { MapPin, Car } from "lucide-react";

const NEARBY_COUNTIES = [
  "Duplin County (Home Base)",
  "Wayne County (Goldsboro)",
  "Lenoir County (Kinston)",
  "Jones County",
  "Onslow County",
  "Pender County",
  "Sampson County",
  "Greene County",
];

const REGIONAL_COUNTIES = [
  "New Hanover County (Wilmington)",
  "Craven County (New Bern)",
  "Pitt County (Greenville)",
  "Wilson County",
  "Johnston County (Smithfield/Clayton)",
  "Cumberland County (Fayetteville)",
  "Harnett County",
  "Edgecombe County",
  "Halifax County",
  "Bertie County",
  "Beaufort County",
  "Pamlico County",
  "Carteret County",
];

const EXTENDED_COUNTIES = [
  "Wake County (Raleigh)",
  "Durham County",
  "Chatham County",
  "Alamance County (Burlington)",
  "Guilford County (Greensboro)",
  "Forsyth County (Winston-Salem)",
  "Mecklenburg County (Charlotte)",
];

export default function ServiceArea() {
  return (
    <section className="py-24 md:py-32 px-6 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-slate-text">
            Our Service Area
          </h2>
          <div className="w-[60px] h-[2px] bg-primary mx-auto mb-5" />
          <p className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-slate-muted mb-6">
            Based in Duplin County, North Carolina, we proudly serve Eastern NC
            and surrounding regions. Our team brings authentic southern cuisine
            directly to your venue, whether it&apos;s a backyard gathering or
            an elegant ballroom.
          </p>
          <div className="flex items-center justify-center gap-3 text-slate-muted">
            <Car className="text-primary" size={20} strokeWidth={1.5} />
            <span className="text-sm">
              Travel fees may apply for extended service area locations
            </span>
          </div>
        </div>

        {/* Service Area Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Nearby Counties */}
          <div className="bg-sky/50 border border-sky-deep/50 p-8 rounded-sm">
            <div className="flex items-center gap-3 mb-5">
              <MapPin className="text-primary" size={24} strokeWidth={1.5} />
              <h3 className="font-heading text-lg font-bold text-slate-text">
                Duplin County &amp; Neighbors
              </h3>
            </div>
            <div className="space-y-3">
              {NEARBY_COUNTIES.map((area) => (
                <div
                  key={area}
                  className="flex items-center gap-2 text-slate-muted"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Counties */}
          <div className="bg-sky/50 border border-sky-deep/50 p-8 rounded-sm">
            <div className="flex items-center gap-3 mb-5">
              <MapPin className="text-primary" size={24} strokeWidth={1.5} />
              <h3 className="font-heading text-lg font-bold text-slate-text">
                Regional Service Area
              </h3>
            </div>
            <div className="space-y-3">
              {REGIONAL_COUNTIES.map((area) => (
                <div
                  key={area}
                  className="flex items-center gap-2 text-slate-muted"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Extended Counties */}
          <div className="bg-sky/50 border border-sky-deep/50 p-8 rounded-sm">
            <div className="flex items-center gap-3 mb-5">
              <MapPin className="text-primary" size={24} strokeWidth={1.5} />
              <h3 className="font-heading text-lg font-bold text-slate-text">
                Extended Service Area
              </h3>
            </div>
            <div className="space-y-3">
              {EXTENDED_COUNTIES.map((area) => (
                <div
                  key={area}
                  className="flex items-center gap-2 text-slate-muted"
                >
                  <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                  <span className="text-sm">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-muted mt-8">
          Don&apos;t see your area? Contact us — we may still be able to serve you!
        </p>
      </div>
    </section>
  );
}
